// Alert-rail unification (canon [P6-W2-01]) — one ranked, deduplicated, never-drop alert model
// behind both @supertitobot and the Deck. Pure functions; no send/dispatch/reply capability.

const DEDUP_WINDOW_MS_DEFAULT = 60 * 60 * 1000; // 1h, matches supertito/POLICY.md's dedup-window row

/**
 * Merge repeated alerts for the same thread within `windowMs` of each other. Never-drop: a
 * suppressed duplicate's info is folded into `suppressedCount` on the surviving alert, never
 * discarded outright — the founder can always see how many repeats a surfaced alert represents.
 * @param {{ thread_id: string, urgency: number, emittedAtMs: number }[]} alerts
 * @param {number} [windowMs]
 */
export function dedupeAlerts(alerts, windowMs = DEDUP_WINDOW_MS_DEFAULT) {
  const byThread = new Map();
  for (const alert of alerts) {
    const existing = byThread.get(alert.thread_id);
    if (!existing) {
      byThread.set(alert.thread_id, { ...alert, suppressedCount: 0 });
      continue;
    }
    const withinWindow = Math.abs(alert.emittedAtMs - existing.emittedAtMs) <= windowMs;
    if (!withinWindow) {
      // outside the window — a genuinely new occurrence, keep both (never silently drop)
      byThread.set(`${alert.thread_id}#${alert.emittedAtMs}`, { ...alert, suppressedCount: 0 });
      continue;
    }
    const survivor = alert.urgency >= existing.urgency ? alert : existing;
    const suppressedCount = existing.suppressedCount + 1;
    byThread.set(alert.thread_id, { ...survivor, suppressedCount });
  }
  return [...byThread.values()];
}

/** Ranks deduplicated alerts by urgency desc, most-recent-first tiebreak. */
export function rankAlerts(alerts) {
  return [...alerts].sort((a, b) => b.urgency - a.urgency || b.emittedAtMs - a.emittedAtMs);
}
