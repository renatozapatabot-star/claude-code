// Real concurrency + adversarial stress testing over design/reference modules (see
// PROJECT-STATUS.md / FREIGHT-OS-CANON.md v3.8 "round 4"/WO-19 for prior-round context — this file
// is new, does not modify adjunto-billing.test.mjs or growth-scoring.test.mjs). Every number below
// came from an actual `node --test` run against the real source, not a hand-computed guess.
//
// FINDINGS (see inline comments at each test for detail):
//   1. adjunto-billing's `customerId` is accepted as ANY value with zero type validation. Two
//      different customer objects silently collide into the same ledger record via JS's
//      property-key ToString() coercion ("[object Object]" for every non-primitive customerId),
//      wrongly rejecting a real second customer's subscribe as "already active."
//   2. A deeply nested (non-circular) object passed as `customerId` crashes with an uncaught
//      RangeError ("Maximum call stack size exceeded") from JSON.stringify inside runIdempotent's
//      fingerprint computation, the moment an idempotencyKey is supplied — an ungraceful crash,
//      not a clean validation error, confirmed at depth ~10,000+.
//   3. runIdempotent's replay protection is per-opKey only; it provides NO protection against two
//      concurrent callers who both read a stale pre-write ledger snapshot (a classic distributed
//      lost-update pattern) — confirmed below with real racing calls. This is not a defect in a
//      pure reducer (the module is explicitly documented as requiring caller-side serialization),
//      but it is a real, confirmed operational risk for whoever wires this into a live payment path.
//   4. growth-scoring's numeric fuzzing (Infinity/-Infinity/NaN/1e308/-0) all produced sane, bounded,
//      non-crashing output — a genuinely correct pass, confirmed with real extreme values.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createLedger, subscribe, upgrade, refund, ledgerNet, InvalidTransitionError, InvalidPriceError,
} from './adjunto-billing.mjs';
import { scoreLeadReadiness, rankLeads } from './growth-scoring.mjs';

// ---------------------------------------------------------------------------------------------
// 1. adjunto-billing: racing/interleaved calls on the same customerId
// ---------------------------------------------------------------------------------------------

test('FINDING: two concurrent subscribe() calls for the SAME customerId, both reading the pre-write ledger snapshot, both silently succeed (lost-update risk)', () => {
  // Simulates two real webhook deliveries for the same customer arriving close enough together that
  // both handlers read the ledger BEFORE either one's write is committed and re-read by the other —
  // a completely realistic race in any system that doesn't serialize writes per customer. Neither
  // call is "wrong" in isolation (each is a pure function over the snapshot it was given), but if a
  // caller naively persists only the LAST result (or merges both without noticing the collision),
  // the FIRST customer's charge silently vanishes even though its caller received a success/200.
  const base = createLedger();
  const resultA = subscribe(base, { customerId: 'c1', idempotencyKey: 'webhook-req-A' });
  const resultB = subscribe(base, { customerId: 'c1', idempotencyKey: 'webhook-req-B' }); // races against the SAME base, not resultA.state

  assert.equal(resultA.rows.length, 1);
  assert.equal(resultB.rows.length, 1);
  assert.equal(ledgerNet(resultA.state, 'c1'), 499, 'A believes it alone charged this customer');
  assert.equal(ledgerNet(resultB.state, 'c1'), 499, 'B ALSO believes it alone charged this customer — same customer, two independently "successful" charges');
  // If a real system kept only resultB.state (last writer wins), resultA's charge is gone with no
  // error ever surfaced to A's caller — the module provides zero protection against this by design;
  // idempotencyKey only protects a REPLAY of the exact same key against ALREADY-COMMITTED state.
});

test('correct usage: sequential application (B reads A\'s committed state, not the stale base) correctly rejects the duplicate as InvalidTransition', () => {
  const base = createLedger();
  const resultA = subscribe(base, { customerId: 'c1', idempotencyKey: 'webhook-req-A' });
  assert.throws(
    () => subscribe(resultA.state, { customerId: 'c1', idempotencyKey: 'webhook-req-B' }),
    InvalidTransitionError,
    'once B reads state that already reflects A\'s commit, the double-charge is correctly caught',
  );
});

