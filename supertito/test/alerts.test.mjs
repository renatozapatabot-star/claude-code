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

test('dedup: sliding window keeps advancing even when an early high-urgency alert would otherwise freeze the anchor in the past (v3.7 audit fix)', () => {
  const now = Date.parse('2026-07-30T12:00:00Z');
  // A high-urgency alert fires first, then 3 more lower-urgency alerts each 50 min after the
  // previous one (well within a 60-min window of their immediate predecessor, but the last one
  // is 150 min after the very first — outside a 60-min window measured from the first alert).
  // Pre-fix, the anchor froze at the first (winning, urgency=5) alert's timestamp, so the last
  // alert would incorrectly split off as a "new occurrence" even though every consecutive gap
  // was within the window.
  const alerts = [
    { thread_id: 't1', urgency: 5, emittedAtMs: now },
    { thread_id: 't1', urgency: 1, emittedAtMs: now + 50 * 60 * 1000 },
    { thread_id: 't1', urgency: 1, emittedAtMs: now + 100 * 60 * 1000 },
    { thread_id: 't1', urgency: 1, emittedAtMs: now + 150 * 60 * 1000 },
  ];
  const deduped = dedupeAlerts(alerts, HOUR);
  assert.equal(deduped.length, 1);
  assert.equal(deduped[0].urgency, 5); // content still picks the highest-urgency instance
  assert.equal(deduped[0].suppressedCount, 3); // all 3 later ones folded in, none dropped, none split off
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
