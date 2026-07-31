// Founder daily brief — the composition layer none of the other modules attempt: one ranked,
// prioritized, CITED list merging four already-independently-tested sources (Cortana's
// alerts/correlated briefs, growth-scoring's lead funnel, the WO register, and compliance
// deadlines) into the single artifact canon's THE-DECK.md describes as Monitor-2's "06:30 email"
// — as real, testable code instead of just a calendar cadence naming a panel. Pure function: it
// takes already-computed/already-classified data from its four sources and never fetches,
// scores raw external data itself (beyond re-using growth-scoring's own scorer), sends, or
// dispatches anything. §0.4-8 applies transitively — nothing here is send-capable.
//
// Why compose at this layer instead of teaching each source module to rank "founder-globally":
// inbox-triage's urgency scale, growth-scoring's readinessScore, and a compliance deadline's
// days-until are three genuinely different measurements of three different things (email
// staleness, funnel readiness, calendar risk) — forcing them into one function's internals would
// either flatten a real domain distinction or duplicate each module's own tuning knobs here.
// Composing their OUTPUTS into one comparable 0-100 priority is the actual missing piece; the
// four source modules stay exactly as they are, and this file owns exactly the "how do these
// four compare to each other" question, nowhere else.

import { scoreLeadReadiness, rankLeads } from '../../design/reference/growth-scoring.mjs';
import { parseWoRegisterTable } from './wo-register.mjs';

const MS_PER_DAY = 86_400_000;

// inbox-triage.mjs's classifyThread caps urgency at 3 + min(ageDays/7, 3) = 6 for its highest
// category (stale-hot-lead); compliance-deadline/urgent-client are flat 5/4. This is the single
// place that scale is declared "6" so a future change to that cap has exactly one line to update
// here, not a silently-drifting magic number re-derived by hand.
const MAX_INBOX_TRIAGE_URGENCY = 6;
// Per the Cortana law (canon [P2-W3-02]) — the SAME entity showing up across 2+ distinct systems
// is explicitly the additive value correlate.mjs exists to surface, over and above any one
// system's own signal. A flat, documented bonus (not a multiplier, so it can never push a
// low-urgency correlation above a genuinely high single-system urgency) encodes that without
// re-deriving correlate.mjs's own logic here.
const CROSS_SYSTEM_BONUS = 15;

const BAND_THRESHOLDS = [
  { band: 'CRITICAL', min: 90 },
  { band: 'HIGH', min: 70 },
  { band: 'MEDIUM', min: 40 },
  { band: 'LOW', min: 0 },
];

function bandOf(priority) {
  return BAND_THRESHOLDS.find((b) => priority >= b.min).band;
}

