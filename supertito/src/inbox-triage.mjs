// Inbox triage — SuperTito's ownership of ai@renatozapata.com (canon P2-W2-04, founder ruling
// 2026-07-30: "I want SuperTito in charge of ai@renatozapata.com"). Read + triage + draft only —
// NEVER send (§0.4-8, no exception for this grant). Channel-agnostic classify/rank; the caller wires
// in a real Gmail search + draft client (this session's Gmail MCP proves the access exists).

const STALE_DAYS = 3; // an unanswered inbound thread older than this ranks as a hot-lead risk
const URGENT_KEYWORDS = [
  'urgent', 'urgente', 'asap', 'hoy mismo', 'primera hora', 'detenid', 'embargo',
];
// v3.8 audit fix: 'sat ' required a literal trailing space, so real text ending "...ante el SAT."
// or "...ante el SAT" (end of sentence/string, no space after) silently failed to match — a
// genuine SAT-compliance thread could fall through to a lower category. Keywords are now matched
// via word-boundary regex (see hasAny below), so the trailing-space workaround is gone.
const COMPLIANCE_KEYWORDS = ['mve', 'vucem', 'e2', 'sat', 'multa', 'aduana'];
const LEAD_KEYWORDS = ['trial', 'prueba', 'adjunto', 'link', 'usuario', 'acceso'];

const MS_PER_DAY = 86_400_000;

/**
 * @param {{ id: string, dateMs: number, fromMe: boolean, subject: string, snippet: string }[]} messages
 *   Messages in one thread, any order — the "latest" one is derived by dateMs, not array position
 *   (v3.8 audit fix: this used to trust `messages[messages.length - 1]` per the old "oldest first"
 *   precondition; an out-of-order array silently misclassified the thread using a stale message).
 * @param {number} nowMs
 */
export function classifyThread(messages, nowMs) {
  if (!messages.length) return { category: 'empty', urgency: 0 };
  const last = messages.reduce((latest, m) => (m.dateMs > latest.dateMs ? m : latest));
  const text = `${last.subject} ${last.snippet}`.toLowerCase();
  const ageDays = (nowMs - last.dateMs) / MS_PER_DAY;
  const awaitingReply = !last.fromMe; // last message is inbound, not yet answered

  const hasAny = (kws) => kws.some((k) => new RegExp(`\\b${k}\\b`).test(text));

  // v3.8 audit fix: these used to be an if/else-if chain checked in a fixed order (stale-hot-lead
  // before compliance-deadline), so a thread matching BOTH a lead keyword and a compliance keyword
  // at borderline staleness got the LOWER stale-hot-lead urgency instead of the flat, always-higher
  // compliance-deadline urgency — silently deprioritizing a genuinely regulatory-deadline-bearing
  // thread. Every applicable category is now evaluated and the highest-urgency one wins, so a
  // thread's real regulatory/urgency signal can never be masked by a lower-urgency category
  // matching first.
  const candidates = [{ category: 'routine', urgency: 1 }];
  if (awaitingReply) {
    candidates.push({ category: 'awaiting-reply', urgency: 1.5 });
    if (hasAny(URGENT_KEYWORDS)) candidates.push({ category: 'urgent-client', urgency: 4 });
    if (hasAny(COMPLIANCE_KEYWORDS)) candidates.push({ category: 'compliance-deadline', urgency: 5 });
    if (hasAny(LEAD_KEYWORDS) && ageDays >= STALE_DAYS) {
      candidates.push({ category: 'stale-hot-lead', urgency: 3 + Math.min(ageDays / 7, 3) }); // caps ~6
    }
  }
  const { category, urgency } = candidates.reduce((max, c) => (c.urgency > max.urgency ? c : max));

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
