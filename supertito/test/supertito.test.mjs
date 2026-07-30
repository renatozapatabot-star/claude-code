import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLedger, acquireLock } from '../src/ledger.mjs';
import { createReceiptStore } from '../src/receipt-store.mjs';
import { createSenderRegistry } from '../src/sender-registry.mjs';
import { createEscalator } from '../src/escalation.mjs';
import { matchMetric, normLang, t } from '../src/i18n.mjs';
import { mintBootToken, consumeBootToken } from '../src/boot-token.mjs';
import { createMockTelegram } from '../src/mock-telegram.mjs';
import { createTransport, createDelivery } from '../src/transport.mjs';
import { createBot } from '../src/bot.mjs';

const KEY = 'k'.repeat(32);
const tmp = () => mkdtempSync(join(tmpdir(), 'st-'));

// ---- Ledger (ST-5 / RES-01 / RES-12) ----
test('ledger: append + chain verify + tail anchor', () => {
  const l = createLedger(join(tmp(), 'l.jsonl'), KEY);
  l.append({ a: 1 }); l.append({ a: 2 });
  assert.equal(l.count(), 2);
  assert.deepEqual(l.readAll(), [{ a: 1 }, { a: 2 }]);
  assert.equal(l.verify().ok, true);
});

test('ledger: value tamper -> mac-mismatch (fail-closed)', () => {
  const p = join(tmp(), 'l.jsonl');
  const l = createLedger(p, KEY); l.append({ v: 100 });
  const lines = readFileSync(p, 'utf8').split('\n').filter(Boolean).map(JSON.parse);
  lines[0].payload.v = 999;
  writeFileSync(p, lines.map(x => JSON.stringify(x)).join('\n') + '\n');
  assert.throws(() => createLedger(p, KEY).readAll(), /mac-mismatch/);
});

test('ledger: foreign append incrementally caught', () => {
  const p = join(tmp(), 'l.jsonl');
  const l = createLedger(p, KEY); l.append({ x: 1 });
  appendFileSync(p, JSON.stringify({ payload: { x: 2 }, mac: 'deadbeef' }) + '\n'); // forged
  assert.throws(() => l.verify(), /mac-mismatch/);
});

test('ledger: shrink detected', () => {
  const p = join(tmp(), 'l.jsonl');
  const l = createLedger(p, KEY); l.append({ x: 1 }); l.append({ x: 2 });
  l.count();
  writeFileSync(p, ''); // shrank
  assert.throws(() => l.count(), /ledger-shrank/);
});

test('lock: second acquire refused; stale recovered exactly once', () => {
  const dir = join(tmp(), 'l.lock');
  const a = acquireLock(dir); assert.equal(a.ok, true);
  const b = acquireLock(dir); assert.equal(b.ok, false); assert.equal(b.reason, 'lock-held');
  a.release();
  // stale: mock an old owner
  const a2 = acquireLock(dir);
  writeFileSync(join(dir, 'owner'), JSON.stringify({ pid: 1, at: 0 }));
  const rec = acquireLock(dir, { staleMs: 1 });
  assert.equal(rec.ok, true); assert.equal(rec.recovered, true);
  rec.release(); a2.release?.();
});

// ---- Receipt store (ST-4 / RES-03) ----
test('receipt store: put -> verify ok; tamper/forge -> named failure', () => {
  const s = createReceiptStore(tmp(), KEY);
  const { receipt_id } = s.put({ revenue: 1000 });
  assert.equal(s.verify(receipt_id).ok, true);
  assert.equal(s.verify('0'.repeat(64)).reason, 'receipt-missing');
  assert.equal(s.verify('nope').reason, 'receipt-missing');
});

test('receipt store: body tamper -> hash-mismatch', () => {
  const dir = tmp(); const s = createReceiptStore(dir, KEY);
  const { receipt_id } = s.put({ v: 1 });
  const p = join(dir, receipt_id + '.json');
  const rec = JSON.parse(readFileSync(p, 'utf8')); rec.body.v = 2;
  writeFileSync(p, JSON.stringify(rec));
  assert.equal(s.verify(receipt_id).reason, 'receipt-hash-mismatch');
});

test('receipt store: wrong-key mac -> mac-mismatch', () => {
  const dir = tmp();
  const { receipt_id } = createReceiptStore(dir, KEY).put({ v: 1 });
  assert.equal(createReceiptStore(dir, 'x'.repeat(32)).verify(receipt_id).reason, 'receipt-mac-mismatch');
});

// ---- Sender registry (ST-3 / X3) ----
test('sender registry: byte-exact only; confusable/case/empty/null denied', () => {
  const r = createSenderRegistry();
  assert.equal(r.authorize('renato-iv').ok, true);
  for (const bad of ['Renato-IV', 'rеnato-iv' /* Cyrillic е */, '', null, undefined, 'mallory']) {
    assert.equal(r.authorize(bad).ok, false, `should deny ${bad}`);
    assert.equal(r.authorize(bad).reason, 'denied');
  }
});

