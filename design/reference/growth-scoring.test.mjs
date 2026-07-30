import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreLeadReadiness, rankLeads } from './growth-scoring.mjs';

test('stage 1: no proof artifact sent yet -> prove', () => {
  const r = scoreLeadReadiness({
    hasProofArtifactSent: false, hasQuoteSent: false, daysSinceLastTouch: 0,
    repliedLast: false, complianceClean: false, priorClient: false,
  });
  assert.equal(r.stage, 'prove');
  assert.equal(r.readinessScore, 15);
  assert.match(r.reason, /no proof-of-value artifact/);
});

test('stage 2: proof sent, no quote yet -> quote', () => {
  const r = scoreLeadReadiness({
    hasProofArtifactSent: true, hasQuoteSent: false, daysSinceLastTouch: 1,
    repliedLast: true, complianceClean: false, priorClient: false,
  });
  assert.equal(r.stage, 'quote');
  assert.equal(r.readinessScore, 35);
});

test('stage 3: proof + quote sent, compliance not clean -> cleared-doc', () => {
  const r = scoreLeadReadiness({
    hasProofArtifactSent: true, hasQuoteSent: true, daysSinceLastTouch: 2,
    repliedLast: true, complianceClean: false, priorClient: false,
  });
  assert.equal(r.stage, 'cleared-doc');
  assert.equal(r.readinessScore, 55);
  assert.match(r.reason, /cleared-doc\/compliance record is not clean/);
});

test('stage 4: everything sent, clean, but awaiting reply and NOT yet stale -> follow-up, '
  + 'score eases down with age', () => {
  const fresh = scoreLeadReadiness({
    hasProofArtifactSent: true, hasQuoteSent: true, daysSinceLastTouch: 1,
    repliedLast: false, complianceClean: true, priorClient: false,
  });
  assert.equal(fresh.stage, 'follow-up');
  assert.equal(fresh.readinessScore, 64); // 65 - round((1/14)*20)=1

  const older = scoreLeadReadiness({
    hasProofArtifactSent: true, hasQuoteSent: true, daysSinceLastTouch: 5,
    repliedLast: false, complianceClean: true, priorClient: false,
  });
  assert.equal(older.stage, 'follow-up');
  assert.equal(older.readinessScore, 58); // 65 - round((5/14)*20)=7
  assert.ok(older.readinessScore < fresh.readinessScore, 'closer to stale window scores lower');
});

test('stage 6: net-new prospect, proven + quoted + clean + replied -> onboard (highest score)', () => {
  const r = scoreLeadReadiness({
    hasProofArtifactSent: true, hasQuoteSent: true, daysSinceLastTouch: 3,
    repliedLast: true, complianceClean: true, priorClient: false,
  });
  assert.equal(r.stage, 'onboard');
  assert.equal(r.readinessScore, 95);
  assert.match(r.reason, /service agreement/);
});

test('stage 5: existing client, same signals but priorClient -> outreach (referral push), not onboard', () => {
  const r = scoreLeadReadiness({
    hasProofArtifactSent: true, hasQuoteSent: true, daysSinceLastTouch: 3,
    repliedLast: true, complianceClean: true, priorClient: true,
  });
  assert.equal(r.stage, 'outreach');
  assert.equal(r.readinessScore, 80);
  assert.match(r.reason, /LinkedIn-network/);
});

test('stale-needs-attention overrides funnel position when unanswered past the window '
  + '(SIM fixture, stale-Ursula-Banda-shaped: a real Adjunto trial lead from inbox-triage.mjs\'s own '
  + 'test fixture, gone cold 18d with no reply — same person/shape, growth-funnel context instead of '
  + 'an email thread). This is fabricated fixture data for the test only, never a real record.', () => {
  const ursulaLead = {
    // SIM/FIXTURE — not a real lead record. Shape mirrors supertito/test/inbox-triage.test.mjs's
    // "stale hot lead" case (18d, trial ask, awaiting reply) applied to the growth funnel instead.
    hasProofArtifactSent: true,
    hasQuoteSent: true,
    daysSinceLastTouch: 18,
    repliedLast: false,
    complianceClean: true,
    priorClient: false,
  };
  const r = scoreLeadReadiness(ursulaLead);
  assert.equal(r.stage, 'stale-needs-attention');
  assert.equal(r.readinessScore, 18); // 20 - (18-14)/2 = 18
  assert.match(r.reason, /outreach-style follow-up/, 'she needs an outreach follow-up to re-engage');
});

