// Fallback-message rate limiter (canon [WO-18] fix) — stops @supertitobot's
// conversational-layer fallback notice ("⚠️ Capa conversacional IA falló...") from
// repeat-spamming an identical message into a live Telegram chat when the LLM call
// keeps failing. Evidence of the bug this fixes:
// evidence/screenshots/wo18-supertito-fallback-spam-2026-07-30.png — 5+ identical
// fallback sends in the same chat within the same minute (6:49 AM), founder comment
// "imagine a client seeing this".
//
// Pure functions only — no send/dispatch capability of its own. This module decides
// IF/WHEN a caller (the real Hermes gateway process on the Throne, not a repo this
// session has clone/write access to — see WO-18) should call telegram.sendMessage and
// how long the underlying LLM call should back off before retrying. It does not call
// Telegram, does not touch Hermes, and cannot patch the live bot from here.
//
// KNOWN LIMITATION (documented for whoever wires this in, not fixable from this repo):
// all state here (lastEmittedAtMs, circuit state, seenUpdateIds) is caller-owned and
// in-memory by design. That's correct if Hermes runs @supertitobot as a single process,
// but if it is ever scaled to more than one instance/replica, each instance would keep
// an independent circuit + dedup state — the exact known gap resilience4j documents for
// its own (single-JVM) CircuitBreaker: "only the instance ... receiving the request will
// update the state ... not the overall cluster" (github.com/resilience4j/resilience4j
// issue #1756, "Managing Circuit Breaker State across multiple instances in a Cluster").
// If/when Hermes's real topology is confirmed (WO-13/WO-18 founder-ask), and it turns out
// to be multi-instance, this state needs to move to a shared store (e.g. Redis) — a
// deployment decision, not a change to the pure functions below.
//
// Draws on three real, named reliability patterns (see FREIGHT-OS-CANON.md's WO-18
// entry for citations):
//   1. Circuit breaker (Michael Nygard, "Release It!", 2007) — stop hammering a
//      failing dependency; trip OPEN after N consecutive failures, HALF_OPEN probe
//      after a cooldown, CLOSED again on the first success. This is the actual root
//      cause fix: the screenshot shows the bot re-attempting (and re-failing, and
//      re-announcing) the LLM call on every single incoming update with no memory of
//      the prior failures — exactly what a circuit breaker exists to prevent.
//      NOTE (added on review, same session): a time-only HALF_OPEN check (`canProbe`)
//      is exactly the shape of a real, documented bug class — resilience4j issue #1432,
//      "CircuitBreaker permits more calls then expected when switching from OPEN to
//      HALF_OPEN state" (github.com/resilience4j/resilience4j/issues/1432) — where
//      concurrent callers can all see the cooldown as elapsed and all probe the
//      still-fragile dependency at once. `beginProbe` below is the check-and-claim fix
//      (resilience4j's own answer is `permittedNumberOfCallsInHalfOpenState`, a counted
//      admission gate; this is the pure-function equivalent for a single allowed probe).
//   2. Exponential backoff with full jitter (AWS Builders' Library, "Exponential
//      Backoff And Jitter"; mirrored by the Anthropic and OpenAI SDKs' own default
//      retry behavior — max_retries=2, backoff computed with jitter, honoring a
//      retry-after header when present) — space out LLM-call retries instead of
//      firing them back-to-back.
//   3. Dedup-key notification suppression (PagerDuty/Squadcast-style alert
//      deduplication: group repeat events under one key instead of re-notifying on
//      each one) — this is the exact never-drop-but-fold contract this repo already
//      implements in supertito/src/alerts.mjs ([P6-W2-01]). Reused directly below:
//      dedupeAlerts is imported unmodified and applied to a batch of fallback-firing
//      events for the periodic "N repeats folded" digest.
//   4. Inbound update-id deduplication (added on research review, same session) — a real,
//      independently-documented instance of this exact bug class: "Telegram: Duplicate
//      message storm during LLM API outages (missing message_id deduplication)",
//      github.com/openclaw/openclaw issue #58611. That report root-causes the storm to
//      the bot not deduplicating *inbound* Telegram updates by their stable update_id
//      when the gateway is slow to ack, so Telegram redelivers the same update and the
//      bot reprocesses it as new each time — a distinct, complementary cause from the
//      outbound-message symptom the founder's screenshot shows. shouldProcessUpdate
//      below is that fix, same TTL-cache shape as shouldEmitFallback.

