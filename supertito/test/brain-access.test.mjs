// Tests for supertito/src/brain-access.mjs — SECOND-BRAIN.md's access matrix + honesty rule.
//
// All docs/users below are SIM/fixture data invented for this test — NOT real aguila-brain vault
// content (the vault's real index/query layer, [P8-W2-01], is not built yet; this module has never
// touched the real repo). Entity names (EVCO, Duratech) are used only as plausible tenant keys,
// matching SECOND-BRAIN.md's own client roster.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveBrainAccess, answerFromBrain } from '../src/brain-access.mjs';

// SIM fixture — placeholder brain docs, not real vault content.
const FOUNDER_STRATEGY_DOC = {
  id: 'aguila-brain:04-Canon/founder-strategy.md',
  category: 'strategy',
  principalOnly: true,
  snippet: 'Money Employment loop targets, founder-only figures.',
};
const BROKER_OPS_DOC = {
  id: 'aguila-brain:00-FREIGHT/broker-procedures.md',
  category: 'broker',
  snippet: 'How to file a pedimento correction.',
};
const ACCOUNTING_DOC = {
  id: 'aguila-brain:00-FREIGHT/accounting-close.md',
  category: 'accounting',
  snippet: 'Monthly close checklist.',
};
const EVCO_SHIPMENT_DOC = {
  id: 'aguila-brain:03-Clients/EVCO/trafico-9931.md',
  category: 'shipment-status',
  tenant: 'EVCO',
  snippet: 'Tráfico TRF-2026-00931 held for missing MVE E2.',
};
const DURATECH_SHIPMENT_DOC = {
  id: 'aguila-brain:03-Clients/Duratech/trafico-1204.md',
  category: 'shipment-status',
  tenant: 'Duratech',
  snippet: 'Tráfico TRF-2026-01204 released.',
};
const EVCO_INTERNAL_NOTE_DOC = {
  id: 'aguila-brain:03-Clients/EVCO/internal-note-credit-risk.md',
  category: 'internal-notes',
  tenant: 'EVCO',
  snippet: 'Internal credit-risk assessment, not for client eyes.',
};

const FOUNDER = { role: 'founder' };
const CO_PRINCIPAL = { role: 'co-principal' };
const BROKER_EMPLOYEE = { role: 'employee', roleScope: 'broker' };
const ACCOUNTING_EMPLOYEE = { role: 'employee', roleScope: 'accounting' };
const EVCO_CLIENT = { role: 'client', tenant: 'EVCO' };
const DURATECH_CLIENT = { role: 'client', tenant: 'Duratech' };

test('founder has full access: principal-only, any role-scoped, any tenant, even internal-notes', () => {
  for (const doc of [FOUNDER_STRATEGY_DOC, BROKER_OPS_DOC, ACCOUNTING_DOC, EVCO_SHIPMENT_DOC, DURATECH_SHIPMENT_DOC, EVCO_INTERNAL_NOTE_DOC]) {
    const result = resolveBrainAccess(FOUNDER, doc);
    assert.equal(result.allow, true, `founder should see ${doc.id}`);
  }
});

test('co-principal (father) has the same full access as founder', () => {
  for (const doc of [FOUNDER_STRATEGY_DOC, EVCO_INTERNAL_NOTE_DOC, DURATECH_SHIPMENT_DOC]) {
    const result = resolveBrainAccess(CO_PRINCIPAL, doc);
    assert.equal(result.allow, true, `co-principal should see ${doc.id}`);
  }
});

test('employee is blocked from a principal-only doc even when roleScope would otherwise match nothing else', () => {
  const result = resolveBrainAccess(BROKER_EMPLOYEE, FOUNDER_STRATEGY_DOC);
  assert.equal(result.allow, false);
  assert.match(result.reason, /principal-only/);
});

test('employee sees a doc matching their own roleScope', () => {
  const result = resolveBrainAccess(BROKER_EMPLOYEE, BROKER_OPS_DOC);
  assert.equal(result.allow, true);
  assert.match(result.reason, /role-scope match/);
});

test('employee is blocked from a doc scoped to a different role', () => {
  const result = resolveBrainAccess(BROKER_EMPLOYEE, ACCOUNTING_DOC);
  assert.equal(result.allow, false);
  assert.match(result.reason, /role-scope mismatch/);
  // cross-check: the accounting employee is correctly let into their own lane
  assert.equal(resolveBrainAccess(ACCOUNTING_EMPLOYEE, ACCOUNTING_DOC).allow, true);
});

test('employee with no roleScope assigned gets no grant (missing scope is not full access)', () => {
  const result = resolveBrainAccess({ role: 'employee' }, BROKER_OPS_DOC);
  assert.equal(result.allow, false);
  assert.match(result.reason, /no roleScope/);
});

