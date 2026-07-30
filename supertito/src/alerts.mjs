// Alert-rail unification (canon [P6-W2-01]) — one ranked, deduplicated, never-drop alert model
// behind both @supertitobot and the Deck. Pure functions; no send/dispatch/reply capability.

const DEDUP_WINDOW_MS_DEFAULT = 60 * 60 * 1000; // 1h, matches supertito/POLICY.md's dedup-window row

/**
 * Merge repeated alerts for the same thread within `windowMs` of each other (a true sliding
 * window — v3.7 audit fix: the window comparison used to anchor against the surviving,
 * highest-urgency alert's own emittedAtMs, which could be an OLDER timestamp than the most
 * recently seen occurrence whenever a higher-urgency alert arrived before a lower-urgency one;
 * that froze the anchor in the past and could incorrectly split a genuinely continuous run of
 * same-thread alerts into multiple "new occurrence" entries. The window is now always measured
 * against the most-recently-seen occurrence for the thread, tracked separately from which
 * alert's content "wins" the urgency tiebreak). Never-drop: a suppressed duplicate's info is
 * folded into `suppressedCount` on the surviving alert, never discarded outright — the founder
 * can always see how many repeats a surfaced alert represents.
 * @param {{ thread_id: string, urgency: number, emittedAtMs: number }[]} alerts
 * @param {number} [windowMs]
 */
export function dedupeAlerts(alerts, windowMs = DEDUP_WINDOW_MS_DEFAULT) {
  const byThread = new Map();
  for (const alert of alerts) {
    const existing = byThread.get(alert.thread_id);
    if (!existing) {
      byThread.set(alert.thread_id, { ...alert, suppressedCount: 0, lastSeenAtMs: alert.emittedAtMs });
      continue;
    }
    const withinWindow = alert.emittedAtMs - existing.lastSeenAtMs <= windowMs
      && alert.emittedAtMs - existing.lastSeenAtMs >= -windowMs;
    if (!withinWindow) {
      // outside the window — a genuinely new occurrence, keep both (never silently drop)
      byThread.set(`${alert.thread_id}#${alert.emittedAtMs}`, { ...alert, suppressedCount: 0, lastSeenAtMs: alert.emittedAtMs });
      continue;
    }
    const survivor = alert.urgency >= existing.urgency ? alert : existing;
    const suppressedCount = existing.suppressedCount + 1;
    // lastSeenAtMs always advances to this occurrence, regardless of which alert's content wins —
    // recency tracking for the sliding window is independent of the urgency-based content pick.
    byThread.set(alert.thread_id, { ...survivor, suppressedCount, lastSeenAtMs: alert.emittedAtMs });
  }
  return [...byThread.values()].map(({ lastSeenAtMs, ...rest }) => rest);
}

/** Ranks deduplicated alerts by urgency desc, most-recent-first tiebreak. */
export function rankAlerts(alerts) {
  return [...alerts].sort((a, b) => b.urgency - a.urgency || b.emittedAtMs - a.emittedAtMs);
}
