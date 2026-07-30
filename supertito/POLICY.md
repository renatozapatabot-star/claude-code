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

**Founder-side residuals (never claimed real, machine-listed — ST-9):**
- real @supertitobot token custody (renamed from `@clawdyia_rz_bot` on Throne) → [WO-03]
- binding roster members to real chat/user ids → [WO-03]
- live channel outage drill (vs the mock) → [P6-W3-01]
