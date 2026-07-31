import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildFounderBrief, renderFounderBriefText } from '../src/founder-brief.mjs';

const NOW = Date.parse('2026-07-31T12:00:00Z');
const DAY = 86_400_000;

test('throws on a non-finite nowMs rather than silently producing a bad brief', () => {
  assert.throws(() => buildFounderBrief({}, NaN), TypeError);
  assert.throws(() => buildFounderBrief({}, undefined), TypeError);
});

test('empty input: no sections, no items, no crash, honest sectionsOmitted', () => {
  const brief = buildFounderBrief({}, NOW);
  assert.deepEqual(brief.items, []);
  assert.equal(brief.counts.total, 0);
  assert.deepEqual(brief.sectionsOmitted.sort(), ['compliance-deadlines', 'cortana', 'growth-leads', 'wo-register']);
  assert.deepEqual(brief.warnings, []);
});

test('cortana per-system alert urgency maps onto the shared 0-100 scale via the documented 6-cap', () => {
  const brief = buildFounderBrief({
    cortana: {
      perSystemAlerts: [
        { kind: 'inbox-triage-alert', thread_id: 't1', category: 'stale-hot-lead', urgency: 6, text: 'alert-max' },
        { kind: 'inbox-triage-alert', thread_id: 't2', category: 'urgent-client', urgency: 4, text: 'alert-mid' },
      ],
      correlatedBriefs: [],
    },
  }, NOW);
  const max = brief.items.find((i) => i.headline === 'alert-max');
  const mid = brief.items.find((i) => i.headline === 'alert-mid');
  assert.equal(max.priority, 100);
  assert.equal(max.band, 'CRITICAL');
  assert.equal(mid.priority, 67); // round(4/6*100)
  assert.equal(mid.band, 'MEDIUM');
  assert.equal(max.citation, 'supertito/src/inbox-triage.mjs:toAlert (via cortana.mjs runCortanaPass)');
});

test('correlated (cross-system) briefs get the documented additive bonus, clamped at 100', () => {
  const brief = buildFounderBrief({
    cortana: {
      perSystemAlerts: [],
      correlatedBriefs: [
        { kind: 'cortana-correlated-brief', entity: 'MAFESA', systems: ['gmail', 'aduanet'], maxUrgency: 4, items: [], text: 'MAFESA correlated' },
        { kind: 'cortana-correlated-brief', entity: 'EVCO', systems: ['gmail', 'econta'], maxUrgency: 6, items: [], text: 'EVCO correlated' },
      ],
    },
  }, NOW);
  const mafesa = brief.items.find((i) => i.headline === 'MAFESA correlated');
  const evco = brief.items.find((i) => i.headline === 'EVCO correlated');
  assert.equal(mafesa.priority, 82); // round(4/6*100) + 15 = 67+15
  assert.equal(evco.priority, 100); // round(6/6*100)+15 = 115 clamped to 100
  assert.equal(evco.band, 'CRITICAL');
});

test('growth leads: onboard-ready is high priority, stale-needs-attention is INVERTED to high priority too', () => {
  const brief = buildFounderBrief({
    leads: [
      { hasProofArtifactSent: true, hasQuoteSent: true, complianceClean: true, repliedLast: true, priorClient: false, daysSinceLastTouch: 1 }, // -> onboard, score 95
      { hasProofArtifactSent: false, hasQuoteSent: false, complianceClean: false, repliedLast: false, daysSinceLastTouch: 14 }, // -> stale, score 20
      { hasProofArtifactSent: false, hasQuoteSent: false, complianceClean: false, repliedLast: false, daysSinceLastTouch: 0 }, // -> prove, score 15
    ],
  }, NOW);
  const onboard = brief.items.find((i) => i.headline.startsWith('onboard:'));
  const stale = brief.items.find((i) => i.headline.startsWith('stale-needs-attention:'));
  const prove = brief.items.find((i) => i.headline.startsWith('prove:'));
  assert.equal(onboard.priority, 95);
  assert.equal(onboard.band, 'CRITICAL');
  // stale's growth-scoring readinessScore is 20 (deliberately low, "not ready") — founder-brief
  // inverts that to 100-20=80 because the ACTION signal here is "about to go cold", not readiness.
  assert.equal(stale.priority, 80);
  assert.equal(stale.band, 'HIGH');
  assert.equal(prove.priority, 15);
  assert.equal(prove.band, 'LOW');
  assert.equal(onboard.citation, 'design/reference/growth-scoring.mjs:scoreLeadReadiness');
});

