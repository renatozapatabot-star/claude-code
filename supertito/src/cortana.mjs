// Cortana pass — the capstone orchestrator for canon [P2-W3-02] ("he's copied on every thread
// doesn't answer but helps out the whole ecosystem") and [WO-17] (globalpc/Aduanet/econta/Gmail
// estate-wide observation). This module wires together three already-independently-tested pieces —
// system-adapters.mjs (shape conversion), inbox-triage.mjs (classify/rank/alert), correlate.mjs
// (cross-system entity grouping) — into one pure pass over a snapshot of raw observations from every
// system. It reads and classifies; it never answers, acts, or sends (§0.4-8, ecosystem-wide per
// [P2-W3-02]) — there is exactly one export, and it is not send-capable.

import { classifyThread, toAlert } from './inbox-triage.mjs';
import { adaptGlobalpc, adaptAduanet, adaptEconta } from './system-adapters.mjs';
import { correlate } from './correlate.mjs';

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

// v3.7 audit fix: without a stoplist, the ALL-CAPS fallback happily adopted generic regulatory/
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
  const lower = text.toLowerCase();
  // Prefer the KNOWN_ENTITIES name that actually occurs earliest in the text (v3.7 audit fix: this
  // used to return whichever known name came first in the static array, regardless of which one
  // the text was actually about — a message mentioning two known clients in passing could
  // misattribute the observation to the wrong one).
  let best = null;
  for (const name of KNOWN_ENTITIES) {
    const idx = lower.indexOf(name.toLowerCase());
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
 * @returns {{ perSystemAlerts: object[], correlatedBriefs: object[] }}
 */
export function runCortanaPass(rawObservationsBySystem, nowMs) {
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

  const perSystemAlerts = observations
    .map((obs) => toAlert(obs.threadId, obs.classification))
    .filter((alert) => alert !== null);

  const correlatedBriefs = correlate(observations, nowMs);

  return { perSystemAlerts, correlatedBriefs };
}
