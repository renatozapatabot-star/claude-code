# CRUZ — Design Log

Reverse-chronological. One entry per shipped slice. The recursive loop (`scripts/cruz-loop.md`)
appends here every run.

---

## 2026-06-30 · Slice 008 — Mobile field mode (usable at the dock at 3 AM)

**Surface audited:** the mobile (375px) experience of the trust loop's primary actions.
**User + action:** a warehouse/border operator on a phone needs one-thumb GO targets and full-screen
sheets — no precise tapping, no cramped modals.

**Change made** (`public/styles.css`, responsive only — no new components)
- **Signature gate → bottom sheet** on phones: full-width, rounded top, safe-area padding; "Firmar y
  avanzar" is a **56px** target.
- **Copilot → full-screen sheet** (100vw) on phones; "Pregunta o comanda a CRUZ…" reachable one-thumb.
- Bigger touch targets: primary buttons ≥48px, GO/sign ≥56px, decision CTAs ≥46px.
- Safe-area insets on the copilot pill and the undo toast (toast spans the width on phones).

**Screenshot / browser verification:** `node scripts/verify.mjs` → shots 18 (copilot 375) + 19 (gate 375
bottom sheet). **VERIFY: CLEAN** — 0 console errors, 0 overflow.

**Commands run:** `node scripts/verify.mjs`.

**Proven vs subjective:** *proven* — full-screen sheets + 56px targets render, no overflow. *Subjective* —
a fully bespoke field view (ambient agent strip, scan CTA) is still a larger future slice for the loop.

**Next smallest design move:** bespoke MobileField view + scan CTA · live `window.claude.complete` copilot —
carried by the nightly 06:01 loop with the critic gate.

---

## 2026-06-30 · Slice 007 — Pedimento depth: AI classification reasoning + citations

**Surface audited:** the Pedimento drawer (the legally-serious customs centerpiece for dad/EVCO).
**User + action:** before signing a pedimento, the broker must *see why* CRUZ classified the goods —
the recommended fraction, the reasoning, the legal basis, and what was ruled out.

**Change made**
- New **"Clasificación IA"** section in the pedimento drawer: CRUZ-recommended LIGIE fraction (mono) +
  confidence /99, plain-language description, **reasoning** (T-MEC VCR origin), **legal references**
  (LIGIE 2022, T-MEC Anexo 4-B, Nota Explicativa SA), and **alternatives considered** (with why-ruled-out).
- `data/pedimentos.js`: deterministic `clasificar(goods)` mapping goods → real LIGIE fractions; reused the
  existing `.co-card` / `.section-h` / `.conf` components (no new design language). Bilingual ES/EN.

**Screenshot / browser verification:** `node scripts/verify.mjs` → shot 10 confirms the section renders
(8450.20.01 · 90/99 · reasoning · references · alternatives). **VERIFY: CLEAN** — 0 errors, 0 overflow.

**Commands run:** `node --check public/app.js data/pedimentos.js`, `node scripts/verify.mjs`.

**Proven vs subjective:** *proven* — renders from data, bilingual, no errors. *Subjective* — depth of the
reasoning copy; real version wires `window.claude.complete` per the handoff.

**Next smallest design move:** mobile field mode (one-thumb, 60px GO) — carried next / by the nightly loop.

---

## 2026-06-30 · Slice 006 — Red globe (founder call) + modal focus management

**Surface audited:** the Login globe and all modal panels (drawer, gate, copilot).
**User + action:** founder call — make the globe strictly white+red; and a keyboard/screen-reader user
opening any panel must land inside it, stay trapped while it's open, and return to where they were.

**Changes made**
- **Globe tinted red/ember** (`public/globe.js`): retinted the full palette — land/ocean dots, atmosphere,
  sphere gradient, specular, halo, rim, and all corridor/world arcs + comets — from cyan/teal into the
  CRUZ red family. The US–MX crossing flares brightest. Offline-first dot-globe, console-clean.
- **Modal focus management** (`public/app.js` + dialog semantics in `index.html`): drawer / signature gate /
  copilot now `role="dialog" aria-modal="true"`; opening moves focus inside, **traps Tab** (wraps first↔last),
  and closing **restores focus** to the trigger. Fixed the copilot assist toggle to re-render in place.

**Screenshot / browser verification:** `node scripts/verify.mjs` → 17 shots desktop + 375px (login globe
confirmed red). **VERIFY: CLEAN** — 0 console errors, 0 overflow.

**Commands run:** `node --check public/{app.js,globe.js}`, `node scripts/verify.mjs`.

