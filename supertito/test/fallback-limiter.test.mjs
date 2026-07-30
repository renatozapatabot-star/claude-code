import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  shouldEmitFallback,
  digestFallbackFires,
  updateCircuit,
  canProbe,
  beginProbe,
  nextBackoffDelayMs,
  shouldProcessUpdate,
} from '../src/fallback-limiter.mjs';

const MIN = 60 * 1000;

test('shouldEmitFallback: first-ever failure for a chat always emits', () => {
  assert.equal(shouldEmitFallback(null, Date.now()), true);
});

test('shouldEmitFallback: reproduces-then-fixes the observed WO-18 bug — 5 failures inside 60s, only 1 emits', () => {
  const t0 = Date.parse('2026-07-30T06:49:00Z');
  const failureTimesMs = [t0, t0 + 5000, t0 + 15000, t0 + 30000, t0 + 55000]; // matches the screenshot's ~1-min burst
  let lastEmittedAtMs = null;
  const emissions = [];
  for (const nowMs of failureTimesMs) {
    const emit = shouldEmitFallback(lastEmittedAtMs, nowMs);
    emissions.push(emit);
    if (emit) lastEmittedAtMs = nowMs;
  }
  assert.deepEqual(emissions, [true, false, false, false, false]);
});

test('shouldEmitFallback: a genuinely new failure after the window elapses emits again (never permanently silenced)', () => {
  const t0 = Date.parse('2026-07-30T06:49:00Z');
  assert.equal(shouldEmitFallback(t0, t0 + 6 * MIN), true); // default window is 5 min
});

test('digestFallbackFires: folds repeats per chat, never drops the count (reuses alerts.mjs dedupeAlerts unmodified)', () => {
  const t0 = Date.parse('2026-07-30T06:49:00Z');
  const fires = [
    { chat_id: 'supertito-group', emittedAtMs: t0 },
    { chat_id: 'supertito-group', emittedAtMs: t0 + 5000 },
    { chat_id: 'supertito-group', emittedAtMs: t0 + 15000 },
    { chat_id: 'supertito-group', emittedAtMs: t0 + 30000 },
    { chat_id: 'supertito-group', emittedAtMs: t0 + 55000 },
  ];
  const digest = digestFallbackFires(fires);
  assert.equal(digest.length, 1);
  assert.equal(digest[0].chat_id, 'supertito-group');
  assert.equal(digest[0].suppressedCount, 4); // 5 fires, 1 survivor, 4 folded in — none discarded
});

test('digestFallbackFires: distinct chats never merge with each other', () => {
  const t0 = Date.parse('2026-07-30T06:49:00Z');
  const fires = [
    { chat_id: 'group-a', emittedAtMs: t0 },
    { chat_id: 'group-b', emittedAtMs: t0 },
  ];
  assert.equal(digestFallbackFires(fires).length, 2);
});

test('updateCircuit: trips OPEN after the failure threshold, stays CLOSED before it', () => {
  const t0 = Date.parse('2026-07-30T06:49:00Z');
  let state = { status: 'closed', consecutiveFailures: 0, openedAtMs: null };
  state = updateCircuit(state, 'failure', t0);
  assert.equal(state.status, 'closed');
  state = updateCircuit(state, 'failure', t0 + 1000);
  assert.equal(state.status, 'closed');
  state = updateCircuit(state, 'failure', t0 + 2000); // 3rd consecutive failure, default threshold
  assert.equal(state.status, 'open');
  assert.equal(state.consecutiveFailures, 3);
});

test('updateCircuit: any success resets to CLOSED with zero consecutive failures', () => {
  const state = updateCircuit(
    { status: 'open', consecutiveFailures: 5, openedAtMs: 1000 },
    'success',
    2000,
  );
  assert.deepEqual(state, { status: 'closed', consecutiveFailures: 0, openedAtMs: null });
});

test('updateCircuit: a failed HALF_OPEN probe re-opens and resets the cooldown clock', () => {
  const state = updateCircuit(
    { status: 'half_open', consecutiveFailures: 3, openedAtMs: 1000 },
    'failure',
    50000,
  );
  assert.equal(state.status, 'open');
  assert.equal(state.openedAtMs, 50000);
});

test('canProbe: false while OPEN and cooldown has not elapsed, true once it has', () => {
  const state = { status: 'open', openedAtMs: 0 };
  assert.equal(canProbe(state, 60 * 1000), false); // 1 min in, default cooldown is 2 min
  assert.equal(canProbe(state, 3 * 60 * 1000), true); // 3 min in
});

test('canProbe: true when the circuit is not open at all', () => {
  assert.equal(canProbe({ status: 'closed', openedAtMs: null }, 0), true);
});

