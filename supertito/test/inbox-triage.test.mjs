import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyThread, rankThreads, toAlert } from '../src/inbox-triage.mjs';

const DAY = 86_400_000;
const now = Date.parse('2026-07-30T12:00:00Z');

test('classifies a stale hot lead (Ursula-shaped: 18 days, trial ask, awaiting reply)', () => {
  const msgs = [
    { id: '1', dateMs: now - 19 * DAY, fromMe: true, subject: 'Adjunto — un correo de handoff', snippet: 'prueba 15 min' },
    { id: '2', dateMs: now - 18 * DAY, fromMe: false, subject: 'RE: Adjunto', snippet: 'me puedes pasar el link para entrar y usuario' },
  ];
  const c = classifyThread(msgs, now);
  assert.equal(c.category, 'stale-hot-lead');
  assert.ok(c.urgency >= 3);
  assert.equal(c.awaitingReply, true);
});

test('classifies a compliance-deadline thread', () => {
  const msgs = [{ id: '1', dateMs: now - DAY, fromMe: false, subject: 'MVE pendiente', snippet: 'falta VUCEM E2' }];
  assert.equal(classifyThread(msgs, now).category, 'compliance-deadline');
});

test('classifies an urgent-client thread', () => {
  const msgs = [{ id: '1', dateMs: now - DAY, fromMe: false, subject: 'URGENTE primera hora', snippet: 'necesitamos hoy mismo' }];
  assert.equal(classifyThread(msgs, now).category, 'urgent-client');
});

test('a fresh, already-answered thread is routine, not urgent', () => {
  const msgs = [
    { id: '1', dateMs: now - DAY, fromMe: false, subject: 'hola', snippet: 'como vas' },
    { id: '2', dateMs: now - DAY / 2, fromMe: true, subject: 'RE: hola', snippet: 'bien, gracias' },
  ];
  const c = classifyThread(msgs, now);
  assert.equal(c.awaitingReply, false);
  assert.equal(c.category, 'routine');
});

test('empty thread classifies safely', () => {
  assert.equal(classifyThread([], now).category, 'empty');
});

test('rankThreads sorts by urgency desc, ties broken by age desc', () => {
  const a = { id: 'a', urgency: 5, ageDays: 1 };
  const b = { id: 'b', urgency: 5, ageDays: 10 };
  const c = { id: 'c', urgency: 2, ageDays: 100 };
  const ranked = rankThreads([c, a, b]);
  assert.deepEqual(ranked.map((x) => x.id), ['b', 'a', 'c']);
});

test('toAlert suppresses routine/low-urgency, surfaces the rest with no fabricated claim', () => {
  assert.equal(toAlert('t1', { category: 'routine', urgency: 1, ageDays: 1 }), null);
  const alert = toAlert('t2', { category: 'stale-hot-lead', urgency: 6, ageDays: 18 });
  assert.equal(alert.kind, 'inbox-triage-alert');
  assert.match(alert.text, /stale-hot-lead/);
});

test('denial: never produces a send action — module has no send/dispatch export', async () => {
  const mod = await import('../src/inbox-triage.mjs');
  const exportNames = Object.keys(mod);
  assert.ok(!exportNames.some((n) => /send|dispatch|reply/i.test(n)), 'no send-capable export exists');
});
