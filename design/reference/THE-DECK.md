# THE DECK — Monitor 1 · Monitor 2 · Phone

<!-- DECK-SPEC v1 owner=P6-W1-01 -->

The north-star surface: *"Monitor 1/2 and my phone working at the highest possible level"* — the whole
FREIGHT ecosystem legible at a glance so nothing about the business is ever a surprise. Two monitors
for the cockpit, the phone for the ranked alert stream, @supertitobot + @cruz_rz_bot unified behind one
alert model. Liveness law: every panel carries exactly one of **EN VIVO** / **POR ACTIVAR** and names
its source skill + Supabase table. `canon-check` enforces this.

## Monitor 1 — the operator cockpit (anomaly-first)

| Panel | Source skill | Supabase table | Liveness |
|---|---|---|---|
| Decision queue (¿Qué necesita de ti ahora?) | CRUZ trust loop + `compliance-alert-analyzer` | `traficos`, `documents` | POR ACTIVAR |
| Today's tráficos + semáforo | `crossing-intelligence` | `traficos` | POR ACTIVAR |
| Anomaly strip | `anomaly-detector` | `pedimentos`, `documents` | POR ACTIVAR |
| Where-is-my-shipment | `warehouse-tracker` | `inventory`, `locations` | POR ACTIVAR |

## Monitor 2 — comms · financial · compliance · forecast

| Panel | Source skill | Supabase table | Liveness |
|---|---|---|---|
| Client comms / drafts | `client-communication-writer` | `clients` | POR ACTIVAR |
| Financial (MXN/USD) | `financial-summary` | `accounting` | POR ACTIVAR |
| Compliance calendar (MVE E2) | `mve-compliance` | `traficos`, `clients` | POR ACTIVAR |
| Volume forecast | `demand-forecaster` | `traficos`, `pedimentos` | POR ACTIVAR |

## Phone — the ranked alert stream

| Panel | Source skill | Supabase table | Liveness |
|---|---|---|---|
| Ranked alerts (value×urgency) | `anomaly-detector` + `crossing-intelligence` | `traficos` | POR ACTIVAR |
| Red-day → tap-to-approve | CRUZ signature gate | `traficos` | POR ACTIVAR |

## §Alerts — the unified rail (P6-W2-01)

One alert model behind both bots: every alerting skill (`anomaly-detector`, `crossing-intelligence`,
`compliance-alert-analyzer`) emits into a single ranked, **deduplicated** stream (dedup window default
per [WO-04]; ranking = value × urgency), delivered to **@supertitobot** for family/ops and mirrored to
the Deck phone panel. Never-drop: an undeliverable alert queues and retries, never silently lost.
Built and tested against the P2 mock-Telegram server (`supertito/test/alerts`) so the real
@supertitobot token ([WO-03]) is the only remaining swap. Red-day → phone latency is **measured, not
claimed** (P6-W3-01) — no fabricated <60s number.

## §Charts — one visual system

Every Deck chart, KPI tile, meter, and sparkline is rendered through the `dataviz` design system in the
white+red canon so the two monitors read as one product (§0.3 design mandate). The `demand-forecaster`
volume forecast, the financial meters, and the anomaly strip all inherit the same palette and grammar.