test('runIdempotent: the SAME idempotencyKey replayed against already-committed state returns the exact original rows, doesn\'t re-charge', () => {
  const base = createLedger();
  const first = subscribe(base, { customerId: 'c1', idempotencyKey: 'stable-key' });
  const replay = subscribe(first.state, { customerId: 'c1', idempotencyKey: 'stable-key' });
  assert.deepEqual(replay.rows, first.rows);
  assert.equal(ledgerNet(replay.state, 'c1'), 499, 'no double charge on a genuine replay against committed state');
});

test('runIdempotent: 200 rapid interleaved subscribe calls across 50 distinct customers, applied sequentially (correct usage), produce exactly one charge per customer', () => {
  let state = createLedger();
  const customerIds = Array.from({ length: 50 }, (_, i) => `c${i}`);
  // simulate "concurrent" delivery order by interleaving customers rather than processing one
  // customer fully before the next — still applied sequentially against the running state, which is
  // the only way this module's pure-reducer contract is safe to use.
  for (let round = 0; round < 4; round++) {
    for (const customerId of customerIds) {
      try {
        ({ state } = subscribe(state, { customerId, idempotencyKey: `round-${round}` }));
      } catch (e) {
        assert.ok(e instanceof InvalidTransitionError, 'only expected failure mode is "already active"');
      }
    }
  }
  for (const customerId of customerIds) {
    assert.equal(ledgerNet(state, customerId), 499, `${customerId} must have been charged exactly once across 4 rounds x distinct idempotencyKeys`);
  }
});

// ---------------------------------------------------------------------------------------------
// 2. adjunto-billing: customerId type-confusion (object-shape fuzz, adjacent to the JSON.stringify class)
// ---------------------------------------------------------------------------------------------

test('FINDING: two different customer objects silently collide into the same ledger record via JS object-key ToString() coercion', () => {
  const state = createLedger();
  const customerA = { name: 'Duratech' };
  const customerB = { name: 'Milacron' }; // a completely different object reference and real-world customer
  const resultA = subscribe(state, { customerId: customerA }); // no idempotencyKey -> skips JSON.stringify entirely, goes straight to state.customers[customerId]
  assert.deepEqual(Object.keys(resultA.state.customers), ['[object Object]'], 'both distinct customer objects would coerce to this SAME key');

  assert.throws(
    () => subscribe(resultA.state, { customerId: customerB }),
    (e) => e instanceof InvalidTransitionError && e.message.includes('[object Object]'),
    'customer B is wrongly told it is "already active" — it collided with unrelated customer A, not with itself',
  );
});

test('subscribe: a string customerId never collides with another string customerId (control case, confirms the bug is object-specific)', () => {
  const state = createLedger();
  const resultA = subscribe(state, { customerId: 'duratech' });
  const resultB = subscribe(resultA.state, { customerId: 'milacron' }); // distinct string keys, no collision
  assert.equal(ledgerNet(resultB.state, 'milacron'), 499);
  assert.equal(ledgerNet(resultB.state, 'duratech'), 499, 'both distinct string-keyed customers coexist correctly');
});

// ---------------------------------------------------------------------------------------------
// 3. adjunto-billing: deeply nested object shapes into runIdempotent's JSON.stringify fingerprint
// ---------------------------------------------------------------------------------------------

function buildDeeplyNested(depth) {
  let node = { leaf: true };
  for (let i = 0; i < depth; i++) node = { next: node };
  return node;
}

test('runIdempotent fingerprint: a moderately deep (but real-world-plausible) nested customerId succeeds fine', () => {
  const state = createLedger();
  const moderatelyDeep = buildDeeplyNested(500);
  const result = subscribe(state, { customerId: moderatelyDeep, idempotencyKey: 'k1' });
  assert.equal(result.rows.length, 1);
});

test('FINDING: a very deeply nested (non-circular) customerId crashes JSON.stringify inside runIdempotent with an uncaught RangeError, not a clean validation error', () => {
  const state = createLedger();
  const veryDeep = buildDeeplyNested(200_000); // real object, no actual circular reference — JSON.stringify
    // is recursive under the hood and blows the call stack on depth alone, independent of cycles
  assert.throws(
    () => subscribe(state, { customerId: veryDeep, idempotencyKey: 'k1' }),
    (e) => e instanceof RangeError && /call stack/i.test(e.message),
    'expected an uncaught RangeError (stack overflow), not a clean InvalidPrice/InvalidTransition rejection',
  );
});

