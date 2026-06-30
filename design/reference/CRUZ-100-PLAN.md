# CRUZ → 100/100 — The Integration Plan
*Reconciles the three-worlds brief (Claude Code) with what already exists. One source of truth for the push from ≈88 to 100. Every item has an acceptance test — "done" = the test passes live, not that work was dispatched.*

The gap to 100 is **convergence + role homes + the agentic through-line + polish** — not a ground-up redesign. Three moves, in order: (1) one spine, (2) the copilot as the surface, (3) three purpose-built role-worlds that read as one product.

---

## What we already have (the assets to build on)
- **`CRUZ.dc.html`** — the monolith app (~3,400 lines). Bilingual `DICT.en/es`, role router, ~30 views, docked-dock copilot, Command Center, Digital Twin, Clasificación IA, honest LIVE/STAGED + Simulate harness. **Still on legacy tokens** (`--ink/--muted/--line/--surface2`), with the semantic spine only *aliased* in `:root`. This is World-2/World-1 territory and the convergence debt.
- **Four spec-grade standalone surfaces — already on the clean spine** with `[data-register]` terminal/almanac flip + EN/ES:
  - `CRUZ Approval Gate.dc.html` — the legal signature gate (cognitive-forcing checklist → cited verdict → 8s cancel → transmitted). **This is the house style for the gate.**
  - `CRUZ Autonomy.dc.html` — Supervised / Co-pilot / Paused governor.
  - `CRUZ Accuracy.dc.html` — measured pass-rates, honest denominator.
  - `CRUZ Opportunities.dc.html` — duty-recovery findings (the prospect-winner).
- These four ARE the north star. The job is to (a) pull the monolith onto their spine, (b) add the missing keystone, (c) build the missing role-homes in the same language.

## The locked foundation (design *within* this)
- **Spine tokens** (already in the 4 surfaces): `--app-bg --surface --surface-raised --surface-sunken --border --border-strong --text-strong --text --text-muted --accent --accent-solid --accent-text --success/-bg/-line --warning/… --danger/… --focus --shadow`. Re-aliased per `[data-register="terminal"|"almanac"]`.
- **Registers:** terminal = navy/cyan #22D3EE console (operator + broker); almanac = paper/ink glass (shipper).
- **Type:** Inter Tight display · Hanken/Inter text · **JetBrains/Space Mono for every number, ID, pedimento, fracción, timestamp, money.**
- **Motion:** 150ms hover · 250ms panel · 400ms page · `cubic-bezier(.22,1,.36,1)`; reduced-motion safe.
- **Signature parts to reuse, not reinvent:** dark icon nav rail (active=cyan) · docked copilot (64px rail → 372px panel → bottom sheet ≤760px) · LivingGlobe · confidence routing strip · status chips (sage/clay/amber/slate/cobalt, 9999px). Cyan/green = live/healthy only, never decoration.

## The honesty law (the moat — encode in every surface)
Never fabricate a number. Every datum is **LIVE / STAGED / honest-empty** (calm "sin datos aún" + the reason). CRUZ proposes, the human authorizes — nothing files/pays/emails autonomously; every irreversible act has a **5s visible cancel**. Filing the pedimento is always the broker's pen. Customs correctness: pedimento `DD AD PPPP SSSSSSS` (keep spaces) · fracción `XXXX.XX.XX` (keep dots) · **IVA base = valor + DTA + IGI** (never ×0.16) · every money field carries MXN/USD · semáforo separate from bridge/lane · UTC stored, America/Chicago shown. Autonomy words: **Supervised / Co-pilot / Paused** — never "autonomous."

---

## The agentic through-line — DESIGN FIRST
**`CRUZ Copilot Trace.dc.html`** — the page-aware docked copilot in one visible **formal state**: `Idle · Watching · Working · Proposed · Awaiting-Signature · Shadow`. The "watch it work" reasoning trace (read docs → cross-reference → assign fracción → confidence → hold at the signature). Confidence always visible and **routes** the work: high → your one-tap signature; low → escalated to the broker. Honest denominator (climb-first, ≥99 aim, no cap). Built once, embedded by every surface via `<dc-import>`. **Acceptance:** all 6 states render in both registers + EN/ES + 375px; Working animates the trace and holds at the gate; nothing auto-files.

---

## DESIGN ORDER (weakest first = fastest jump to "works as one")

### World 3 — Admin / Broker (terminal · oversight + the gate) — *today ≈60, weakest*
- **(a) Broker console on the CRUZ spine** — re-skin the cross-tenant command surface; docked copilot present. *Acc: zero legacy `--wr-/--portal-/--ink/--line` refs; reads identical-product to operator.*
- **(b) Approval / signature gate** — already strong in `Approval Gate.dc.html`; wire to a real prepared-pedimento object + append-only audit. *Acc: signing writes the audit line; 5s cancel live; nothing pressures the decision.*
- **(c) Cross-tenant book** — the whole patente at a glance: every client, calm + dense, semáforo per tenant, honest-empty per cell. *Acc: switching tenant re-scopes; no fabricated rollups.*

### World 2 — Operator (terminal · the doer) — *strong surfaces, no unified home*
- **(a) Operator cockpit** — day at a glance + ranked action queue of what needs a human; copilot always in a visible state.
- **(b) Clearance lifecycle board** — one load: intake → classified → costed → ready-for-signature → filed → released, one-touch GO + 5s cancel.
- **(c) Classification workbench** — proposed fracción + comparables + T-MEC origin calc + confidence; operator edits/approves; append-only, human-gated.
- **(d) Landed-cost / duty-recovery console** — per-line landed cost + "overpaid $X vs comparable" + recovery claim; honest when there's none (the prospect-winner — extend `Opportunities.dc.html`).

### World 1 — Shipper (almanac · calm certainty) — *today ≈78*
- **(a) Shipper home** — "where is my operation right now?" in one calm glance + "what we need from you" (possessive tone, never a compliance countdown).
- **(b) Per-section hero language** — one distinct hero per tab (kills template fatigue).
- **(c) Client copilot** — warm, page-aware, answers from their own data.

---

## Cross-cutting — make it one product
One token system (retire `--wr-/--portal-`, legacy `--ink/--line` → spine) · docked copilot on every surface in a visible state · **universal states on every data component**: populated · honest-empty · skeleton · error+retry · LIVE/STAGED · Shadow · bilingual EN/ES · mobile-first 375px with ≥60px touch targets · keyboard layer (⌘K · / · 1–9 · G · j/k · ?) · **the two-sided moment**: one load visible on the broker terminal AND the client almanac at once.

## Delivery format
Each surface = a `.dc.html` in the existing format, carrying: both relevant registers, the state harness (Loaded / Honest-empty / Skeleton / Error+retry / Shadow), the 375px breakpoint, an EN/ES dictionary. Each new world-surface embeds `CRUZ Copilot Trace` via `<dc-import>` so the through-line is literally shared, not re-coded.

## Sequence
**Copilot Trace → World 3 (a→b→c) → World 2 (a→b→c→d) → World 1 (a→b→c) → convergence sweep on the monolith → proof pass (contact sheet × {375,1440} × {broker,client} × {ES,EN}).** Verify each at desktop + 375px before the next. No big-bang.

## The 100/100 bar (hold every surface to this)
1. Could a new, non-EVCO broker/shipper sign for CRUZ after seeing this surface alone?
2. Does it make the AI's labor visible and the human's signature the one irreplaceable touch?
3. Zero fabricated numbers — LIVE / STAGED / honest-empty only.
4. Broker, operator, shipper read as the **same** product — calm for the client, dense for the desk.