import { dedupeAlerts } from './alerts.mjs';

const FALLBACK_DEDUP_WINDOW_MS_DEFAULT = 5 * 60 * 1000; // 5 min: long enough to
  // swallow a burst of retries/duplicate webhook deliveries (the observed bug fired
  // 5x inside ~60s), short enough that a client who messages again after a real fix
  // gets a fresh reply, not permanent silence.
const CIRCUIT_FAILURE_THRESHOLD_DEFAULT = 3; // consecutive conversational-layer
  // failures before the circuit trips open
const CIRCUIT_COOLDOWN_MS_DEFAULT = 2 * 60 * 1000; // how long OPEN holds before a
  // single HALF_OPEN probe is allowed through
const BACKOFF_BASE_MS_DEFAULT = 1000;
const BACKOFF_CAP_MS_DEFAULT = 30 * 1000;

/**
 * Real-time gate for a single chat: should this just-failed conversational-layer call
 * actually emit its fallback message right now, or is it a repeat that should be
 * suppressed because one already fired for this chat within `windowMs`?
 *
 * This is the direct fix for the observed bug: called once per failure, it turns "send
 * the identical fallback every single time" into "send it once per window, then stay
 * quiet" — nothing is answered differently, no content changes, only the repeat-send
 * is gated.
 *
 * @param {number | null} lastEmittedAtMs - when the fallback last actually fired for
 *   this chat, or null if it has never fired (or state was reset after a success)
 * @param {number} nowMs - timestamp of the current failure
 * @param {number} [windowMs]
 * @returns {boolean} true if the fallback should be sent now
 */
export function shouldEmitFallback(lastEmittedAtMs, nowMs, windowMs = FALLBACK_DEDUP_WINDOW_MS_DEFAULT) {
  if (lastEmittedAtMs === null || lastEmittedAtMs === undefined) return true;
  return nowMs - lastEmittedAtMs > windowMs;
}

/**
 * Never-drop digest: given every raw fallback-firing event recorded across a period
 * (including the ones shouldEmitFallback suppressed — nothing is discarded, everything
 * is recorded upstream), collapse repeats per chat into one entry with a
 * suppressedCount, so the founder can still see "fired 5 times" even though the client
 * only ever saw it once. This is supertito/src/alerts.mjs's dedupeAlerts, imported and
 * applied unmodified — same contract, same function, different event stream.
 *
 * @param {{chat_id: string, emittedAtMs: number}[]} fires
 * @param {number} [windowMs]
 */
export function digestFallbackFires(fires, windowMs = FALLBACK_DEDUP_WINDOW_MS_DEFAULT) {
  const asAlerts = fires.map((f) => ({ thread_id: f.chat_id, urgency: 1, emittedAtMs: f.emittedAtMs }));
  return dedupeAlerts(asAlerts, windowMs).map(({ thread_id, emittedAtMs, suppressedCount }) => ({
    chat_id: thread_id,
    emittedAtMs,
    suppressedCount,
  }));
}

/**
 * Circuit breaker state transition (Nygard). Three states: 'closed' (calling the LLM
 * normally), 'open' (skip the call entirely, go straight to the gated fallback),
 * 'half_open' (cooldown elapsed, allow exactly one probe call through).
 *
 * @param {{status: 'closed'|'open'|'half_open', consecutiveFailures: number, openedAtMs: number|null}} state
 * @param {'success'|'failure'} outcome - result of the call just attempted (skip
 *   calling this at all while status is 'open' and the cooldown hasn't elapsed —
 *   that's the caller's job, gated by canProbe below)
 * @param {number} nowMs
 * @param {{failureThreshold?: number}} [opts]
 */