test('stale check fires even at the earliest funnel stage (no proof/quote sent at all yet)', () => {
  const r = scoreLeadReadiness({
    hasProofArtifactSent: false, hasQuoteSent: false, daysSinceLastTouch: 40,
    repliedLast: false, complianceClean: false, priorClient: false,
  });
  assert.equal(r.stage, 'stale-needs-attention');
  assert.equal(r.readinessScore, 7); // 20 - (40-14)/2 = 20-13 = 7
});

test('stale score never goes negative — clamps at 0 for a very old dead lead', () => {
  const r = scoreLeadReadiness({
    hasProofArtifactSent: true, hasQuoteSent: true, daysSinceLastTouch: 200,
    repliedLast: false, complianceClean: true, priorClient: false,
  });
  assert.equal(r.stage, 'stale-needs-attention');
  assert.equal(r.readinessScore, 0);
});

test('a reply that itself is old (ball in our court a while ago) is NOT stale — repliedLast wins', () => {
  const r = scoreLeadReadiness({
    hasProofArtifactSent: true, hasQuoteSent: true, daysSinceLastTouch: 50,
    repliedLast: true, complianceClean: true, priorClient: false,
  });
  assert.notEqual(r.stage, 'stale-needs-attention');
  assert.equal(r.stage, 'onboard');
});

test('missing/undefined fields default safely (all falsy/zero) -> earliest stage, no throw', () => {
  const r = scoreLeadReadiness({});
  assert.equal(r.stage, 'prove');
  assert.doesNotThrow(() => scoreLeadReadiness(undefined));
  assert.doesNotThrow(() => scoreLeadReadiness(null));
});

test('rankLeads: stale leads are boosted to the top of the queue regardless of raw readinessScore', () => {
  const onboardReady = { id: 'a', ...scoreLeadReadiness({
    hasProofArtifactSent: true, hasQuoteSent: true, daysSinceLastTouch: 1,
    repliedLast: true, complianceClean: true, priorClient: false,
  }), daysSinceLastTouch: 1 };
  const staleUrsula = { id: 'ursula-sim', ...scoreLeadReadiness({
    hasProofArtifactSent: true, hasQuoteSent: true, daysSinceLastTouch: 18,
    repliedLast: false, complianceClean: true, priorClient: false,
  }), daysSinceLastTouch: 18 };
  const proveStage = { id: 'c', ...scoreLeadReadiness({
    hasProofArtifactSent: false, hasQuoteSent: false, daysSinceLastTouch: 0,
    repliedLast: false, complianceClean: false, priorClient: false,
  }), daysSinceLastTouch: 0 };

  const ranked = rankLeads([proveStage, onboardReady, staleUrsula]);
  assert.deepEqual(ranked.map((l) => l.id), ['ursula-sim', 'a', 'c']);
});

test('rankLeads: among non-stale leads, higher readinessScore ranks first; ties break by '
  + 'daysSinceLastTouch descending (older first)', () => {
  const a = { id: 'a', stage: 'follow-up', readinessScore: 50, daysSinceLastTouch: 2 };
  const b = { id: 'b', stage: 'follow-up', readinessScore: 50, daysSinceLastTouch: 10 };
  const c = { id: 'c', stage: 'quote', readinessScore: 35, daysSinceLastTouch: 0 };
  const ranked = rankLeads([c, a, b]);
  assert.deepEqual(ranked.map((l) => l.id), ['b', 'a', 'c']);
});

test('denial: no send/dispatch/reply-capable export exists on this module', async () => {
  const mod = await import('./growth-scoring.mjs');
  const exportNames = Object.keys(mod);
  assert.deepEqual(exportNames.sort(), ['rankLeads', 'scoreLeadReadiness']);
  assert.ok(!exportNames.some((n) => /send|dispatch|reply|draft/i.test(n)), 'no send-capable export exists');
});
