# CRUZ — Design Log

Reverse-chronological. One entry per shipped slice. The recursive loop (`scripts/cruz-loop.md`)
appends here every run.

---

## 2026-06-30 · Slice 003 — Polish to 100/100 (alive & premium)

**Surface audited:** all six surfaces + the persistent copilot (founder chose "polish everything to 100/100").
**User + action:** every role should feel the product is alive, fast, and premium — KPIs that animate in,
honest loading instead of blank flashes, a copilot that visibly reacts to where you are, and a pedimento
that shows its full reasoning trail before you sign.

**Changes made**
- **KPI count-up:** stat numbers ease from 0 → value (650ms, cubic-out) when a surface is shown; honors
  `prefers-reduced-motion` (snaps to final). Parses prefix/suffix so `$3.45M`, `94%`, `120` all animate.
- **Skeleton loading:** shimmer placeholders for stats, decision queue, recent + Embarques rows paint
  before data resolves (empty ≠ zero, loading ≠ error).
- **Copilot state machine:** each surface sets a believable state (Inicio/Embarques→Vigilando ·
  Pedimentos→Propuesto · Expedientes/Facturación→Trabajando · Clientes→Inactivo); the pill status
  **cross-fades 200ms** on navigation and the drawer's state chips + header track it; orb warms on work.
- **Audit-trail timeline** on the pedimento drawer (CRUZ generó → 14/14 validaciones → Esperando tu
  e.firma / Transmitido), reusing the crossing `.timeline` component for cohesion.

**Screenshot / browser verification:** `node scripts/verify.mjs` → 15 shots desktop + 375px. **VERIFY:
CLEAN** — 0 console errors, 0 horizontal overflow. Pedimento drawer confirmed: header + duties + 14/14 +
audit trail + sign CTA.

**Commands run:** `node --check public/app.js`, `node scripts/verify.mjs`.

**Proven vs subjective**
- *Proven:* count-up runs without console errors; skeletons paint then get replaced; copilot state changes
  per view; audit timeline renders with correct states; no overflow.
- *Subjective:* count-up easing feel; whether skeleton timing reads well on real (slow) networks.

**Next smallest design move:** (founder feedback) brand front door (Login + living globe) · deepen the
Pedimento classify reasoning/citations · mobile field mode (60px GO).

---

## 2026-06-30 · Slice 002 — Complete the whole front end (ultracode)

**Surface audited:** the four placeholder surfaces (Pedimentos, Expedientes, Facturación, Clientes).
**User + action:** every EVCO role (broker, accounting, ops) needs their real workspace — not a stub —
to clear pedimentos, find documents, chase invoices, and read the book of business at a glance.

**Method (ultracode):** ran a background **workflow** — 4 parallel `Explore` agents mined the real
`design/reference/CRUZ.dc.html` package, each returning a structured, implementation-ready spec for its
surface (faithful CRUZ substance mapped to the white+red canon). I then integrated all four coherently
into the shared design system (cohesion kept in one hand) and verified the whole. (4 agents · ~247k tok.)

**Changes made**
- **Pedimentos** — clearance pipeline: KPIs (listos para firma / transmitidos / contribuciones MXN),
  dense table (pedimento · clave A1/IN · 14/14 validaciones · semáforo · estado · contribuciones), and a
  detail drawer with entry header, **duties IGI/DTA/IVA**, SAT validations, and **Firmar y transmitir al SAT**
  → reuses the 5s-undo trust loop. (`data/pedimentos.js`)
- **Expedientes** — Document Hub: COVE/Pedimento/Carta Porte/B-L per embarque, doc-state pills, value.
- **Facturación** — honorarios MTD · desembolsado · cobrado % · vencidas; invoice table with overdue in
  crimson and **e.conta EN VIVO / QuickBooks POR ACTIVAR** honest feed badges.
- **Clientes** — cartera: KPIs + dense table (avatar · RFC/patente · cargas 30d · MVE color-coded ·
  alertas · semáforo · valor) + client detail drawer (identity, compliance/risk, 30-day operation).
- `data/surfaces.js` (deterministic, honest derivations), 6 new API endpoints, all bilingual ES/EN.

