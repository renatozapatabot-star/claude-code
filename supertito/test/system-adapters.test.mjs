// Tests for supertito/src/system-adapters.mjs — [WO-17] prep only.
//
// All fixture inputs below are SIM/placeholder data invented for this test — NOT real globalpc,
// Aduanet, or econta records (no live access to any of those three systems exists in this repo,
// see FREIGHT-OS-CANON.md [WO-17]). Field names on the fixtures follow the ASSUMED-PENDING-WO-17
// typedefs in system-adapters.mjs; they will need correcting once real API docs land.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adaptGlobalpc, adaptAduanet, adaptEconta } from '../src/system-adapters.mjs';
import { classifyThread, toAlert } from '../src/inbox-triage.mjs';

const DAY = 86_400_000;
const now = Date.parse('2026-07-30T12:00:00Z');

// SIM fixture — placeholder globalpc (Sistema de Tráfico) event, not a real payload.
const SIM_GLOBALPC_RAW = {
  traficoId: 'TRF-2026-00931',
  eventEpochMs: now - 4 * DAY,
  originatedByBroker: false,
  eventType: 'hold-flagged',
  detail: 'contenedor detenido, falta MVE VUCEM E2',
};

// SIM fixture — placeholder Aduanet customs-crossing status, not a real payload.
const SIM_ADUANET_RAW = {
  pedimentoRef: '26 48 3948 7001234',
  statusChangedAtMs: now - DAY,
  brokerInitiated: false,
  statusCode: 'held-24h',
  note: 'urgente, se necesita liberar hoy mismo',
};

// SIM fixture — placeholder econta accounting/invoicing entry, not a real payload.
const SIM_ECONTA_RAW = {
  invoiceId: 'INV-08842',
  postedAtMs: now - 2 * DAY,
  issuedByUs: true,
  memo: 'factura enviada a EVCO',
  reference: 'folio fiscal 9F2C-...',
};

function assertCanonicalShape(msg) {
  assert.equal(typeof msg.id, 'string');
  assert.ok(msg.id.length > 0);
  assert.equal(typeof msg.dateMs, 'number');
  assert.ok(Number.isFinite(msg.dateMs));
  assert.equal(typeof msg.fromMe, 'boolean');
  assert.equal(typeof msg.subject, 'string');
  assert.equal(typeof msg.snippet, 'string');
}

test('adapters throw on a non-string, non-null optional free-text field instead of silently violating the snippet:string contract (v3.7 audit fix)', () => {
  assert.throws(() => adaptGlobalpc({ ...SIM_GLOBALPC_RAW, detail: 0 }), TypeError);
  assert.throws(() => adaptAduanet({ ...SIM_ADUANET_RAW, note: false }), TypeError);
  assert.throws(() => adaptEconta({ ...SIM_ECONTA_RAW, reference: 12345 }), TypeError);
});

test('adaptGlobalpc: SIM fixture maps to the canonical shape', () => {
  const msg = adaptGlobalpc(SIM_GLOBALPC_RAW);
  assertCanonicalShape(msg);
  assert.equal(msg.fromMe, false);
  assert.match(msg.id, /^globalpc:/);
  assert.match(msg.subject, /TRF-2026-00931/);
});

test('adaptAduanet: SIM fixture maps to the canonical shape', () => {
  const msg = adaptAduanet(SIM_ADUANET_RAW);
  assertCanonicalShape(msg);
  assert.equal(msg.fromMe, false);
  assert.match(msg.id, /^aduanet:/);
  assert.match(msg.subject, /held-24h/);
});

test('adaptEconta: SIM fixture maps to the canonical shape', () => {
  const msg = adaptEconta(SIM_ECONTA_RAW);
  assertCanonicalShape(msg);
  assert.equal(msg.fromMe, true);
  assert.match(msg.id, /^econta:/);
  assert.match(msg.subject, /INV-08842/);
});

test('adapters reject a missing raw record instead of fabricating one', () => {
  assert.throws(() => adaptGlobalpc(undefined), TypeError);
  assert.throws(() => adaptAduanet(null), TypeError);
  assert.throws(() => adaptEconta(undefined), TypeError);
});

test('adapters reject a raw record missing its required id/date fields', () => {
  assert.throws(() => adaptGlobalpc({ eventType: 'x' }), TypeError);
  assert.throws(() => adaptAduanet({ statusCode: 'x' }), TypeError);
  assert.throws(() => adaptEconta({ memo: 'x' }), TypeError);
});

test('integration: adapted globalpc SIM record feeds classifyThread cleanly (compliance-deadline)', () => {
  const msg = adaptGlobalpc(SIM_GLOBALPC_RAW);
  const c = classifyThread([msg], now);
  assert.equal(c.category, 'compliance-deadline');
  assert.equal(c.awaitingReply, true);
  const alert = toAlert(msg.id, c);
  assert.equal(alert.kind, 'inbox-triage-alert');
});

test('integration: adapted Aduanet SIM record feeds classifyThread cleanly (urgent-client)', () => {
  const msg = adaptAduanet(SIM_ADUANET_RAW);
  const c = classifyThread([msg], now);
  assert.equal(c.category, 'urgent-client');
  const alert = toAlert(msg.id, c);
  assert.equal(alert.kind, 'inbox-triage-alert');
});

test('integration: adapted econta SIM record (fromMe=true, already answered) classifies routine', () => {
  const msg = adaptEconta(SIM_ECONTA_RAW);
  const c = classifyThread([msg], now);
  assert.equal(c.awaitingReply, false);
  assert.equal(c.category, 'routine');
  assert.equal(toAlert(msg.id, c), null);
});

test('integration: a multi-system SIM thread (globalpc event then econta reply) classifies without error', () => {
  const msgs = [
    adaptGlobalpc({ ...SIM_GLOBALPC_RAW, eventEpochMs: now - 5 * DAY }),
    adaptEconta({ ...SIM_ECONTA_RAW, postedAtMs: now - 4 * DAY, issuedByUs: true, memo: 'seguimiento enviado' }),
  ];
  const c = classifyThread(msgs, now);
  assert.equal(c.awaitingReply, false);
  assert.equal(typeof c.category, 'string');
});