test('client is blocked from another tenant\'s doc (never cross-tenant)', () => {
  const result = resolveBrainAccess(EVCO_CLIENT, DURATECH_SHIPMENT_DOC);
  assert.equal(result.allow, false);
  assert.match(result.reason, /tenant mismatch/);
  // cross-check: the client sees their own tenant's doc fine
  assert.equal(resolveBrainAccess(EVCO_CLIENT, EVCO_SHIPMENT_DOC).allow, true);
});

test('client is blocked from internal-notes category even within their own tenant', () => {
  const result = resolveBrainAccess(EVCO_CLIENT, EVCO_INTERNAL_NOTE_DOC);
  assert.equal(result.allow, false);
  assert.match(result.reason, /internal-notes/);
});

test('a client is not wrongly denied their own tenant\'s doc when the tenant strings differ only by casing/whitespace (v3.7 audit fix)', () => {
  const docDifferentCasing = { ...EVCO_SHIPMENT_DOC, tenant: ' evco ' };
  const result = resolveBrainAccess(EVCO_CLIENT, docDifferentCasing);
  assert.equal(result.allow, true);
});

test('client is blocked from a principal-only doc even when its tenant field matches their own (v3.7 audit fix — a real bug: this check previously lived only in the employee branch)', () => {
  const principalOnlyButTenantTagged = {
    id: 'aguila-brain:03-Clients/EVCO/founder-only-margin-notes.md',
    category: 'strategy',
    tenant: 'EVCO',
    principalOnly: true,
    snippet: 'Founder-only margin/negotiation notes about the EVCO account.',
  };
  const result = resolveBrainAccess(EVCO_CLIENT, principalOnlyButTenantTagged);
  assert.equal(result.allow, false);
  assert.match(result.reason, /principal-only/);
});

test('client with no tenant assigned gets no grant against any tenant-owned doc', () => {
  const result = resolveBrainAccess({ role: 'client' }, EVCO_SHIPMENT_DOC);
  assert.equal(result.allow, false);
  assert.match(result.reason, /tenant mismatch/);
});

test('resolveBrainAccess rejects malformed input instead of guessing a decision', () => {
  assert.throws(() => resolveBrainAccess(undefined, EVCO_SHIPMENT_DOC), TypeError);
  assert.throws(() => resolveBrainAccess(EVCO_CLIENT, undefined), TypeError);
  assert.throws(() => resolveBrainAccess({ role: 'contractor' }, EVCO_SHIPMENT_DOC), TypeError);
});

// --- answerFromBrain: the honesty rule ---

test('answerFromBrain: founder query with matches returns a cited answer', () => {
  const result = answerFromBrain('what happened with EVCO tráfico 9931?', [EVCO_SHIPMENT_DOC], FOUNDER);
  assert.equal(result.cited.length, 1);
  assert.deepEqual(result.cited, [EVCO_SHIPMENT_DOC.id]);
  assert.match(result.answer, /TRF-2026-00931/);
  assert.match(result.answer, new RegExp(EVCO_SHIPMENT_DOC.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('answerFromBrain: client query only cites the docs their access allows, silently drops the rest', () => {
  const result = answerFromBrain(
    'status update',
    [EVCO_SHIPMENT_DOC, DURATECH_SHIPMENT_DOC, EVCO_INTERNAL_NOTE_DOC],
    EVCO_CLIENT,
  );
  assert.deepEqual(result.cited, [EVCO_SHIPMENT_DOC.id]);
  assert.match(result.answer, /held for missing MVE/);
});

test('answerFromBrain: honesty rule — no allowed doc means "not in the brain yet", never fabricated', () => {
  // A real match exists (DURATECH_SHIPMENT_DOC) but not for this client — from EVCO's point of
  // view that must be indistinguishable from no match at all.
  const result = answerFromBrain('any Duratech shipments?', [DURATECH_SHIPMENT_DOC], EVCO_CLIENT);
  assert.deepEqual(result, { answer: 'not in the brain yet', cited: [] });
});

test('answerFromBrain: honesty rule also holds for a genuinely empty match set', () => {
  const result = answerFromBrain('anything about a shipment that does not exist', [], FOUNDER);
  assert.deepEqual(result, { answer: 'not in the brain yet', cited: [] });
});

test('answerFromBrain rejects malformed input instead of guessing', () => {
  assert.throws(() => answerFromBrain('', [], FOUNDER), TypeError);
  assert.throws(() => answerFromBrain('q', 'not-an-array', FOUNDER), TypeError);
});

test('denial: module exposes no send/dispatch/reply-capable export', async () => {
  const mod = await import('../src/brain-access.mjs');
  const exportNames = Object.keys(mod);
  assert.deepEqual(new Set(exportNames), new Set(['resolveBrainAccess', 'answerFromBrain']));
  assert.ok(!exportNames.some((n) => /send|dispatch|reply/i.test(n)), 'no send-capable export exists');
});
