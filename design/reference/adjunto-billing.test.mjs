import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createLedger, subscribe, upgrade, cancel, refund,
  ledgerNet, allAmountsCanonical, InvalidPriceError, InvalidTransitionError,
} from './adjunto-billing.mjs';

// The 8 test cases from ADJUNTO-BILLING-LAW.md, in doc order.

test('case 1: subscribe->upgrade nets standing 999 (rows +499,-499,+999)', () => {
  let state = createLedger();
  ({ state } = subscribe(state, { customerId: 'c1', idempotencyKey: 'sub-1' }));
  let rows;
  ({ state, rows } = upgrade(state, { customerId: 'c1', idempotencyKey: 'up-1' }));

  assert.deepEqual(state.rows.map((r) => r.amount), [499, -499, 999]);
  assert.equal(rows.length, 2);
  assert.equal(state.customers.c1.status, 'team');
  assert.equal(state.customers.c1.net, 999);
  assert.equal(ledgerNet(state, 'c1'), 999);
  assert.ok(allAmountsCanonical(state));
});

test('case 2: subscribe->upgrade->cancel nets 0, never a 499-paid team stint', () => {
  let state = createLedger();
  ({ state } = subscribe(state, { customerId: 'c1', idempotencyKey: 'sub-1' }));
  ({ state } = upgrade(state, { customerId: 'c1', idempotencyKey: 'up-1' }));
  // at no point does a "team" customer carry a net of 499 — it jumps 499 -> 999 atomically
  assert.equal(state.customers.c1.status, 'team');
  assert.equal(state.customers.c1.net, 999);
  ({ state } = cancel(state, { customerId: 'c1', idempotencyKey: 'cx-1' }));

  assert.deepEqual(state.rows.map((r) => r.amount), [499, -499, 999, -999]);
  assert.equal(ledgerNet(state, 'c1'), 0);
  assert.equal(state.customers.c1.net, 0);
  assert.equal(state.customers.c1.status, 'none');
  assert.ok(allAmountsCanonical(state));

  // arbitrage repro flavor (v1.4 B5): distinct customer ids over the same shared ledger, 1 cycle vs 3
  // cycles of subscribe->upgrade->cancel; per-cycle standing net must only ever be 0 or 999, never 499
  // stuck on a "team" stint.
  let arb = createLedger();
  for (const [customerId, cycles] of [['single', 1], ['repeat', 3]]) {
    for (let i = 0; i < cycles; i += 1) {
      ({ state: arb } = subscribe(arb, { customerId, idempotencyKey: `sub-${customerId}-${i}` }));
      ({ state: arb } = upgrade(arb, { customerId, idempotencyKey: `up-${customerId}-${i}` }));
      assert.equal(arb.customers[customerId].net, 999);
      ({ state: arb } = cancel(arb, { customerId, idempotencyKey: `cx-${customerId}-${i}` }));
      assert.equal(arb.customers[customerId].net, 0);
    }
  }
  assert.ok(allAmountsCanonical(arb));
});

test('case 3: hand-crafted 500 refund -> InvalidPrice', () => {
  let state = createLedger();
  ({ state } = subscribe(state, { customerId: 'c1', idempotencyKey: 'sub-1' }));
  assert.throws(
    () => refund(state, { customerId: 'c1', amount: 500, idempotencyKey: 'r-500' }),
    (err) => err instanceof InvalidPriceError && err.code === 'InvalidPrice',
  );
});

test('case 4: upgrade from free -> InvalidTransition', () => {
  const state = createLedger();
  assert.throws(
    () => upgrade(state, { customerId: 'nobody', idempotencyKey: 'up-x' }),
    (err) => err instanceof InvalidTransitionError && err.code === 'InvalidTransition',
  );
});

test('case 5: double upgrade -> InvalidTransition (already top tier)', () => {
  let state = createLedger();
  ({ state } = subscribe(state, { customerId: 'c1', idempotencyKey: 'sub-1' }));
  ({ state } = upgrade(state, { customerId: 'c1', idempotencyKey: 'up-1' }));
  assert.throws(
    () => upgrade(state, { customerId: 'c1', idempotencyKey: 'up-2' }),
    (err) => err instanceof InvalidTransitionError && err.code === 'InvalidTransition',
  );
});

test('case 6: cancel from canceled -> InvalidTransition', () => {
  let state = createLedger();
  ({ state } = subscribe(state, { customerId: 'c1', idempotencyKey: 'sub-1' }));
  ({ state } = cancel(state, { customerId: 'c1', idempotencyKey: 'cx-1' }));
  assert.throws(
    () => cancel(state, { customerId: 'c1', idempotencyKey: 'cx-2' }),
    (err) => err instanceof InvalidTransitionError && err.code === 'InvalidTransition',
  );
});

test('case 7: refund exceeding net -> InvalidTransition', () => {
  let state = createLedger();
  ({ state } = subscribe(state, { customerId: 'c1', idempotencyKey: 'sub-1' })); // net 499
  assert.throws(
    () => refund(state, { customerId: 'c1', amount: 999, idempotencyKey: 'r-999' }),
    (err) => err instanceof InvalidTransitionError && err.code === 'InvalidTransition',
  );
});

test('case 8: idempotent replay of a team-charge key returns the original row, never double-posts', () => {
  let state = createLedger();
  ({ state } = subscribe(state, { customerId: 'c1', idempotencyKey: 'sub-1' }));
  let firstRows;
  ({ state, rows: firstRows } = upgrade(state, { customerId: 'c1', idempotencyKey: 'team-charge-key' }));
  const rowCountAfterFirst = state.rows.length;

  let replayRows;
  ({ state, rows: replayRows } = upgrade(state, { customerId: 'c1', idempotencyKey: 'team-charge-key' }));

  assert.equal(state.rows.length, rowCountAfterFirst, 'replay must not post new rows');
  assert.deepEqual(replayRows, firstRows, 'replay returns the original rows verbatim');
  assert.equal(state.customers.c1.net, 999, 'replay does not double-charge');
});

// Supplementary coverage beyond the 8 named cases: the invariant clause itself.
test('amount-set invariant holds across a short randomized-shaped op sequence', () => {
  let state = createLedger();
  const ids = ['a', 'b', 'c'];
  const ops = [
    ['subscribe', 'a'], ['subscribe', 'b'], ['upgrade', 'a'], ['cancel', 'a'],
    ['subscribe', 'c'], ['upgrade', 'c'], ['subscribe', 'a'], ['cancel', 'b'],
  ];
  let n = 0;
  for (const [op, id] of ops) {
    n += 1;
    const idempotencyKey = `${op}-${id}-${n}`;
    if (op === 'subscribe') ({ state } = subscribe(state, { customerId: id, idempotencyKey }));
    if (op === 'upgrade') ({ state } = upgrade(state, { customerId: id, idempotencyKey }));
    if (op === 'cancel') ({ state } = cancel(state, { customerId: id, idempotencyKey }));
  }
  assert.ok(allAmountsCanonical(state));
  for (const id of ids) {
    assert.equal(ledgerNet(state, id), state.customers[id]?.net ?? 0);
    const net = state.customers[id]?.net ?? 0;
    assert.ok(net === 0 || net === 499 || net === 999);
  }
});

test('denial: module exposes no send/dispatch/charge-to-a-real-processor export', async () => {
  const mod = await import('./adjunto-billing.mjs');
  const exportNames = Object.keys(mod);
  assert.ok(!exportNames.some((n) => /send|dispatch|stripe|http|fetch/i.test(n)), 'no external-call-capable export exists');
});
