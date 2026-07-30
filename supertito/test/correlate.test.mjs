import { test } from 'node:test';
import assert from 'node:assert/strict';
import { correlate } from '../src/correlate.mjs';

// All observations below are SIM/fixture data, not real client records — synthetic stand-ins for
// what per-system adapters (globalpc, Aduanet, econta, Gmail) would emit once [WO-17] wires real
// access. Entity names (MAFESA, EVCO, Ursula Banda) are used only as plausible correlation keys.

const now = Date.parse('2026-07-30T12:00:00Z');

test('correlates the same entity across 3 distinct systems into one brief', () => {
  const observations = [
    {
      system: 'aduanet',
      threadId: 'aduanet-mafesa-1',
      entity: 'MAFESA',
      classification: { category: 'compliance-deadline', urgency: 5, ageDays: 1, awaitingReply: true },
    },
    {
      system: 'econta',
      threadId: 'econta-mafesa-1',
      entity: 'MAFESA',
      classification: { category: 'stale-invoice', urgency: 3.5, ageDays: 12, awaitingReply: true },
    },
    {
      system: 'gmail',
      threadId: 'gmail-mafesa-1',
      entity: 'MAFESA',
      classification: { category: 'urgent-client', urgency: 4, ageDays: 2, awaitingReply: true },
    },
  ];

  const briefs = correlate(observations, now);
  assert.equal(briefs.length, 1);

  const brief = briefs[0];
  assert.equal(brief.kind, 'cortana-correlated-brief');
  assert.equal(brief.entity, 'MAFESA');
  assert.equal(brief.systems.length, 3);
  assert.deepEqual(new Set(brief.systems), new Set(['aduanet', 'econta', 'gmail']));
  assert.equal(brief.maxUrgency, 5);
  assert.equal(brief.items.length, 3);
  assert.match(brief.text, /MAFESA/);
  assert.match(brief.text, /aduanet/);
  assert.match(brief.text, /econta/);
  assert.match(brief.text, /gmail/);
});

test('the same real client reported with different casing/whitespace across systems still correlates (v3.7 audit fix)', () => {
  const observations = [
    {
      system: 'aduanet',
      threadId: 'aduanet-mafesa-2',
      entity: 'MAFESA',
      classification: { category: 'compliance-deadline', urgency: 5, ageDays: 1, awaitingReply: true },
    },
    {
      system: 'econta',
      threadId: 'econta-mafesa-2',
      entity: 'Mafesa',
      classification: { category: 'stale-invoice', urgency: 3.5, ageDays: 12, awaitingReply: true },
    },
    {
      system: 'gmail',
      threadId: 'gmail-mafesa-2',
      entity: ' MAFESA ',
      classification: { category: 'urgent-client', urgency: 4, ageDays: 2, awaitingReply: true },
    },
  ];

  const briefs = correlate(observations, now);
  assert.equal(briefs.length, 1);
  assert.equal(briefs[0].systems.length, 3);
  assert.equal(briefs[0].entity, 'MAFESA'); // first-seen original casing is what's displayed
});

test('a single-system observation does not spuriously correlate', () => {
  const observations = [
    {
      system: 'gmail',
      threadId: 'gmail-evco-1',
      entity: 'EVCO',
      classification: { category: 'awaiting-reply', urgency: 1.5, ageDays: 1, awaitingReply: true },
    },
  ];

  const briefs = correlate(observations, now);
  assert.equal(briefs.length, 0);
});

test('mixed input: only the multi-system entity surfaces, the single-system one is omitted', () => {
  const observations = [
    {
      system: 'aduanet',
      threadId: 'aduanet-mafesa-2',
      entity: 'MAFESA',
      classification: { category: 'compliance-deadline', urgency: 5, ageDays: 1, awaitingReply: true },
    },
    {
      system: 'gmail',
      threadId: 'gmail-mafesa-2',
      entity: 'MAFESA',
      classification: { category: 'urgent-client', urgency: 4, ageDays: 2, awaitingReply: true },
    },
    {
      system: 'econta',
      threadId: 'econta-ursula-1',
      entity: 'Ursula Banda',
      classification: { category: 'stale-invoice', urgency: 2, ageDays: 5, awaitingReply: true },
    },
  ];

  const briefs = correlate(observations, now);
  assert.equal(briefs.length, 1);
  assert.equal(briefs[0].entity, 'MAFESA');
});

test('same system twice for the same entity does not count as a second system', () => {
  const observations = [
    {
      system: 'gmail',
      threadId: 'gmail-evco-1',
      entity: 'EVCO',
      classification: { category: 'awaiting-reply', urgency: 1.5, ageDays: 1, awaitingReply: true },
    },
    {
      system: 'gmail',
      threadId: 'gmail-evco-2',
      entity: 'EVCO',
      classification: { category: 'urgent-client', urgency: 4, ageDays: 1, awaitingReply: true },
    },
  ];

  const briefs = correlate(observations, now);
  assert.equal(briefs.length, 0);
});

test('multiple correlated entities are ranked by maxUrgency descending', () => {
  const observations = [
    {
      system: 'aduanet',
      threadId: 'aduanet-evco-1',
      entity: 'EVCO',
      classification: { category: 'compliance-deadline', urgency: 3, ageDays: 1, awaitingReply: true },
    },
    {
      system: 'econta',
      threadId: 'econta-evco-1',
      entity: 'EVCO',
      classification: { category: 'stale-invoice', urgency: 2, ageDays: 1, awaitingReply: true },
    },
    {
      system: 'aduanet',
      threadId: 'aduanet-mafesa-3',
      entity: 'MAFESA',
      classification: { category: 'compliance-deadline', urgency: 5, ageDays: 1, awaitingReply: true },
    },
    {
      system: 'gmail',
      threadId: 'gmail-mafesa-3',
      entity: 'MAFESA',
      classification: { category: 'urgent-client', urgency: 4, ageDays: 1, awaitingReply: true },
    },
  ];

  const briefs = correlate(observations, now);
  assert.equal(briefs.length, 2);
  assert.equal(briefs[0].entity, 'MAFESA');
  assert.equal(briefs[1].entity, 'EVCO');
});

test('denial: never produces a send/dispatch/reply action — module has no such export', async () => {
  const mod = await import('../src/correlate.mjs');
  const exportNames = Object.keys(mod);
  assert.ok(!exportNames.some((n) => /send|dispatch|reply/i.test(n)), 'no send-capable export exists');
});
