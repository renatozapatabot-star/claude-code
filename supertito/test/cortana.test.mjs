// Integration tests for supertito/src/cortana.mjs — the [P2-W3-02] "Cortana" capstone pass.
//
// All fixture data below is SIM/fixture data, NOT real client records — synthetic stand-ins for
// what Gmail + the [WO-17] adapters (globalpc, Aduanet, econta) would emit once real credentials
// land. The scenario deliberately mirrors correlate.test.mjs's MAFESA-across-3-systems case, but run
// through the FULL pipeline this time (raw records in, adapters + classifyThread + correlate all
// actually invoked) rather than hand-built classification objects — that's the integration-level
// proof this file exists to provide. A second entity (EVCO, across gmail + globalpc) and a
// single-system-only entity (Ursula Banda, gmail only) are included to prove selective correlation
// and per-system alerting both work correctly in the same pass.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runCortanaPass } from '../src/cortana.mjs';

const DAY = 86_400_000;
const now = Date.parse('2026-07-30T12:00:00Z');

// --- SIM fixtures -----------------------------------------------------------------------------

// SIM gmail thread — MAFESA, awaiting reply, urgent-client shaped (mirrors gmail-mafesa-1 in
// correlate.test.mjs).
const SIM_GMAIL_MAFESA = {
  threadId: 'mafesa-thread-1',
  messages: [
    { id: 'g1a', dateMs: now - 2 * DAY, fromMe: true, subject: 'Seguimiento MAFESA', snippet: 'confirmando documentos' },
    { id: 'g1b', dateMs: now - 1 * DAY, fromMe: false, subject: 'URGENTE MAFESA', snippet: 'necesitamos respuesta asap por favor' },
  ],
};

// SIM gmail thread — EVCO, stale-hot-lead shaped (mirrors the Ursula-shaped case in
// inbox-triage.test.mjs, renamed to EVCO for this scenario's correlation).
const SIM_GMAIL_EVCO = {
  threadId: 'evco-thread-1',
  messages: [
    { id: 'g2a', dateMs: now - 19 * DAY, fromMe: true, subject: 'Adjunto — un correo de handoff EVCO', snippet: 'prueba 15 min' },
    { id: 'g2b', dateMs: now - 18 * DAY, fromMe: false, subject: 'RE: Adjunto EVCO', snippet: 'me puedes pasar el link para entrar y usuario' },
  ],
};

// SIM gmail thread — Ursula Banda, urgent-client, single-system (no other system mentions her in
// this scenario) — proves a per-system alert can surface without ever becoming a correlated brief.
const SIM_GMAIL_URSULA = {
  threadId: 'ursula-thread-1',
  messages: [
    { id: 'g3a', dateMs: now - 1 * DAY, fromMe: false, subject: 'ASAP Ursula Banda pago', snippet: 'urgente enviar comprobante' },
  ],
};

// SIM globalpc raw record — EVCO, hold-flagged with MVE language (compliance-deadline shaped).
const SIM_GLOBALPC_EVCO = {
  traficoId: 'TRF-EVCO-01',
  eventEpochMs: now - 3 * DAY,
  originatedByBroker: false,
  eventType: 'hold-flagged',
  detail: 'contenedor EVCO detenido, falta MVE VUCEM E2',
};

// SIM Aduanet raw record — MAFESA, mve-pending (compliance-deadline shaped, mirrors
// aduanet-mafesa-1 in correlate.test.mjs).
const SIM_ADUANET_MAFESA = {
  pedimentoRef: 'PED-MAFESA-001',
  statusChangedAtMs: now - 1 * DAY,
  brokerInitiated: false,
  statusCode: 'mve-pending',
  note: 'MAFESA pedimento con MVE pendiente de liberacion',
};

// SIM econta raw record — MAFESA, overdue invoice with a penalty mention (compliance-deadline
// shaped via the "multa" keyword, mirrors econta-mafesa-1 in correlate.test.mjs).
const SIM_ECONTA_MAFESA = {
  invoiceId: 'INV-MAFESA-01',
  postedAtMs: now - 12 * DAY,
  issuedByUs: false,
  memo: 'factura MAFESA con multa por mora',
  reference: 'saldo pendiente',
};

const FULL_ESTATE = {
  gmail: [SIM_GMAIL_MAFESA, SIM_GMAIL_EVCO, SIM_GMAIL_URSULA],
  globalpc: [SIM_GLOBALPC_EVCO],
  aduanet: [SIM_ADUANET_MAFESA],
  econta: [SIM_ECONTA_MAFESA],
};

// --- tests --------------------------------------------------------------------------------------

