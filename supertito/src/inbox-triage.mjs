// Inbox triage — SuperTito's ownership of ai@renatozapata.com (canon P2-W2-04, founder ruling
// 2026-07-30: "I want SuperTito in charge of ai@renatozapata.com"). Read + triage + draft only —
// NEVER send (§0.4-8, no exception for this grant). Channel-agnostic classify/rank; the caller wires
// in a real Gmail search + draft client (this session's Gmail MCP proves the access exists).

const STALE_DAYS = 3; // an unanswered inbound thread older than this ranks as a hot-lead risk
const URGENT_KEYWORDS = [
  'urgent', 'urgente', 'asap', 'hoy mismo', 'primera hora', 'detenid', 'embargo',
];
const COMPLIANCE_KEYWORDS = ['mve', 'vucem', 'e2', 'sat ', 'multa', 'aduana'];
const LEAD_KEYWORDS = ['trial', 'prueba', 'adjunto', 'link', 'usuario', 'acceso'];

const MS_PER_DAY = 86_400_000;

/**
 * @param {{ id: string, dateMs: number, fromMe: boolean, subject: string, snippet: string }[]} messages
 *   Chronological messages in one thread (oldest first).
 * @param {number} nowMs
 */
export function classifyThread(messages, nowMs) {
  if (!messages.length) return { category: 'empty', urgency: 0 };
  const last = messages[messages.length - 1];
  const text = `${last.subject} ${last.snippet}`.toLowerCase();
  const ageDays = (nowMs - last.dateMs) / MS_PER_DAY;
  const awaitingReply = !last.fromMe; // last message is inbound, not yet answered

  const hasAny = (kws) => kws.some((k) => text.includes(k));

  let category = 'routine';
  let urgency = 1;

  if (awaitingReply && hasAny(LEAD_KEYWORDS) && ageDays >= STALE_DAYS) {
    category = 'stale-hot-lead';
    urgency = 3 + Math.min(ageDays / 7, 3); // grows with staleness, caps around 6
  } else if (awaitingReply && hasAny(COMPLIANCE_KEYWORDS)) {
    category = 'compliance-deadline';
    urgency = 5;
  } else if (awaitingReply && hasAny(URGENT_KEYWORDS)) {
    category = 'urgent-client';
    urgency = 4;
  } else if (awaitingReply) {
    category = 'awaiting-reply';
    urgency = 1.5;
  }

  return { category, urgency: Math.round(urgency * 10) / 10, ageDays: Math.round(ageDays * 10) / 10, awaitingReply };
}

/** Ranks threads by urgency descending; stable tiebreak by age (older first). */
export function rankThreads(threadClassifications) {
  return [...threadClassifications].sort((a, b) =>
    b.urgency - a.urgency || (b.ageDays ?? 0) - (a.ageDays ?? 0));
}

/**
 * Builds the alert payload for the P6 unified rail (never sends anything itself — pure function).
 */
export function toAlert(threadId, classification) {
  if (classification.urgency < 3) return null; // routine/low stays out of the phone stream
  return {
    kind: 'inbox-triage-alert',
    thread_id: threadId,
    category: classification.category,
    urgency: classification.urgency,
    text: `[${classification.category}] thread ${threadId} — ${classification.ageDays}d old, urgency ${classification.urgency}`,
  };
}