**Screenshot / browser verification:** `node scripts/verify.mjs` → 15 shots desktop + 375px across all six
surfaces + drawers. **VERIFY: CLEAN** — 0 console errors, 0 horizontal overflow at 375px.

**Commands run:** `node --check` (server + data + app.js), `node scripts/verify.mjs`.

**Proven vs subjective**
- *Proven:* all six surfaces render real data from their endpoints; no console errors; no 375px overflow;
  pedimento sign → transmit → ledger works; honest LIVE/STAGED badges present.
- *Subjective:* per-surface visual refinement (e.g. Clientes mobile card height; audit-trail timeline on
  pedimento drawer is described in the spec but not yet built).

**Next smallest design move:** (founder feedback loop — see below) audit-trail timeline on the pedimento
drawer · copilot state machine wired to navigation · KPI count-up + skeleton + error/retry states.

---

## 2026-06-30 · Slice 001 — Canonical white+red foundation + the trust loop

**Surface audited:** greenfield repo (empty). Built the CRUZ shell from the founder brief + the real
`CRUZ.dc.html` design package (imported via uploaded ZIP after the design MCP / live portal proved
unreachable from this sandbox — see README "Import status").

**User + action:** an EVCO broker/operator opens CRUZ and must instantly answer "where is my load /
pedimento / client?" and "what needs my signature right now?" — then sign with confidence.

**Visual/UX issues found & fixed this slice**
- No product existed → built the white+red canon (`DESIGN.md`): warm paper + one red stamp, hairline
  structure, tabular-mono codes/money. Founder-approved as canonical (supersedes navy/cyan palette).
- Implemented the **real CRUZ substance** in that skin: the calm "Google moment" Inicio, the **decision
  queue** (`¿Qué necesita de ti ahora?` — confidence /99, semáforo, Aprobar y firmar), the **signature
  gate** ("Nada se transmite hasta que firmes — luego 5 s para cancelar"), **5s undo → ledger**, and the
  **persistent copilot** (state machine, Supervisado/Co-piloto, EN ESTA VISTA context, GO proposals,
  MODO SOMBRA, agent crew, "Lo que CRUZ hizo hoy").
- **Honest data:** `DATOS DEMO` badge, EN VIVO / POR ACTIVAR feed status, "Pendiente de sincronización".
- **Bilingual ES/EN** toggle (ES default, persisted).
- Dense **Embarques** table (pedimento, semáforo, value) + detail drawer with the **crossing timeline**.
- Bugs caught by `verify.mjs` and fixed: mobile nav needed hamburger-first; dangling "ESTADO" label on
  mobile cards; topbar overflow at 375 (462→375px); toast fully hidden until shown.

**Change made:** `server.js` (zero-dep API), `data/embarques.js`, `data/cruz.js`, `public/{index.html,
styles.css,app.js,favicon.svg}`, `scripts/verify.mjs`, `DESIGN.md`, `scripts/cruz-loop.md`.

**Screenshot / browser verification:** `node scripts/verify.mjs` → 8 shots (desktop + 375px) for Inicio,
Embarques, drawer, copilot, signature gate. Result: **VERIFY: CLEAN** — 0 console errors, 0 horizontal
overflow at 375px (`scrollW == docW == 375`).

**Commands run:** `node --check` (server + data), `node scripts/verify.mjs`.

**Proven vs subjective**
- *Proven:* frontend↔backend works (health/summary/search/decisions/copilot endpoints return live data);
  no console errors; no 375px overflow; trust-loop interactions (gate → 5s undo → ledger) function.
- *Subjective:* whether the brand reads as "inevitable" at founder bar; copilot state machine is presentational
  (not yet a formal Idle/Watching/Working machine with 200ms cross-fade).

**Next smallest design move**
1. Wire the copilot state machine to navigation (Idle/Watching/Working/Proposed/Awaiting) with a 200ms cross-fade.
2. Build the **Pedimentos** surface for real (clearance pipeline → signature gate), replacing its placeholder.
3. KPI count-up + skeleton shimmer + error/retry as universal per-screen states.

### Needs founder
- Confirm Embarques column set (currently: Embarque · Cliente · Ruta · Estado · Pedimento · Semáforo · Valor).
