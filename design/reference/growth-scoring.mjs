// Growth funnel scoring — P7 Growth pillar (spec: FREIGHT-GROWTH.md, owner P7-W1-01). The doc's
// through-line is one linear funnel per lead: prove value -> quote -> cleared-doc proof ->
// follow-up -> outreach -> onboard, everything draft-only/founder-signed, never auto-sent
// (canon §0.4-8). This module is a pure scoring function only — it decides *where a lead sits*
// and *how ready it is*; wiring a real CRM/Gmail source into it, and turning the result into an
// actual draft, is future work per the same repo convention as supertito's adapters (no live
// system access here, no fabricated data — the lead objects below are inputs the caller supplies).

const STALE_DAYS_GROWTH = 14; // reuses inbox-triage.mjs's "unanswered past a window = escalate"
// idea (its STALE_DAYS=3 is tuned for a same-day email SLA). A sales/lead-gen cadence is slower —
// nobody expects a same-day reply to an outreach touch — so the window is wider here. Same concept
// (silence past a window = gone cold, escalate), proportionally re-tuned for this context, not a
// different rule.

const STAGE_BASE_SCORE = Object.freeze({
  prove: 15,
  quote: 35,
  'cleared-doc': 55,
  'follow-up': 65,
  outreach: 80,
  onboard: 95,
  'stale-needs-attention': 20, // deliberately low: a cold lead isn't "ready", it needs attention first
});