test('beginProbe: reproduces-then-fixes resilience4j #1432 — two concurrent callers after cooldown, only the first claims the probe', () => {
  const openState = { status: 'open', consecutiveFailures: 3, openedAtMs: 0 };
  const nowMs = 3 * 60 * 1000; // past the default 2-min cooldown
  const first = beginProbe(openState, nowMs);
  assert.equal(first.allowed, true);
  assert.equal(first.nextState.status, 'half_open');
  // caller persists first.nextState synchronously, *then* the second concurrent
  // handler (e.g. a different chat's webhook, interleaved while the first await's
  // LLM call is in flight) reads state and calls beginProbe again with the claimed state
  const second = beginProbe(first.nextState, nowMs);
  assert.equal(second.allowed, false, 'a second concurrent probe must not also be admitted');
  assert.equal(second.nextState.status, 'half_open');
});

test('beginProbe: not yet allowed while the cooldown has not elapsed', () => {
  const openState = { status: 'open', consecutiveFailures: 3, openedAtMs: 0 };
  const { allowed, nextState } = beginProbe(openState, 60 * 1000); // 1 min, default cooldown is 2 min
  assert.equal(allowed, false);
  assert.equal(nextState.status, 'open'); // unchanged, still eligible once cooldown elapses
});

test('beginProbe: always allowed when the circuit is already closed', () => {
  const closedState = { status: 'closed', consecutiveFailures: 0, openedAtMs: null };
  const { allowed, nextState } = beginProbe(closedState, 0);
  assert.equal(allowed, true);
  assert.equal(nextState, closedState); // no transition needed
});

test('nextBackoffDelayMs: grows with attempt number and stays within the jittered bound (full-jitter formula)', () => {
  const fixedRandom = () => 0.999999; // pin jitter near its upper bound, deterministically
  const d0 = nextBackoffDelayMs(0, { baseMs: 1000, capMs: 30000, randomFn: fixedRandom });
  const d1 = nextBackoffDelayMs(1, { baseMs: 1000, capMs: 30000, randomFn: fixedRandom });
  const d2 = nextBackoffDelayMs(2, { baseMs: 1000, capMs: 30000, randomFn: fixedRandom });
  assert.ok(d0 < d1 && d1 < d2, 'delay upper bound grows with attempt number');
  assert.ok(d2 <= 30000, 'never exceeds the cap');
});

test('nextBackoffDelayMs: caps out and stops growing past the ceiling', () => {
  const d = nextBackoffDelayMs(20, { baseMs: 1000, capMs: 30000, randomFn: () => 0.999999 });
  assert.ok(d <= 30000);
});

test('nextBackoffDelayMs: an explicit retry-after (from a real 429 header) overrides the jittered guess exactly', () => {
  const d = nextBackoffDelayMs(5, { baseMs: 1000, capMs: 30000, randomFn: () => 0.5, retryAfterMs: 12345 });
  assert.equal(d, 12345);
});

test('shouldProcessUpdate: a fresh update_id is processed and remembered', () => {
  const seen = new Map();
  const t0 = Date.parse('2026-07-30T06:49:00Z');
  assert.equal(shouldProcessUpdate(seen, 'upd-1', t0), true);
  assert.equal(seen.get('upd-1'), t0);
});

test('shouldProcessUpdate: a Telegram redelivery of the same update_id within the TTL is skipped (openclaw #58611 pattern)', () => {
  const seen = new Map();
  const t0 = Date.parse('2026-07-30T06:49:00Z');
  assert.equal(shouldProcessUpdate(seen, 'upd-1', t0), true);
  // Telegram redelivers the identical update_id 3 times while the LLM call is stuck
  assert.equal(shouldProcessUpdate(seen, 'upd-1', t0 + 5000), false);
  assert.equal(shouldProcessUpdate(seen, 'upd-1', t0 + 30000), false);
  assert.equal(shouldProcessUpdate(seen, 'upd-1', t0 + 55000), false);
});

test('shouldProcessUpdate: distinct update_ids never collide with each other', () => {
  const seen = new Map();
  const t0 = Date.parse('2026-07-30T06:49:00Z');
  assert.equal(shouldProcessUpdate(seen, 'upd-1', t0), true);
  assert.equal(shouldProcessUpdate(seen, 'upd-2', t0), true);
});

test('shouldProcessUpdate: the same update_id is processed again once past the TTL (not permanently blocked)', () => {
  const seen = new Map();
  const t0 = Date.parse('2026-07-30T06:49:00Z');
  assert.equal(shouldProcessUpdate(seen, 'upd-1', t0), true);
  assert.equal(shouldProcessUpdate(seen, 'upd-1', t0 + 6 * MIN), true); // default TTL is 5 min
});

test('denial: no send/dispatch/reply-capable export exists', async () => {
  const mod = await import('../src/fallback-limiter.mjs');
  const exportNames = Object.keys(mod);
  assert.ok(!exportNames.some((n) => /send|dispatch|reply/i.test(n)), 'no send-capable export exists');
});