function clamp100(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function fromCortanaAlerts(perSystemAlerts) {
  return (perSystemAlerts ?? []).map((a) => ({
    source: 'cortana-alert',
    priority: clamp100((a.urgency / MAX_INBOX_TRIAGE_URGENCY) * 100),
    headline: a.text,
    citation: 'supertito/src/inbox-triage.mjs:toAlert (via cortana.mjs runCortanaPass)',
    raw: a,
  }));
}

function fromCorrelatedBriefs(correlatedBriefs) {
  return (correlatedBriefs ?? []).map((b) => ({
    source: 'cortana-correlated-brief',
    priority: clamp100((b.maxUrgency / MAX_INBOX_TRIAGE_URGENCY) * 100 + CROSS_SYSTEM_BONUS),
    headline: b.text,
    citation: 'supertito/src/correlate.mjs:correlate (via cortana.mjs runCortanaPass)',
    raw: b,
  }));
}

/**
 * Growth-scoring's readinessScore means "how close to converting" and is DELIBERATELY low for a
 * stale lead (scoreLeadReadiness's own comment: "a cold lead isn't ready, it needs attention
 * first") — exactly backwards from what a founder's action queue needs, which is "how urgently
 * should I look at this today". Everywhere else the two questions happen to point the same way
 * (a lead at 'onboard', score 95, is both maximally ready AND the right next action), so only the
 * stale case needs an explicit inversion — documented here rather than changing growth-scoring's
 * own scale, since that scale is correct and tested for ITS question, not this one.
 */
function leadBriefPriority(scored) {
  if (scored.stage === 'stale-needs-attention') return clamp100(100 - scored.readinessScore);
  return clamp100(scored.readinessScore);
}

function fromLeads(leads) {
  const scored = (leads ?? []).map((lead) => ({ ...lead, ...scoreLeadReadiness(lead) }));
  const ranked = rankLeads(scored); // preserves growth-scoring's own stale-first/tiebreak fairness
  // as the internal ordering for equal-priority leads after this module's own sort below.
  return ranked.map((s) => ({
    source: 'growth-lead',
    priority: leadBriefPriority(s),
    headline: `${s.stage}: ${s.reason}`,
    citation: 'design/reference/growth-scoring.mjs:scoreLeadReadiness',
    raw: s,
  }));
}

// Deliberately simple staircase (same style as inbox-triage's/growth-scoring's own thresholds) —
// this module owns no calendar knowledge and fabricates no deadline, only ranks whatever the
// caller supplies. Real MVE/E2 deadline DATES are explicitly flagged elsewhere in this canon as
// contested across sources (v3.8 audit); this function never hardcodes one.
function complianceUrgency(daysUntil) {
  if (daysUntil < 0) return 100; // overdue
  if (daysUntil <= 3) return 90;
  if (daysUntil <= 7) return 75;
  if (daysUntil <= 14) return 55;
  if (daysUntil <= 30) return 35;
  return 15;
}

function fromComplianceDeadlines(deadlines, nowMs) {
  return (deadlines ?? []).map((d) => {
    const daysUntil = (d.deadlineMs - nowMs) / MS_PER_DAY;
    const overdue = daysUntil < 0;
    return {
      source: 'compliance-deadline',
      priority: complianceUrgency(daysUntil),
      headline: `${d.client ?? 'unknown client'}: ${d.description ?? 'compliance deadline'} — `
        + `${overdue ? `${Math.round(-daysUntil)}d OVERDUE` : `${Math.round(daysUntil)}d remaining`}`,
      citation: d.citation ?? 'caller-supplied compliance deadline (not sourced by this module)',
      raw: { ...d, daysUntil: Math.round(daysUntil * 10) / 10 },
    };
  });
}

// Real "🚨🚨 HIGHEST PRIORITY" / single "🚨" markers already exist in the live WO register's own
// ask-column text (see WO-19 vs WO-16/WO-20 in PROJECT-STATUS.md) — this reuses that founder-
// authored signal directly rather than inventing a second, redundant priority vocabulary.
function woBriefPriority(item) {
  if (item.alarmCount >= 2) return 100;
  if (item.alarmCount === 1) return 85;
  return 50;
}

function fromWoRegister(items) {
  return (items ?? [])
    .filter((i) => i.statusBucket === 'open' || i.statusBucket === 'unclear') // closed/resolved/done
    // need no founder action today — never surfaced as busywork (hard law: don't manufacture it).
    .map((i) => ({
      source: 'wo-register',
      priority: i.statusBucket === 'unclear' ? Math.min(woBriefPriority(i), 60) : woBriefPriority(i),
      // an 'unclear' item is capped below CRITICAL/HIGH's usual ceiling — its own status is not
      // confidently known, so this module won't assert founder-must-act-now confidence it doesn't
      // have, even if the ask text happens to carry alarm emoji.
      headline: `${i.id}: ${i.ask}${i.statusBucket === 'unclear' ? ' [status unclear — verify]' : ''}`,
      citation: 'WO register (parsed by supertito/src/wo-register.mjs:parseWoRegisterTable)',
      raw: i,
    }));
}

function stableSort(items) {
  return [...items].sort((a, b) =>
    b.priority - a.priority
    || a.source.localeCompare(b.source)
    || a.headline.localeCompare(b.headline));
}

/**
 * @param {{
 *   cortana?: { perSystemAlerts?: object[], correlatedBriefs?: object[] },
 *   leads?: import('../../design/reference/growth-scoring.mjs').Lead[],
 *   woRegisterMarkdown?: string,
 *   woRegisterItems?: ReturnType<typeof parseWoRegisterTable>['items'],
 *   complianceDeadlines?: { id?: string, client?: string, description?: string, deadlineMs: number, citation?: string }[],
 * }} input any key may be omitted — an omitted source produces zero items for that source and a
 *   note in `sectionsOmitted`, never a fabricated placeholder (hard law: never fabricate data).
 * @param {number} nowMs
 * @returns {{ generatedAtMs: number, items: object[], counts: object, warnings: string[], sectionsOmitted: string[] }}
 */
export function buildFounderBrief(input = {}, nowMs, opts = {}) {
  if (!Number.isFinite(nowMs)) throw new TypeError('buildFounderBrief requires a finite nowMs');
  const cap = Number.isFinite(opts.maxItems) ? opts.maxItems : Infinity;

  const warnings = [];
  const sectionsOmitted = [];
  let all = [];

  if (input.cortana) {
    all = all.concat(fromCortanaAlerts(input.cortana.perSystemAlerts));
    all = all.concat(fromCorrelatedBriefs(input.cortana.correlatedBriefs));
  } else sectionsOmitted.push('cortana');

  if (input.leads) all = all.concat(fromLeads(input.leads));
  else sectionsOmitted.push('growth-leads');

  let woItems = input.woRegisterItems;
  if (!woItems && input.woRegisterMarkdown) {
    const parsed = parseWoRegisterTable(input.woRegisterMarkdown);
    woItems = parsed.items;
    warnings.push(...parsed.warnings);
  }
  if (woItems) all = all.concat(fromWoRegister(woItems));
  else sectionsOmitted.push('wo-register');

  if (input.complianceDeadlines) all = all.concat(fromComplianceDeadlines(input.complianceDeadlines, nowMs));
  else sectionsOmitted.push('compliance-deadlines');

  const sorted = stableSort(all);
  const items = Number.isFinite(cap) ? sorted.slice(0, cap) : sorted;

  const counts = { total: items.length, CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, bySource: {} };
  for (const item of items) {
    const band = bandOf(item.priority);
    item.band = band;
    counts[band] += 1;
    counts.bySource[item.source] = (counts.bySource[item.source] ?? 0) + 1;
  }

  return { generatedAtMs: nowMs, items, counts, warnings, sectionsOmitted };
}

/** Plain-text render of a brief — the literal shape of the Deck's Monitor-2 "06:30 email". */
export function renderFounderBriefText(brief) {
  const lines = [`FOUNDER BRIEF — ${new Date(brief.generatedAtMs).toISOString()}`, ''];
  if (brief.items.length === 0) {
    lines.push('(nothing ranked — either every source was clean, or every source was omitted; see sectionsOmitted below)');
  }
  for (const item of brief.items) {
    lines.push(`[${item.band} ${item.priority}] (${item.source}) ${item.headline}`);
    lines.push(`    cited: ${item.citation}`);
  }
  lines.push('', `counts: ${JSON.stringify(brief.counts)}`);
  if (brief.sectionsOmitted.length) lines.push(`sections omitted (no data supplied): ${brief.sectionsOmitted.join(', ')}`);
  if (brief.warnings.length) lines.push(`warnings: ${brief.warnings.join(' | ')}`);
  return lines.join('\n');
}