function clampScore(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * @typedef {object} Lead
 * @property {boolean} hasProofArtifactSent - stage 1: a prove-value artifact (cost-optimizer /
 *   evco-audit-report style savings or compliance report) has already been sent to this lead.
 * @property {boolean} hasQuoteSent - stage 2: a rate-quote-generator quote has already been sent.
 * @property {number} daysSinceLastTouch - days since the most recent contact of any kind (ours
 *   outbound or their inbound reply, whichever is later). 0 = touched today.
 * @property {boolean} repliedLast - true if the most recent touch in the thread was THEM replying
 *   (ball is in our court); false if we're the ones waiting on a reply.
 * @property {boolean} complianceClean - stage 3 gate: the cleared-doc/compliance record (MVE/E2,
 *   USMCA cert, etc.) is clean and shareable as proof, per the doc's client-scoped cleared-doc stage.
 * @property {boolean} priorClient - true if this lead is an existing FREIGHT client (an
 *   expansion/repeat conversation) rather than a net-new prospect.
 */

/**
 * Scores one lead's position in the P7 funnel. Pure function — no wall-clock reads, no I/O, no
 * send-capable behavior; the caller supplies `daysSinceLastTouch` (as of whatever "now" they mean).
 *
 * Precedence (checked top to bottom, first match wins, matching classifyThread's style):
 *   1. Gone cold (unanswered past the stale window) overrides everything else the funnel would say —
 *      mirrors inbox-triage's stale-hot-lead outranking a merely "awaiting-reply" classification.
 *   2. Otherwise walk the funnel gates in the doc's own order: prove -> quote -> cleared-doc ->
 *      follow-up (sent everything, still waiting, but not yet stale) -> outreach/onboard split.
 *   3. Once proof + quote + clean compliance are sent AND they've replied, the lead has proven
 *      itself convertible. A net-new prospect at that point is ready to draft the service agreement
 *      (`onboard`). An existing client at that point already has an agreement — the doc's outreach
 *      stage (LinkedIn-network draws) is the productive next move for them instead, not onboarding.
 *
 * @param {Lead} lead
 * @returns {{ stage: 'prove'|'quote'|'cleared-doc'|'follow-up'|'outreach'|'onboard'|
 *   'stale-needs-attention', readinessScore: number, reason: string }}
 */
export function scoreLeadReadiness(lead) {
  const {
    hasProofArtifactSent = false,
    hasQuoteSent = false,
    daysSinceLastTouch: rawDaysSinceLastTouch = 0,
    repliedLast = false,
    complianceClean = false,
    priorClient = false,
  } = lead ?? {};

  // v3.8 audit fix: a non-finite (NaN, from real upstream date-math on a missing timestamp) or
  // negative (clock-skew/timezone bug) daysSinceLastTouch used to propagate unvalidated —  NaN
  // silently corrupted readinessScore and broke rankLeads' numeric sort, and a negative value
  // could drive the follow-up stage's freshnessPenalty negative, pushing its score above 95
  // (onboard's legitimate ceiling) and inverting the intended stage ordering. Defaults to 0
  // ("touched today") rather than throwing, matching this function's existing lenient-defaults
  // style (unlike system-adapters.mjs's strict required-field validation, which guards a different
  // kind of boundary — real external input, not an optional caller-supplied number).
  const daysSinceLastTouch = Number.isFinite(rawDaysSinceLastTouch) && rawDaysSinceLastTouch >= 0
    ? rawDaysSinceLastTouch
    : 0;

  if (!repliedLast && daysSinceLastTouch >= STALE_DAYS_GROWTH) {
    const overdueDays = daysSinceLastTouch - STALE_DAYS_GROWTH;
    return {
      stage: 'stale-needs-attention',
      readinessScore: clampScore(STAGE_BASE_SCORE['stale-needs-attention'] - overdueDays / 2),
      reason: `${Math.round(daysSinceLastTouch)}d since last touch with no reply (stale window is `
        + `${STALE_DAYS_GROWTH}d) — gone cold, needs an outreach-style follow-up to re-engage before `
        + 'anything else in the funnel moves',
    };
  }

  if (!hasProofArtifactSent) {
    return {
      stage: 'prove',
      readinessScore: STAGE_BASE_SCORE.prove,
      reason: 'no proof-of-value artifact sent yet — start with a savings/compliance report',
    };
  }

  if (!hasQuoteSent) {
    return {
      stage: 'quote',
      readinessScore: STAGE_BASE_SCORE.quote,
      reason: 'proof-of-value sent — send the rate quote next',
    };
  }

  if (!complianceClean) {
    return {
      stage: 'cleared-doc',
      readinessScore: STAGE_BASE_SCORE['cleared-doc'],
      reason: 'proof + quote sent, but the cleared-doc/compliance record is not clean yet',
    };
  }

  if (!repliedLast) {
    // Not stale yet (checked above) — score eases down as it nears the stale window so rankLeads
    // naturally surfaces "about to go cold" leads above fresher ones within this same stage.
    const freshnessPenalty = Math.round((daysSinceLastTouch / STALE_DAYS_GROWTH) * 20);
    return {
      stage: 'follow-up',
      readinessScore: clampScore(STAGE_BASE_SCORE['follow-up'] - freshnessPenalty),
      reason: `proof + quote + clean compliance sent, awaiting reply (${Math.round(daysSinceLastTouch)}d, `
        + 'not yet stale)',
    };
  }

  if (priorClient) {
    return {
      stage: 'outreach',
      readinessScore: STAGE_BASE_SCORE.outreach,
      reason: 'existing client, engaged and compliance-clean — good candidate for LinkedIn-network '
        + 'referral outreach rather than re-onboarding',
    };
  }

  return {
    stage: 'onboard',
    readinessScore: STAGE_BASE_SCORE.onboard,
    reason: 'net-new prospect, proven, quoted, compliance-clean, and replied — ready to draft the '
      + 'Spanish service agreement',
  };
}

/**
 * Ranks already-scored leads for the founder's next-action queue. Input items are the caller's
 * lead objects merged with their `scoreLeadReadiness()` result (so `daysSinceLastTouch` survives
 * onto the item) — same shape convention as rankThreads consuming classifyThread's output.
 *
 * Sort key, in order: (1) `stale-needs-attention` leads always sort above every non-stale lead,
 * regardless of readinessScore — mirrors inbox-triage's stale-hot-lead outranking a
 * merely-awaiting-reply thread, because a decaying lead needs intervention before its raw
 * readiness matters (a plain numeric boost isn't enough since onboard's base score of 95 would
 * still beat a lightly-boosted stale score, so staleness is its own leading sort key, not an
 * addend). (2) readinessScore descending. (3) daysSinceLastTouch descending (older = more urgent
 * among equals), the same tiebreak rankThreads uses.
 *
 * @param {({ stage: string, readinessScore: number, daysSinceLastTouch?: number })[]} scoredLeads
 */
export function rankLeads(scoredLeads) {
  const isStale = (l) => (l.stage === 'stale-needs-attention' ? 1 : 0);
  return [...scoredLeads].sort((a, b) =>
    isStale(b) - isStale(a)
    || b.readinessScore - a.readinessScore
    || (b.daysSinceLastTouch ?? 0) - (a.daysSinceLastTouch ?? 0));
}
