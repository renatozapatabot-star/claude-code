// Cross-system correlation — the "Cortana law" (canon [P2-W3-02], founder ruling 2026-07-30:
// "he's copied on every thread doesn't answer but helps out the whole ecosystem"). Per-system
// modules (inbox-triage.mjs and its future globalpc/Aduanet/econta analogues, per [WO-17]) each
// classify their own observations; this module's only job is the additive value the founder named
// explicitly: noticing the SAME entity (client/company) showing up across 2+ DISTINCT systems and
// merging that into one surfaced brief. Never answers, never acts, never sends (§0.4-8, ecosystem-
// wide per [P2-W3-02]) — this is a pure function over already-classified observations.

/**
 * @typedef {{ category: string, urgency: number, ageDays: number, awaitingReply: boolean }} Classification
 * @typedef {{ system: string, threadId: string, entity: string, classification: Classification }} Observation
 */

/**
 * Groups observations by entity, then keeps only groups whose observations span 2+ distinct
 * systems (that's what makes them "correlated" per the founder's ruling). Single-system groups
 * are NOT correlated brief material — they're already the per-system module's own job to surface
 * (e.g. inbox-triage.mjs's toAlert) — so this function omits them from its output entirely rather
 * than passing them through unchanged. Documented here per the task's explicit either/or.
 *
 * @param {Observation[]} observations
 * @param {number} nowMs unused today (classifications already carry ageDays); kept in the
 *   signature so correlate() can factor in recency/decay later without an API break.
 * @returns {{ kind: 'cortana-correlated-brief', entity: string, systems: string[], maxUrgency: number,
 *   items: Observation[], text: string }[]}
 */
export function correlate(observations, nowMs) {
  void nowMs;

  const byEntity = new Map();
  for (const obs of observations) {
    if (!byEntity.has(obs.entity)) byEntity.set(obs.entity, []);
    byEntity.get(obs.entity).push(obs);
  }

  const briefs = [];
  for (const [entity, items] of byEntity) {
    const systems = [...new Set(items.map((i) => i.system))];
    if (systems.length < 2) continue; // not correlated — single-system, out of scope here

    const ranked = [...items].sort((a, b) => b.classification.urgency - a.classification.urgency);
    const maxUrgency = ranked[0].classification.urgency;
    const categories = ranked.map((i) => `${i.system}:${i.classification.category}`).join(', ');

    briefs.push({
      kind: 'cortana-correlated-brief',
      entity,
      systems,
      maxUrgency,
      items: ranked,
      text: `${entity}: correlated across ${systems.join(', ')} (max urgency ${maxUrgency}) — ${categories}`,
    });
  }

  return briefs.sort((a, b) => b.maxUrgency - a.maxUrgency);
}