export function updateCircuit(state, outcome, nowMs, opts = {}) {
  const failureThreshold = opts.failureThreshold ?? CIRCUIT_FAILURE_THRESHOLD_DEFAULT;
  if (outcome === 'success') {
    return { status: 'closed', consecutiveFailures: 0, openedAtMs: null };
  }
  const consecutiveFailures = state.consecutiveFailures + 1;
  if (state.status === 'half_open') {
    // the probe failed too — re-open, reset the cooldown clock
    return { status: 'open', consecutiveFailures, openedAtMs: nowMs };
  }
  if (consecutiveFailures >= failureThreshold) {
    return { status: 'open', consecutiveFailures, openedAtMs: state.openedAtMs ?? nowMs };
  }
  return { status: 'closed', consecutiveFailures, openedAtMs: null };
}

/**
 * Whether an OPEN circuit's cooldown has elapsed enough to allow a single HALF_OPEN
 * probe call through. Callers should call the LLM only when this returns true (or
 * when status is already 'closed'); otherwise skip the call and go straight to the
 * gated fallback via shouldEmitFallback.
 *
 * NOTE: read-only. Under concurrent callers (two chats' webhook handlers both racing
 * the event loop around the same cooldown boundary) two calls can both observe `true`
 * before either has persisted a state update, and both dispatch a probe call to the
 * already-fragile dependency — see beginProbe below for the check-and-claim function
 * that actually prevents that. Kept only for the still-valid read-only question "is a
 * probe theoretically due", and for the tests already pinned to it.
 *
 * @param {{status: string, openedAtMs: number|null}} state
 * @param {number} nowMs
 * @param {number} [cooldownMs]
 */
export function canProbe(state, nowMs, cooldownMs = CIRCUIT_COOLDOWN_MS_DEFAULT) {
  if (state.status !== 'open' || state.openedAtMs === null) return state.status !== 'open';
  return nowMs - state.openedAtMs > cooldownMs;
}

/**
 * Check-and-claim probe admission (fixes a real, documented circuit-breaker bug class:
 * resilience4j issue #1432, "CircuitBreaker permits more calls then expected when
 * switching from OPEN to HALF_OPEN state" — github.com/resilience4j/resilience4j/issues/1432;
 * resilience4j's own fix for this exact race is `permittedNumberOfCallsInHalfOpenState`,
 * a counted admission gate rather than a stateless time check). `canProbe` above is a
 * pure read with no memory of a probe already being in flight, so two callers that both
 * observe `canProbe() === true` before either persists a state update will both dispatch
 * a probe call to the still-fragile dependency — the opposite of what a circuit breaker
 * is for. `beginProbe` closes that gap the same way resilience4j does: transitioning to
 * 'half_open' *is* the claim, done in the same synchronous call that answers the
 * question, so the caller can persist the returned state before awaiting the LLM call
 * and a second concurrent caller (JS is single-threaded per tick, but the LLM call
 * itself is always awaited, and another chat's handler can run in the gap) sees
 * `status: 'half_open'` already claimed and gets `allowed: false`.
 *
 * Contract: call this instead of `canProbe`, persist `nextState` synchronously (before
 * any `await`), and only actually invoke the LLM when `allowed` is true.
 *
 * @param {{status: string, consecutiveFailures: number, openedAtMs: number|null}} state
 * @param {number} nowMs
 * @param {number} [cooldownMs]
 * @returns {{allowed: boolean, nextState: object}}
 */
export function beginProbe(state, nowMs, cooldownMs = CIRCUIT_COOLDOWN_MS_DEFAULT) {
  if (state.status === 'closed') return { allowed: true, nextState: state };
  if (state.status === 'half_open') return { allowed: false, nextState: state }; // already claimed
  // status === 'open'
  if (state.openedAtMs === null || nowMs - state.openedAtMs <= cooldownMs) {
    return { allowed: false, nextState: state }; // cooldown not elapsed yet
  }
  return {
    allowed: true,
    nextState: { status: 'half_open', consecutiveFailures: state.consecutiveFailures, openedAtMs: state.openedAtMs },
  };
}

