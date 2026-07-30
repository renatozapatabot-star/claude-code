import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dedupeAlerts, rankAlerts } from '../src/alerts.mjs';

const HOUR = 60 * 60 * 1000;

test('dedup: repeated alerts for the same thread within the window merge, never dropped silently', () => {
  const now = Date.parse('2026-07-30T12:00:00Z');
  const alerts = [
    { thread_id: 't1', urgency: 3, emittedAtMs: now },
    { thread_id: 't1', urgency: 5, emittedAtMs: now + 10 * 60 * 1000 },
    { thread_id: 't1', urgency: 4, emittedAtMs: now + 20 * 60 * 1000 },
  ];
  const deduped = dedupeAlerts(alerts);
  assert.equal(deduped.length, 1);
  assert.equal(deduped[0].urgency, 5); // highest-urgency instance survives
  assert.equal(deduped[0].suppressedCount, 2); // the other 2 are folded in, not discarded
});

test('dedup: alerts outside the window are kept as distinct occurrences (never-drop)', () => {
  const now = Date.parse('2026-07-30T12:00:00Z');
  const alerts = [
    { thread_id: 't1', urgency: 3, emittedAtMs: now },
    { thread_id: 't1', urgency: 4, emittedAtMs: now + 3 * HOUR },
  ];
  const deduped = dedupeAlerts(alerts, HOUR);
  assert.equal(deduped.length, 2);
});

test('dedup: distinct threads never merge with each other', () => {
  const now = Date.parse('2026-07-30T12:00:00Z');
  const alerts = [
    { thread_id: 't1', urgency: 3, emittedAtMs: now },
    { thread_id: 't2', urgency: 3, emittedAtMs: now },
  ];
  const deduped = dedupeAlerts(alerts);
  assert.equal(deduped.length, 2);
});

test('rankAlerts: sorts by urgency desc, most-recent-first tiebreak', () => {
  const now = Date.parse('2026-07-30T12:00:00Z');
  const a = { thread_id: 'a', urgency: 5, emittedAtMs: now };
  const b = { thread_id: 'b', urgency: 5, emittedAtMs: now + 1000 };
  const c = { thread_id: 'c', urgency: 2, emittedAtMs: now + 5000 };
  const ranked = rankAlerts([a, c, b]);
  assert.deepEqual(ranked.map((x) => x.thread_id), ['b', 'a', 'c']);
});

test('denial: no send/dispatch/reply-capable export exists', async () => {
  const mod = await import('../src/alerts.mjs');
  const exportNames = Object.keys(mod);
  assert.ok(!exportNames.some((n) => /send|dispatch|reply/i.test(n)), 'no send-capable export exists');
});
