# SuperTito — POLICY (pinned defaults, [WO-04] ratifiable)

<!-- POLICY v1 owner=P2-W2-03 -->

Founder ratifies these or sets his own (§0.1). Each is pinned by a test.

| Policy | Default | Source | Test |
|---|---|---|---|
| Escalation batch cap | **25** per scan tick | `src/escalation.mjs` DEFAULT_BATCH_CAP | `escalation: cap honored` |
| Alert dedup window | **1h** (3_600_000 ms) | alert rail | (P6-W2-01) |
| Receipt issuer | **the gateway process only** (single authorized issuer) | `src/receipt-store.mjs` | `receipt store` suite |
| Boot-token TTL | **60s** (60_000 ms) | `src/boot-token.mjs` DEFAULT_TTL_MS | `boot token` suite |
| Roster | **{renato-iv, renato-iii, supertito-bot}** exactly | `src/sender-registry.mjs` CANON_ROSTER | `sender registry` suite |
| Channel | **@supertitobot** (Telegram, Throne/Hermes gateway) — founder-ruled name, [WO-15] closed 2026-07-19 | `src/transport.mjs` (channel-agnostic) | `transport` suite |
| Fallback-message dedup window ([WO-18]) | **5 min** (300_000 ms) | `src/fallback-limiter.mjs` FALLBACK_DEDUP_WINDOW_MS_DEFAULT | `shouldEmitFallback: a genuinely new failure after the window elapses emits again` |
| Circuit-breaker failure threshold ([WO-18]) | **3** consecutive conversational-layer failures | `src/fallback-limiter.mjs` CIRCUIT_FAILURE_THRESHOLD_DEFAULT | `updateCircuit: trips OPEN after the failure threshold, stays CLOSED before it` |
| Circuit-breaker cooldown ([WO-18]) | **2 min** (120_000 ms) before a single HALF_OPEN probe is allowed | `src/fallback-limiter.mjs` CIRCUIT_COOLDOWN_MS_DEFAULT | `canProbe: false while OPEN and cooldown has not elapsed, true once it has` |
| Retry backoff base/cap ([WO-18]) | **1s base / 30s cap**, full-jitter (AWS Builders' Library formula) | `src/fallback-limiter.mjs` BACKOFF_BASE_MS_DEFAULT / BACKOFF_CAP_MS_DEFAULT | `nextBackoffDelayMs: grows with attempt number and stays within the jittered bound` |
| Inbound Telegram update-id dedup TTL ([WO-18]) | **5 min** (300_000 ms) | `src/fallback-limiter.mjs` INBOUND_DEDUP_TTL_MS_DEFAULT | `shouldProcessUpdate: a Telegram redelivery of the same update_id within the TTL is skipped (openclaw #58611 pattern)` |

**Founder-side residuals (never claimed real, machine-listed — ST-9):**
- real @supertitobot token custody (renamed from `@clawdyia_rz_bot` on Throne) → [WO-03]
- binding roster members to real chat/user ids → [WO-03]
- live channel outage drill (vs the mock) → [P6-W3-01]