/**
 * Exponential backoff with full jitter (AWS Builders' Library formula:
 * sleep = random_between(0, min(cap, base * 2^attempt))) for spacing out retries of
 * the conversational-layer call itself, so a burst of incoming messages during an
 * outage doesn't turn into a burst of simultaneous retries.
 *
 * If the failed call was a 429 that carried a `retry-after` header, honor it exactly
 * instead of the jittered guess — this is what Anthropic's own API errors reference
 * documents as the official SDKs' behavior ("automatically retry transient failures
 * ... with exponential backoff, twice by default, honoring the retry-after header when
 * present" — platform.claude.com/docs/en/api/errors). The server told us precisely how
 * long to wait; a random jittered guess would be worse information, not better.
 *
 * @param {number} attempt - 0-indexed retry attempt number
 * @param {{ baseMs?: number, capMs?: number, randomFn?: () => number, retryAfterMs?: number }} [opts]
 */
export function nextBackoffDelayMs(attempt, opts = {}) {
  if (typeof opts.retryAfterMs === 'number' && opts.retryAfterMs >= 0) return opts.retryAfterMs;
  const baseMs = opts.baseMs ?? BACKOFF_BASE_MS_DEFAULT;
  const capMs = opts.capMs ?? BACKOFF_CAP_MS_DEFAULT;
  const randomFn = opts.randomFn ?? Math.random;
  const upperBound = Math.min(capMs, baseMs * 2 ** attempt);
  return Math.floor(randomFn() * upperBound);
}

const INBOUND_DEDUP_TTL_MS_DEFAULT = 5 * 60 * 1000; // 5 min: same window rationale as
  // FALLBACK_DEDUP_WINDOW_MS_DEFAULT above.

/**
 * Inbound Telegram update dedup (complementary fix, added on research review — WO-18).
 *
 * The outbound gate above (shouldEmitFallback) stops the *symptom* the founder's
 * screenshot shows: the bot re-announcing the same fallback text on every retry. It does
 * NOT stop the *cause* one webhook-delivery pattern can produce: if the gateway process
 * doesn't ack a Telegram update with 200 OK before the (slow/failing) LLM call finishes,
 * Telegram redelivers the identical update — same `update_id` — repeatedly. Each
 * redelivery is otherwise indistinguishable from a genuinely new message, so the
 * conversational layer re-attempts the same doomed LLM call once per redelivery: wasted
 * spend/latency even though the outbound gate now hides the visible spam. This is a
 * real, documented instance of exactly this failure mode, independent of this codebase:
 * "Telegram: Duplicate message storm during LLM API outages (missing message_id
 * deduplication)" — github.com/openclaw/openclaw issue #58611 — root-caused there to the
 * bot not deduplicating inbound updates by their stable Telegram-assigned id, with the
 * fix being a short-lived (~5 min) seen-id cache. `sawUpdate` below is that cache as a
 * pure function: caller owns the Set/Map of `{updateId: lastSeenAtMs}`, this function
 * only decides membership + expiry, exactly like `shouldEmitFallback`'s ownership split.
 *
 * @param {Map<string|number, number>} seenUpdateIds - updateId -> last-seen ms, caller-owned
 * @param {string|number} updateId - the Telegram update_id on the incoming webhook call
 * @param {number} nowMs
 * @param {number} [ttlMs]
 * @returns {boolean} true if this update should be processed (not a seen-before redelivery)
 */
export function shouldProcessUpdate(seenUpdateIds, updateId, nowMs, ttlMs = INBOUND_DEDUP_TTL_MS_DEFAULT) {
  const lastSeenAtMs = seenUpdateIds.get(updateId);
  if (lastSeenAtMs !== undefined && nowMs - lastSeenAtMs <= ttlMs) return false; // redelivery, skip
  seenUpdateIds.set(updateId, nowMs); // caller is responsible for evicting entries older than ttlMs
  return true;
}
