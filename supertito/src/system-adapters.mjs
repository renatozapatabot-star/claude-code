// System adapters — thin translators from the three [WO-17] estate systems (globalpc/Sistema de
// Tráfico, Aduanet, econta) into inbox-triage.mjs's canonical {id, dateMs, fromMe, subject, snippet}
// shape (per [P2-W3-02]'s "Cortana" law: observe every system, feed the same classify/rank/toAlert
// pipeline, never answer/act/send). [WO-17] is OPEN — no real credential to any of these three systems
// exists in this repo today. Nothing below has ever touched a live globalpc/Aduanet/econta endpoint.
//
// PLACEHOLDER SHAPE DISCLAIMER (read before trusting a field name here):
// The three raw-input typedefs below are NOT the real API contract of globalpc/Aduanet/econta — no
// such contract has been supplied to this session. They are this session's best-guess placeholder,
// modeled loosely on the field names the canon and POLICY.md already reference (tráfico numbers,
// pedimento/MVE compliance terms, invoice/accounting terms). They exist only so the adapter + its
// test have something concrete to map. The moment [WO-17] lands real API docs, these typedefs and the
// mapping bodies must be corrected to match the real payload — until then, treat every field name in
// this file's typedefs as ASSUMED-PENDING-WO-17, not fact.

/**
 * ASSUMED-PENDING-WO-17 — placeholder shape for a globalpc (Sistema de Tráfico) event record.
 * Real field names are unknown until [WO-17] supplies API docs for `soportetrafico@globalpc.net`.
 * @typedef {Object} GlobalpcRaw
 * @property {string} traficoId - tráfico number/identifier (placeholder field name)
 * @property {number} eventEpochMs - event timestamp, epoch milliseconds (placeholder: real API may use seconds or ISO string)
 * @property {boolean} [originatedByBroker] - true if Renato Zapata & Company authored this event, not the carrier/system (placeholder)
 * @property {string} eventType - e.g. "document-uploaded", "hold-flagged" (placeholder taxonomy, not confirmed)
 * @property {string} [detail] - free-text detail/body (placeholder)
 */

/**
 * ASSUMED-PENDING-WO-17 — placeholder shape for an Aduanet customs-crossing status record.
 * Real field names are unknown until [WO-17] supplies API docs for Aduanet.
 * @typedef {Object} AduanetRaw
 * @property {string} pedimentoRef - pedimento/crossing reference (placeholder field name)
 * @property {number} statusChangedAtMs - status-change timestamp, epoch milliseconds (placeholder)
 * @property {boolean} [brokerInitiated] - true if the broker (not customs/carrier) initiated this status entry (placeholder)
 * @property {string} statusCode - e.g. "held-24h", "released", "mve-pending" (placeholder taxonomy, not confirmed)
 * @property {string} [note] - free-text note (placeholder)
 */

/**
 * ASSUMED-PENDING-WO-17 — placeholder shape for an econta (accounting/invoicing) record.
 * Real field names are unknown until [WO-17] supplies API docs for econta.
 * @typedef {Object} EcontaRaw
 * @property {string} invoiceId - invoice/account-entry identifier (placeholder field name)
 * @property {number} postedAtMs - posting timestamp, epoch milliseconds (placeholder)
 * @property {boolean} [issuedByUs] - true if Renato Zapata & Company issued this entry, not the client/vendor (placeholder)
 * @property {string} memo - line memo / description (placeholder, may map to a real "concepto" field)
 * @property {string} [reference] - short reference/summary text (placeholder)
 */

function requireString(value, label) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

function requireFiniteNumber(value, label) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${label} must be a finite number`);
  }
  return value;
}

// v3.7 audit fix: `raw.field ?? ''` only substitutes for null/undefined — a defined-but-non-string
// falsy value (e.g. `detail: 0` or `detail: false`) passed straight into the canonical `snippet`
// field, silently violating the documented `{ snippet: string }` shape contract every downstream
// consumer (classifyThread, toAlert) assumes holds.
function coerceOptionalString(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  throw new TypeError(`optional free-text field must be a string or null/undefined, got ${typeof value}`);
}

/**
 * Adapts a placeholder globalpc (Sistema de Tráfico) raw record to the canonical thread-message shape.
 * @param {GlobalpcRaw} raw
 * @returns {{ id: string, dateMs: number, fromMe: boolean, subject: string, snippet: string }}
 */
export function adaptGlobalpc(raw) {
  if (!raw || typeof raw !== 'object') throw new TypeError('adaptGlobalpc: raw record required');
  const id = `globalpc:${requireString(raw.traficoId, 'traficoId')}`;
  const dateMs = requireFiniteNumber(raw.eventEpochMs, 'eventEpochMs');
  const eventType = requireString(raw.eventType, 'eventType');
  return {
    id,
    dateMs,
    fromMe: Boolean(raw.originatedByBroker),
    subject: `[Tráfico ${raw.traficoId}] ${eventType}`,
    snippet: coerceOptionalString(raw.detail),
  };
}

/**
 * Adapts a placeholder Aduanet (customs-crossing status) raw record to the canonical thread-message shape.
 * @param {AduanetRaw} raw
 * @returns {{ id: string, dateMs: number, fromMe: boolean, subject: string, snippet: string }}
 */
export function adaptAduanet(raw) {
  if (!raw || typeof raw !== 'object') throw new TypeError('adaptAduanet: raw record required');
  const id = `aduanet:${requireString(raw.pedimentoRef, 'pedimentoRef')}`;
  const dateMs = requireFiniteNumber(raw.statusChangedAtMs, 'statusChangedAtMs');
  const statusCode = requireString(raw.statusCode, 'statusCode');
  return {
    id,
    dateMs,
    fromMe: Boolean(raw.brokerInitiated),
    subject: `[Aduanet ${raw.pedimentoRef}] ${statusCode}`,
    snippet: coerceOptionalString(raw.note),
  };
}

/**
 * Adapts a placeholder econta (accounting/invoicing) raw record to the canonical thread-message shape.
 * @param {EcontaRaw} raw
 * @returns {{ id: string, dateMs: number, fromMe: boolean, subject: string, snippet: string }}
 */
export function adaptEconta(raw) {
  if (!raw || typeof raw !== 'object') throw new TypeError('adaptEconta: raw record required');
  const id = `econta:${requireString(raw.invoiceId, 'invoiceId')}`;
  const dateMs = requireFiniteNumber(raw.postedAtMs, 'postedAtMs');
  const memo = requireString(raw.memo, 'memo');
  return {
    id,
    dateMs,
    fromMe: Boolean(raw.issuedByUs),
    subject: `[econta ${raw.invoiceId}] ${memo}`,
    snippet: coerceOptionalString(raw.reference),
  };
}
