# FREIGHT (OS) — THE OPERATIONS PIPELINE

<!-- PIPELINE-SPEC v1 owner=P1-W1-01 -->

The end-to-end wiring of the brokerage: intake → validate → classify → comply → cross → dispatch →
warehouse → invoice/audit. Each stage names its **skill**, its **trigger**, and its **Supabase table(s)**.
Liveness law (§0.4-7 of the canon): every stage that touches the real DB/Telegram/WhatsApp is
**POR ACTIVAR** until its work order lands ([WO-01] DB, [WO-03] Telegram); nothing is claimed EN VIVO
without a logged run. `canon-check` enforces that every stage below names a skill and a table.

| # | Stage | Skill | Trigger | Supabase table(s) | Liveness |
|---|---|---|---|---|---|
| 1 | Intake | `email-ingestion` | inbound to ai@renatozapata.com | `entradas`, `documents` | POR ACTIVAR (WO-01) |
| 2 | Validate | `document-checklist-validator` | new entrada | `documents` (61 types), `traficos` | POR ACTIVAR (WO-01) |
| 3 | Classify | `oca-opinion` + `cost-optimizer` | validated tráfico | `pedimentos`, `fracciones` | POR ACTIVAR (WO-01) |
| 3b | Origin cert | `usmca-certificate-generator` | cost-optimizer flags USMCA-qualified origin | `pedimentos`, `expedientes` | POR ACTIVAR (WO-01) |
| 4 | Comply | `compliance-alert-analyzer` + `mve-compliance` | tráfico risk / MVE deadline | `traficos`, `clients` | POR ACTIVAR (WO-01) |
| 5 | Cross | `crossing-intelligence` | SOIA semáforo change | `traficos` (bridge/lane) | POR ACTIVAR (WO-01) |
| 6 | Dispatch | `dispatch-coordinator` | cleared shipment | `traficos`, `carriers` | POR ACTIVAR (WO-01) + **GO-gated** |
| 7 | Warehouse | `warehouse-tracker` | dock receive / release | `inventory`, `locations` | POR ACTIVAR (WO-01) |
| 8 | Invoice/audit | `financial-summary` + `evco-audit-report` | weekly / on settlement | `accounting`, `quotes` | POR ACTIVAR (WO-01) |

## §Real-CRUZ-status (ground truth, 2026-07-30 — corrects the blanket POR ACTIVAR above for stage 1)

The real `evco-portal` repo tracks its own 12-step clearance lifecycle in `PIPELINE.md` (its single
source of truth, last updated 2026-04-05): `INTAKE → CLASSIFY → COMPLETENESS → SOLICIT → DRAFT →
REVIEW → TRANSMIT → CROSSING → CLEARANCE → INVOICE → PAYMENT → ARCHIVE`. Real status, per that
tracker:

| Step | Status |
|---|---|
| 1. Intake (`email-intake.js`, Gmail OAuth on `ai@`, Sonnet extraction, */15min cron) | ✅ **WORKING** |
| 2. Classify | ✅ **WORKING** |
| 3. Completeness + Sync | ✅ **WORKING** |
| 4. Solicit | 🟡 PARTIAL |
| 5. Draft | 🟢 READY (API credits funded) |
| 6. Review + Approval | ✅ **WORKING** |
| 7. Shadow Intelligence | ✅ **WORKING** |
| 8. Transmit | ❌ NOT BUILT |
| 9. Crossing | ❌ NOT BUILT |
| 10. Clearance | ❌ NOT BUILT |
| 11. Invoice + Payment | ❌ NOT BUILT |
| 12. Archive | 🟡 PARTIAL |

**This corrects stage 1 above** — `email-ingestion`-equivalent intake is not "POR ACTIVAR (WO-01)," it
is **already running** in production on `ai@renatozapata.com` (a real refresh token, a real cron, real
Sonnet extraction). The stage-1..8 table above documents the *intended skill-based re-implementation*
for the founder's wider ops surface; the real evco-portal build is the actual, currently-shipping CRUZ
product and is ahead of that intent on steps 1–3, 6–7. Steps 8–11 (Transmit/Crossing/Clearance/
Invoice+Payment — the actual filing-to-cash chain) are the real gap, not steps 1–3. Named real
operator: **Tito** (`tito@renatozapata.com`) is who "the phone buzzes" per `VISION.md`'s approval flow.
Real license identity: **Renato Zapata & Company · Patente 3596 · Aduana 240 · Est. 1941.**

## Cross-cutting inputs

- **Forecast:** `demand-forecaster` reads historical `traficos`/`pedimentos` to pre-stage document
  requirements per client and feed the Deck's Monitor-2 volume forecast (P6). Trigger: nightly.
- **Onboarding:** `new-client-onboarding` produces RFC-verification + IMMEX-eligibility + Spanish
  service-agreement drafts for the next portal-rollout client (WO-12 order: EVCO → Duratech →
  Milacron → Foam Supplies). Trigger: founder adds a client. Table: `clients`. Draft-only.
- **Quotes:** `rate-quote-generator` at prospect/quote time → `quotes` table + a shareable PDF (P7).

## §Savings — the commercial moat

Standing rule (documented intent; enforced when the real repo lands per [P1-W2-02]): **every pedimento
prepared runs `cost-optimizer`** (USMCA preferential rate, optimal fracción, duty drawback,
consolidation, bridge timing) and the resulting savings figure is written into the client's completion
report. The savings number is the sales artifact (P7). Per-shipment checklist:

1. USMCA/T-MEC preferential eligibility checked → certificate generated if qualified (stage 3b).
2. Optimal fracción selected and its duty delta vs the naive fracción recorded.
3. Duty-drawback opportunity flagged if applicable.
4. Consolidation recommendation if ≥2 shipments share lane/window.
5. Bridge-timing optimization from `crossing-intelligence`.
6. Total `saved_mxn` / `saved_usd` written to the completion report + `accounting`.

## §Trust-loop reconciliation (canon §0.4-8 — nothing sends without a GO)

Two skills have outbound legs that must be reconciled with the draft-only law:

- **`email-ingestion` auto-reply:** the intake status acknowledgment is a **non-consequential**
  automated receipt (confirms "we received your docs", contains no client-consequential commitment,
  price, or filing). This is the single named exception to §0.4-8 — logged here, non-consequential
  only. Any status reply carrying a commitment/price/date is staged as a Gmail **draft**, not sent.
- **`dispatch-coordinator` WhatsApp:** carrier notification is an **irreversible outbound act** and is
  therefore **GO-gated** — it fires only after an explicit founder/broker GO through the CRUZ
  decision-queue → signature gate → cancel-window, or is staged as a one-tap prepared message.
  Never auto-fires.