**Proven vs subjective**
- *Proven:* globe renders red without console errors; focus enters/traps/restores across all three modals.
- *Subjective:* exact red warmth of the globe; a few deep-background world arcs are subtle.

**Next smallest design move:** deepen Pedimento (classify reasoning + citations) · mobile field mode · the
nightly 06:01 loop carries these with the critic gate.

---

## 2026-06-30 · Slice 005 — 100/100 critic gate (a11y · bilingual · robustness)

**Surface audited:** the whole product, via an **adversarial critic workflow** — 4 parallel `Explore`
reviewers (canon/cohesion · accessibility · clarity/honest-data · robustness) over the actual code,
returning 32 concrete, confidence-rated, file-anchored findings. (4 agents · ~286k tok.)

**User + action:** a keyboard-only operator, a Spanish *and* English user, and a screen-reader user must
all get a first-class experience — the bar for "most trusted tool for my operation."

**Changes made (the real levers; cosmetic 1px token-churn deliberately skipped)**
- **Bilingual completeness:** removed the last hardcoded Spanish (embarque + pedimento drawers — Cruce,
  Aduana, Agente aduanal, Mercancía, Caja, Sello, ETA, plus the hold/review alert copy) → new `dr_*` keys
  in ES/EN. The whole UI now flips language with zero leakage.
- **Keyboard a11y:** decision-queue rows (the trust loop's primary action) are now `role="button"`,
  focusable, with Enter/Space handlers + aria-label; global brand `:focus-visible` ring (slice prep);
  KPI stat cards gained `:hover`/`:active` feedback.
- **Contrast:** pill text weight 560→600 for AA on washed backgrounds.
- **Reduced-motion:** hover transforms neutralized under `prefers-reduced-motion`.
- **Robustness:** null-id guards on `openDrawer`/`openPedimento`; copilot state coerced to a valid key
  before any `t('states_'+k)` lookup (never expose a raw i18n key); unified portfolio-value KPI precision.

**Screenshot / browser verification:** `node scripts/verify.mjs` → 17 shots desktop + 375px. **VERIFY:
CLEAN** — 0 console errors, 0 overflow.

**Commands run:** `node --check public/app.js`, `node scripts/verify.mjs`.

**Proven vs subjective**
- *Proven:* no console errors/overflow; bilingual drawers flip fully; queue rows keyboard-operable; guards
  added without behavior change.
- *Still open (queued, mostly need care not auto-fix):* focus-trap + focus-restore in modals; full
  screen-reader pass; the loop doc now runs this critic gate every substantial pass.

**Next smallest design move:** focus-trap/restore in drawers · founder call on globe tint · deepen Pedimento classify reasoning.

---

## 2026-06-30 · Slice 004 — Brand front door (Login + living globe)

**Surface audited:** none existed — the app had no entry point. Built the CRUZ Login at `/login`.
**User + action:** first impression. A new EVCO user lands and instantly feels the brand: serious,
global, alive — "the operating system of the crossing" — then signs in.

**Change made**
- Split front door: **dark space brand panel** (the one place dark is justified — it's space) with the
  real **living globe** (`public/globe.js`, the reference dot-globe: Fibonacci sphere, land mask, US–MX
  corridor dots, starfield, drag-to-spin) + a red brand glow, the CRUZ mark, and the headline
  "Una sola pregunta: ¿dónde está mi carga ahora mismo?" + live border wait-times.
- **White form side** in canon: Entrar (red), email/password, SSO (Google/Microsoft), e.firma del SAT.
- Bilingual ES/EN (shares `localStorage cruz.lang` with the app); `/login` routed in `server.js`.
- Disabled the external NASA texture fetch (CDN egress-blocked) — the dot-globe is our canonical look,
  so it's offline-first and console-clean.

**Screenshot / browser verification:** `node scripts/verify.mjs` → shots 16/17 (login desktop + 375px).
**VERIFY: CLEAN** — 0 console errors, 0 overflow. Globe paints; form + globe stack cleanly on mobile.

**Commands run:** `node --check server.js`, `node scripts/verify.mjs`.

**Proven vs subjective**
- *Proven:* login renders, globe animates without console errors, bilingual works, mobile stacks clean.
- *Subjective / needs founder:* the dot-globe's atmosphere reads **teal/cyan** (reference default) rather
  than red — beautiful and earth-like, with a red brand glow tying it in, but a cohesion call: tint the
  globe/corridor arcs red to be strictly white+red, or keep teal earth as "the planet." → Needs founder.

**Next smallest design move:** founder call on globe tint · deepen Pedimento classify reasoning · mobile field mode.

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
