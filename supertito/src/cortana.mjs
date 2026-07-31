// Cortana pass — the capstone orchestrator for canon [P2-W3-02] ("he's copied on every thread
// doesn't answer but helps out the whole ecosystem") and [WO-17] (globalpc/Aduanet/econta/Gmail
// estate-wide observation). This module wires together three already-independently-tested pieces —
// system-adapters.mjs (shape conversion), inbox-triage.mjs (classify/rank/alert), correlate.mjs
// (cross-system entity grouping), escalation.mjs (batch-cap/mirrored-deferral flood guard) — into
// one pure pass over a snapshot of raw observations from every system. It reads and classifies; it
// never answers, acts, or sends (§0.4-8, ecosystem-wide per [P2-W3-02]) — there is exactly one
// export, and it is not send-capable.

import { classifyThread, toAlert } from './inbox-triage.mjs';
import { adaptGlobalpc, adaptAduanet, adaptEconta } from './system-adapters.mjs';
import { correlate } from './correlate.mjs';
import { normalizeKey } from './normalize.mjs';
import { createEscalator, DEFAULT_BATCH_CAP } from './escalation.mjs';

// ENTITY EXTRACTION IS A HONEST HEURISTIC, NOT NLP/NER: this is a plain substring match against a
// short, hand-maintained list of known counterparties (drawn from the canon's own client roster),
// plus a crude ALL-CAPS-acronym fallback for anything not on the list. It is good enough to prove
// the cross-system correlation plumbing works end to end; it is NOT a real named-entity recognizer
// and will misgroup or fail silently on entities outside this list — the fallback below exists
// precisely so an unrecognized entity gets its own unique, non-correlating key instead of a wrong
// guess.
const KNOWN_ENTITIES = ['MAFESA', 'EVCO', 'Duratech', 'Milacron', 'Foam Supplies', 'Ursula Banda'];

// Minimum length 4 keeps this from matching the 3-letter ID-prefix noise the adapters' own
// templated subjects introduce (e.g. "TRF", "PED", "INV" inside tráfico/pedimento/invoice IDs) —
// a known, documented limitation of a heuristic this simple, not a guarantee against every false
// positive (a real 4+ letter ID prefix could still slip through).
const CAPS_TOKEN_RE = /\b[A-ZÁÉÍÓÚÑ]{4,}\b/g;

// v3.8 audit fix: without a stoplist, the ALL-CAPS fallback happily adopted generic regulatory/
// urgency vocabulary (VUCEM, MVE, URGENTE...) as a "client name" whenever no KNOWN_ENTITIES name
// was present — silently merging two unrelated clients' observations into one false correlated
// brief the moment both mentioned the same compliance term. Mirrors inbox-triage.mjs's own
// COMPLIANCE_KEYWORDS/URGENT_KEYWORDS vocabulary (kept as a separate literal list here rather than
// importing, since inbox-triage.mjs doesn't export those arrays and duplicating a half-dozen
// uppercase words is cheaper than widening that module's public surface for this alone).
const GENERIC_CAPS_STOPLIST = new Set([
  'MVE', 'VUCEM', 'SAT', 'ASAP', 'URGENTE', 'MULTA', 'ADUANA', 'HELD', 'RELEASED', 'PENDING', 'E2',
]);

function textOf(subject, snippet) {
  return `${subject ?? ''} ${snippet ?? ''}`;
}

/** @returns {string|null} a recognized entity name, or null if the heuristic found nothing */
function extractEntity(text) {
  const lower = normalizeKey(text);
  // Prefer the KNOWN_ENTITIES name that actually occurs earliest in the text (v3.8 audit fix: this
  // used to return whichever known name came first in the static array, regardless of which one
  // the text was actually about — a message mentioning two known clients in passing could
  // misattribute the observation to the wrong one). The extra trim() normalizeKey applies over the
  // original bare toLowerCase() only shifts index positions uniformly, and `idx` here is only ever
  // compared against another `idx` from this same normalized string, never used to slice the
  // original `text` — so the trim is a no-op for this function's actual behavior.
  let best = null;
  for (const name of KNOWN_ENTITIES) {
    const idx = lower.indexOf(normalizeKey(name));
    if (idx !== -1 && (best === null || idx < best.idx)) best = { name, idx };
  }
  if (best) return best.name;

  // Fallback: any 4+ letter all-caps token NOT in the generic stoplist above.
  for (const match of text.matchAll(CAPS_TOKEN_RE)) {
    if (!GENERIC_CAPS_STOPLIST.has(match[0])) return match[0];
  }
  return null;
}

function observationFromGmailThread(thread, nowMs) {
  const messages = thread.messages ?? [];
  const classification = classifyThread(messages, nowMs);
  const last = messages[messages.length - 1];
  const text = last ? textOf(last.subject, last.snippet) : '';
  // Fallback key is unique per thread so an unrecognized entity never spuriously correlates.
  const entity = extractEntity(text) ?? `gmail:${thread.threadId}`;
  return { system: 'gmail', threadId: thread.threadId, entity, classification };
}