test('WO register: closed/resolved/done are excluded as no-action-needed; open ranks by real alarm-emoji count', () => {
  const md = [
    '| WO-01 | 🚨🚨 top priority thing | **OPEN** |',
    '| WO-02 | 🚨 one alarm thing | **OPEN** |',
    '| WO-03 | plain open thing | **OPEN** |',
    '| WO-04 | already closed thing | **CLOSED** |',
    '| WO-05 | already resolved thing | **RESOLVED** |',
    '| WO-06 | already done thing | **DONE** |',
    '| WO-07 | 🚨🚨 status genuinely unclear | **ARMED BUT UNRESOLVED** |',
  ].join('\n');
  const brief = buildFounderBrief({ woRegisterMarkdown: md }, NOW);
  const ids = brief.items.filter((i) => i.source === 'wo-register').map((i) => i.raw.id).sort();
  assert.deepEqual(ids, ['WO-01', 'WO-02', 'WO-03', 'WO-07']); // WO-04/05/06 excluded
  const byId = Object.fromEntries(brief.items.filter((i) => i.source === 'wo-register').map((i) => [i.raw.id, i]));
  assert.equal(byId['WO-01'].priority, 100);
  assert.equal(byId['WO-02'].priority, 85);
  assert.equal(byId['WO-03'].priority, 50);
  // unclear status is capped even though it has 2 alarm emoji — this module won't assert
  // confidence about founder-action urgency it doesn't actually have.
  assert.equal(byId['WO-07'].priority, 60);
  assert.ok(byId['WO-07'].headline.includes('[status unclear — verify]'));
  assert.ok(brief.warnings.some((w) => w.includes('WO-07')));
});

test('woRegisterItems (already-parsed) bypasses markdown parsing entirely', () => {
  const brief = buildFounderBrief({
    woRegisterItems: [{ id: 'WO-99', ask: 'pre-parsed item', statusRaw: '**OPEN**', statusLabel: 'OPEN', statusBucket: 'open', alarmCount: 0 }],
  }, NOW);
  assert.equal(brief.items.length, 1);
  assert.equal(brief.items[0].raw.id, 'WO-99');
});

test('compliance deadlines: overdue is max urgency, staircase otherwise, no fabricated dates', () => {
  const brief = buildFounderBrief({
    complianceDeadlines: [
      { client: 'EVCO', description: 'MVE overdue', deadlineMs: NOW - 2 * DAY },
      { client: 'Duratech', description: 'MVE soon', deadlineMs: NOW + 2 * DAY },
      { client: 'Milacron', description: 'MVE later', deadlineMs: NOW + 40 * DAY },
    ],
  }, NOW);
  const byClient = Object.fromEntries(brief.items.map((i) => [i.raw.client, i]));
  assert.equal(byClient.EVCO.priority, 100);
  assert.equal(byClient.EVCO.band, 'CRITICAL');
  assert.ok(byClient.EVCO.headline.includes('OVERDUE'));
  assert.equal(byClient.Duratech.priority, 90);
  assert.equal(byClient.Milacron.priority, 15);
  assert.equal(byClient.Milacron.band, 'LOW');
  assert.equal(byClient.EVCO.citation, 'caller-supplied compliance deadline (not sourced by this module)');
});

test('final ranking is sorted priority-desc across ALL four sources combined, with a deterministic tiebreak', () => {
  const brief = buildFounderBrief({
    cortana: { perSystemAlerts: [{ thread_id: 't1', urgency: 3, text: 'low-alert' }], correlatedBriefs: [] },
    leads: [{ hasProofArtifactSent: true, hasQuoteSent: true, complianceClean: true, repliedLast: true, priorClient: false, daysSinceLastTouch: 0 }], // onboard, 95
    complianceDeadlines: [{ client: 'EVCO', description: 'x', deadlineMs: NOW - DAY }], // overdue, 100
  }, NOW);
  const priorities = brief.items.map((i) => i.priority);
  const sortedDesc = [...priorities].sort((a, b) => b - a);
  assert.deepEqual(priorities, sortedDesc);
  assert.equal(brief.items[0].source, 'compliance-deadline'); // 100 beats onboard's 95
  assert.equal(brief.counts.total, 3);
  assert.equal(brief.counts.CRITICAL, 2);
});

test('opts.maxItems caps the returned list without corrupting counts of what was actually kept', () => {
  const brief = buildFounderBrief({
    complianceDeadlines: [
      { client: 'A', description: 'x', deadlineMs: NOW - DAY },
      { client: 'B', description: 'x', deadlineMs: NOW - DAY },
      { client: 'C', description: 'x', deadlineMs: NOW + 40 * DAY },
    ],
  }, NOW, { maxItems: 2 });
  assert.equal(brief.items.length, 2);
  assert.equal(brief.counts.total, 2);
});

test('renderFounderBriefText produces a readable, citation-bearing plain-text brief', () => {
  const brief = buildFounderBrief({
    complianceDeadlines: [{ client: 'EVCO', description: 'MVE overdue', deadlineMs: NOW - DAY }],
  }, NOW);
  const text = renderFounderBriefText(brief);
  assert.ok(text.includes('FOUNDER BRIEF'));
  assert.ok(text.includes('[CRITICAL 100]'));
  assert.ok(text.includes('cited: caller-supplied compliance deadline'));
  assert.ok(text.includes('sections omitted'));
  assert.ok(text.includes('cortana'));
});

test('renderFounderBriefText handles the fully-empty brief honestly instead of printing nothing', () => {
  const text = renderFounderBriefText(buildFounderBrief({}, NOW));
  assert.ok(text.includes('nothing ranked'));
});