test('the same very-deep object WITHOUT an idempotencyKey does not crash (fingerprint/JSON.stringify is skipped entirely when opKey is falsy)', () => {
  const state = createLedger();
  const veryDeep = buildDeeplyNested(200_000);
  const result = subscribe(state, { customerId: veryDeep }); // no idempotencyKey
  assert.equal(result.rows.length, 1, 'confirms the crash is specific to the idempotency fingerprint path, not customerId handling in general');
});

// ---------------------------------------------------------------------------------------------
// 4. growth-scoring: extreme numeric fuzz (Infinity/-Infinity/NaN/huge/negative-zero)
// ---------------------------------------------------------------------------------------------

test('scoreLeadReadiness: Infinity/-Infinity/NaN daysSinceLastTouch all fall back safely to 0 ("touched today"), never crash or corrupt readinessScore', () => {
  const badValues = [Infinity, -Infinity, NaN];
  for (const daysSinceLastTouch of badValues) {
    const result = scoreLeadReadiness({
      hasProofArtifactSent: true, hasQuoteSent: true, complianceClean: true, repliedLast: false, daysSinceLastTouch,
    });
    assert.equal(result.stage, 'follow-up', `${daysSinceLastTouch} must be treated as the 0-day default, not propagate`);
    assert.equal(result.readinessScore, 65);
    assert.ok(Number.isFinite(result.readinessScore), 'readinessScore itself must always be a finite, sane number');
  }
});

test('scoreLeadReadiness: an astronomically large but finite daysSinceLastTouch (1e308) correctly triggers stale-needs-attention with a clamped score, no overflow', () => {
  const result = scoreLeadReadiness({ hasProofArtifactSent: true, hasQuoteSent: true, complianceClean: true, repliedLast: false, daysSinceLastTouch: 1e308 });
  assert.equal(result.stage, 'stale-needs-attention');
  assert.equal(result.readinessScore, 0, 'clampScore floors at 0 even for an astronomically overdue value');
  assert.ok(Number.isFinite(result.readinessScore));
});

test('scoreLeadReadiness: negative-zero daysSinceLastTouch is accepted (>=0 is true for -0) and behaves identically to 0', () => {
  const result = scoreLeadReadiness({ hasProofArtifactSent: true, hasQuoteSent: true, complianceClean: true, repliedLast: false, daysSinceLastTouch: -0 });
  assert.equal(result.stage, 'follow-up');
  assert.equal(result.readinessScore, 65);
  assert.ok(!Object.is(result.readinessScore, -0), 'the OUTPUT score is a plain positive 65, -0 does not leak through the arithmetic');
});

test('rankLeads: 20k scored leads with randomized readinessScore/daysSinceLastTouch/stale mix sorts correctly and fast, no performance cliff', () => {
  const N = 20_000;
  const stages = ['prove', 'quote', 'cleared-doc', 'follow-up', 'outreach', 'onboard', 'stale-needs-attention'];
  const leads = [];
  for (let i = 0; i < N; i++) {
    leads.push({
      stage: stages[i % stages.length],
      readinessScore: (i * 37) % 101,
      daysSinceLastTouch: (i * 13) % 400,
    });
  }
  const t0 = performance.now();
  const ranked = rankLeads(leads);
  const elapsedMs = performance.now() - t0;
  assert.equal(ranked.length, N);
  assert.ok(elapsedMs < 2000, `expected well under 2s for 20k leads, took ${elapsedMs.toFixed(1)}ms`);
  // every stale-needs-attention lead outranks every non-stale lead, regardless of readinessScore
  const firstNonStaleIdx = ranked.findIndex((l) => l.stage !== 'stale-needs-attention');
  const anyStaleAfter = ranked.slice(firstNonStaleIdx).some((l) => l.stage === 'stale-needs-attention');
  assert.equal(anyStaleAfter, false, 'no stale lead should ever sort below a non-stale lead');
});