function observationFromAdaptedRaw(system, adapt, raw, nowMs) {
  const msg = adapt(raw); // adapters throw TypeError on malformed input — deliberately not caught
  const classification = classifyThread([msg], nowMs);
  const entity = extractEntity(textOf(msg.subject, msg.snippet)) ?? `${system}:${msg.id}`;
  return { system, threadId: msg.id, entity, classification };
}

// [WO-17] flood guard: a real-credential connection to globalpc/Aduanet/econta/Gmail can surface
// far more observations in one pass than a founder's phone can usefully absorb. escalation.mjs's
// batch-cap/mirrored-deferral pattern already solves exactly this (built and tested against
// [P6-W2-01]'s ledger-escalation flow) but had never been imported by anything until now. Reused
// as-is here rather than re-implemented: same cap semantics, same "nothing silently vanishes, it's
// deferred with a visible trail" guarantee.
//
// The escalator's own contract is "oldest-due-first"; there is no real due-time for an alert or a
// correlated brief, so urgency is remapped onto it inversely (dueMs = -urgency) so "oldest due"
// becomes "highest urgency fires first" — the founder always sees the most urgent items, and lower-
// urgency items are the ones that defer. A fresh escalator is created per call: runCortanaPass is
// documented as a pure one-shot pass over one snapshot, so there is no cross-call carry-over state
// to persist here (a future scheduled/looping caller that wants oldest-first fairness *across*
// ticks would hold one escalator instance across calls instead — this function's job is only to
// stop a single pass's output from being unbounded).
function applyEscalationCap(items, idOf, urgencyOf, cap, channel) {
  if (items.length === 0) return { kept: [], mirrors: [] };
  const mirrors = [];
  const escalator = createEscalator({ cap, onMirror: (m) => mirrors.push({ ...m, channel }) });
  const wrapped = items.map((item, index) => ({ id: idOf(item, index), dueMs: -urgencyOf(item), item }));
  const { fired } = escalator.scan(wrapped);
  const byId = new Map(wrapped.map((w) => [w.id, w.item]));
  const kept = fired.map((id) => byId.get(id));
  return { kept, mirrors };
}

/**
 * Runs one Cortana pass over a snapshot of raw observations from every wired system. Pure and
 * read-only: adapts, classifies, and correlates already-collected data — it never fetches, sends,
 * replies, or dispatches anything itself. Any of the four keys may be absent (per [WO-17], real
 * credentials for globalpc/Aduanet/econta don't exist yet) and this must not throw.
 *
 * @param {{ gmail?: {threadId: string, messages: object[]}[],
 *   globalpc?: import('./system-adapters.mjs').GlobalpcRaw[],
 *   aduanet?: import('./system-adapters.mjs').AduanetRaw[],
 *   econta?: import('./system-adapters.mjs').EcontaRaw[] }} rawObservationsBySystem
 * @param {number} nowMs
 * @param {{ cap?: number }} [opts] - batch cap applied independently to perSystemAlerts and
 *   correlatedBriefs (each channel gets its own budget); defaults to escalation.mjs's own
 *   DEFAULT_BATCH_CAP (25) so the two ratify to the same [WO-04] value unless the founder sets one.
 * @returns {{ perSystemAlerts: object[], correlatedBriefs: object[], deferrals: object[] }}
 *   deferrals is escalation.mjs's mirrored trail — empty unless a channel actually exceeded cap;
 *   never a silent drop, always visible evidence of what got deferred and why.
 */
export function runCortanaPass(rawObservationsBySystem, nowMs, opts = {}) {
  const cap = opts.cap ?? DEFAULT_BATCH_CAP;
  const bySystem = rawObservationsBySystem ?? {};
  const observations = [];

  for (const thread of bySystem.gmail ?? []) {
    observations.push(observationFromGmailThread(thread, nowMs));
  }
  for (const raw of bySystem.globalpc ?? []) {
    observations.push(observationFromAdaptedRaw('globalpc', adaptGlobalpc, raw, nowMs));
  }
  for (const raw of bySystem.aduanet ?? []) {
    observations.push(observationFromAdaptedRaw('aduanet', adaptAduanet, raw, nowMs));
  }
  for (const raw of bySystem.econta ?? []) {
    observations.push(observationFromAdaptedRaw('econta', adaptEconta, raw, nowMs));
  }

  const rawPerSystemAlerts = observations
    .map((obs) => toAlert(obs.threadId, obs.classification))
    .filter((alert) => alert !== null);

  const rawCorrelatedBriefs = correlate(observations, nowMs);

  const alertCap = applyEscalationCap(
    rawPerSystemAlerts, (a) => a.thread_id, (a) => a.urgency, cap, 'perSystemAlerts',
  );
  const briefCap = applyEscalationCap(
    rawCorrelatedBriefs, (b) => b.entity, (b) => b.maxUrgency, cap, 'correlatedBriefs',
  );

  return {
    perSystemAlerts: alertCap.kept,
    correlatedBriefs: briefCap.kept,
    deferrals: [...alertCap.mirrors, ...briefCap.mirrors],
  };
}