// ---- Escalation (ST-6) ----
test('escalation: cap honored, oldest-first, carry-over, no double-fire', () => {
  const mirrored = [];
  const e = createEscalator({ cap: 25, onMirror: (m) => mirrored.push(m) });
  const items = Array.from({ length: 30 }, (_, i) => ({ id: `c${String(i).padStart(2, '0')}`, dueMs: i }));
  const r1 = e.scan(items);
  assert.equal(r1.fired.length, 25); assert.equal(r1.deferred, 5);
  assert.equal(r1.fired[0], 'c00'); // oldest first
  const r2 = e.scan(items);
  assert.equal(r2.fired.length, 5); assert.equal(r2.deferred, 0); // carry-over fires, none twice
  assert.equal(mirrored.filter(m => m.kind === 'escalation-batch').length, 2);
});

test('escalation: invalid cap throws (fail-closed)', () => {
  for (const bad of [0, -1, 'abc', 1e9]) assert.throws(() => createEscalator({ cap: bad }));
});

// ---- i18n (ST-7) ----
test('i18n: ES alias parity + lang fallback never throws on chat path', () => {
  assert.equal(matchMetric('cuántas cargas esta semana', 'loads_this_week', 'es'), true);
  assert.equal(matchMetric('loads this week', 'loads_this_week', 'en'), true);
  assert.equal(normLang('fr'), 'en'); // fallback
  assert.throws(() => t('fr', 'denied_sender')); // strict below the facade (defense in depth)
});

// ---- Boot token (RES-04) ----
test('boot token: happy consume; expiry, forgery, drift refused', () => {
  const snap = { head: 'abc', clean: true };
  let now = 1000; const clock = () => now;
  const tok = mintBootToken(KEY, snap, { ttlMs: 100, now: clock });
  assert.equal(consumeBootToken(KEY, tok, snap, { now: clock }).ok, true);
  now = 2000; // expired
  assert.equal(consumeBootToken(KEY, tok, snap, { now: clock }).reason, 'token-expired');
  now = 1000;
  assert.equal(consumeBootToken(KEY, { ...tok, token_mac: 'bad' }, snap, { now: clock }).reason, 'token-mac-invalid');
  assert.equal(consumeBootToken(KEY, tok, { head: 'zzz', clean: true }, { now: clock }).reason, 'admission-drift');
});

// ---- Transport chaos + never-drop (ST-2) ----
test('transport: chaos modes classified + queue never drops', async () => {
  const mock = createMockTelegram();
  const port = await mock.listen();
  const t2 = createTransport({ baseUrl: `http://127.0.0.1:${port}`, timeoutMs: 250 });
  const d = createDelivery({ transport: t2 });
  mock.setMode('ok');
  assert.equal((await d.send({ text: 'a' })).delivered, true);
  mock.setMode('outage');
  const r = await d.send({ text: 'b' }); assert.equal(r.queued, true); assert.equal(r.error_kind, 'outage');
  mock.setMode('500');
  assert.equal((await d.send({ text: 'c' })).error_kind, 'server');
  assert.equal(d.queueSize(), 2);
  mock.setMode('ok');
  const f = await d.flush(); assert.equal(f.delivered, 2); assert.equal(f.remaining, 0);
  await mock.close();
});

// ---- Bot facade: auth-before-answer, provenance-at-utterance (ST-3/ST-4) ----
test('bot: unregistered sender denied (no fact, no oracle); verified fact answered', () => {
  const dir = tmp(); const receipts = createReceiptStore(dir, KEY);
  const { receipt_id } = receipts.put({ src: 'ledger' });
  const facts = [{ metric: 'loads_this_week', value: 12, source_receipt: receipt_id, tenant: 'EVCO', asOf: 'T' }];
  const bot = createBot({ receipts, facts });
  assert.equal(bot.ask({ senderId: 'mallory', question: 'loads this week' }).kind, 'denied');
  const ok = bot.ask({ senderId: 'renato-iv', question: 'loads this week' });
  assert.equal(ok.kind, 'fact'); assert.match(ok.text, /\[EVCO\]/);
});

test('bot: fact with broken provenance is never uttered', () => {
  const facts = [{ metric: 'adjunto_score', value: 92, source_receipt: 'f'.repeat(64), asOf: 'T' }];
  const bot = createBot({ receipts: createReceiptStore(tmp(), KEY), facts });
  const r = bot.ask({ senderId: 'renato-iv', question: 'adjunto score' });
  assert.equal(r.kind, 'unverifiable-provenance');
});
