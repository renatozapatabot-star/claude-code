# CRUZ — Design Log

Reverse-chronological. One entry per shipped slice. The recursive loop (`scripts/cruz-loop.md`)
appends here every run.

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