test('runCortanaPass: per-system alerts surface for every observation across all 4 systems', () => {
  const { perSystemAlerts } = runCortanaPass(FULL_ESTATE, now);

  // 3 gmail threads + 1 globalpc + 1 aduanet + 1 econta = 6 observations, all urgency >= 3 by
  // construction, so all 6 clear toAlert's routine/low-urgency floor.
  assert.equal(perSystemAlerts.length, 6);
  for (const alert of perSystemAlerts) {
    assert.equal(alert.kind, 'inbox-triage-alert');
    assert.ok(alert.urgency >= 3);
  }

  const threadIds = perSystemAlerts.map((a) => a.thread_id);
  assert.ok(threadIds.includes('mafesa-thread-1'));
  assert.ok(threadIds.includes('evco-thread-1'));
  assert.ok(threadIds.includes('ursula-thread-1'));
  assert.ok(threadIds.includes('globalpc:TRF-EVCO-01'));
  assert.ok(threadIds.includes('aduanet:PED-MAFESA-001'));
  assert.ok(threadIds.includes('econta:INV-MAFESA-01'));

  const aduanetAlert = perSystemAlerts.find((a) => a.thread_id === 'aduanet:PED-MAFESA-001');
  assert.equal(aduanetAlert.category, 'compliance-deadline');
});

test('runCortanaPass: the MAFESA-shaped 3-system correlation emerges through the full pipeline', () => {
  const { correlatedBriefs } = runCortanaPass(FULL_ESTATE, now);

  const mafesaBrief = correlatedBriefs.find((b) => b.entity === 'MAFESA');
  assert.ok(mafesaBrief, 'expected a correlated brief for MAFESA');
  assert.equal(mafesaBrief.kind, 'cortana-correlated-brief');
  assert.equal(mafesaBrief.systems.length, 3);
  assert.deepEqual(new Set(mafesaBrief.systems), new Set(['gmail', 'aduanet', 'econta']));
  assert.equal(mafesaBrief.maxUrgency, 5);
  assert.match(mafesaBrief.text, /MAFESA/);
});

test('runCortanaPass: a second entity (EVCO) correlates across gmail + globalpc in the same pass', () => {
  const { correlatedBriefs } = runCortanaPass(FULL_ESTATE, now);

  const evcoBrief = correlatedBriefs.find((b) => b.entity === 'EVCO');
  assert.ok(evcoBrief, 'expected a correlated brief for EVCO');
  assert.deepEqual(new Set(evcoBrief.systems), new Set(['gmail', 'globalpc']));
  assert.equal(evcoBrief.maxUrgency, 5.6);
});

test('runCortanaPass: Ursula Banda (gmail-only) surfaces as a per-system alert but never a correlated brief', () => {
  const { correlatedBriefs } = runCortanaPass(FULL_ESTATE, now);
  assert.ok(!correlatedBriefs.some((b) => b.entity === 'Ursula Banda'));
});

test('runCortanaPass: exactly 2 correlated briefs total, ranked by maxUrgency descending', () => {
  const { correlatedBriefs } = runCortanaPass(FULL_ESTATE, now);
  assert.equal(correlatedBriefs.length, 2);
  assert.equal(correlatedBriefs[0].entity, 'EVCO'); // maxUrgency 5.6
  assert.equal(correlatedBriefs[1].entity, 'MAFESA'); // maxUrgency 5
});

test('runCortanaPass: missing systems (only gmail present) does not throw and returns sane empty shapes', () => {
  const result = runCortanaPass({ gmail: [SIM_GMAIL_MAFESA] }, now);
  assert.equal(result.perSystemAlerts.length, 1);
  assert.equal(result.correlatedBriefs.length, 0); // single system, MAFESA alone can't correlate
});

test('runCortanaPass: only a non-gmail system present (aduanet only) does not throw', () => {
  const result = runCortanaPass({ aduanet: [SIM_ADUANET_MAFESA] }, now);
  assert.equal(result.perSystemAlerts.length, 1);
  assert.equal(result.correlatedBriefs.length, 0);
});

test('runCortanaPass: completely empty input does not throw', () => {
  assert.deepEqual(runCortanaPass({}, now), { perSystemAlerts: [], correlatedBriefs: [] });
});

test('runCortanaPass: malformed raw record in a present system still throws (adapter validation is not bypassed)', () => {
  assert.throws(() => runCortanaPass({ globalpc: [{ eventType: 'x' }] }, now), TypeError);
});

test('denial: never produces a send/dispatch/reply action — module has no such export', async () => {
  const mod = await import('../src/cortana.mjs');
  const exportNames = Object.keys(mod);
  assert.deepEqual(exportNames, ['runCortanaPass']);
  assert.ok(!exportNames.some((n) => /send|dispatch|reply/i.test(n)), 'no send-capable export exists');
});
