# FREIGHT (OS) — THE STRATEGIC OVERLAY · v3.4 · 2026-07-30

<!-- CANON-META version=3.5 status=proposed-overlay-defers-to-control-plane supersedes=FREIGHTCOMPLETE100PLAN20260719.pdf(v1.4) authority=freightos-control-plane/canon/HANDOFF-MASTER.md -->

> **v3.4:** 🚨 found a live SEV-1 cross-tenant data-isolation risk in the real `evco-portal` (EVCO +
> MAFESA, ~$5.86M+ verified value exposed) — fully diagnosed, logged as [WO-16]/[P4-W1-00], awaiting
> founder write-access confirmation to fix. Also corrected the client roster (added MAFESA) and
> pipeline stage-1 status (real intake is already WORKING, not POR ACTIVAR).

> **v3.3 — FOUNDER RULING, binding instantly, supersedes v3.0's framing below:** *"CRUZ is within
> FREIGHT." "Everything exists within FREIGHT." "Including SuperTito and everything."* **FREIGHT is
> the one true umbrella. CRUZ, Adjunto, SuperTito, Clawdia, the Throne, the second brain, the Deck —
> all of it is within FREIGHT, one enterprise, one ownership.** The "federation"/"boundary-separate"
> language the v3.0 note below drew from the control-plane repo is **reconciled, not deleted**: it
> describes real engineering discipline (no shared database, no proximity-based data import,
> independent *scorecards*) that operates **inside** the one FREIGHT umbrella — never again read as
> evidence of separate ownership. See §0.3 for the full reconciliation.

> **v3.2:** magnify-glass sweep — all 9 real repos + Gmail/Calendar pulled in. Found the
> Money-Employment dial-block loop is **LIVE** (real cockpit, real calendar rhythm), Adjunto is
> **live at adjunto.co**, an 18-day-stale hot lead (Ursula/EVCO) got a drafted (not sent) reply,
> and — critically — **caught and fixed a real entity-boundary violation**: an item that would have
> built a FREIGHT cockpit inside CRUZ. The real cockpit already exists in `clawdia-presence`.

> **v3.0 (historical — entity framing superseded by v3.3 above):** A 6-agent sweep of the real
> `freightos-control-plane` (69 findings) showed the earlier drafts inherited the v1.4 PDF's fictions
> about paths/SHAs/suite counts (that correction stands). Its entity-ownership framing — "boundary-
> preserving federation, not one umbrella," "CRUZ is EVCO-only" as a *separation* claim — does **not**
> stand; the founder ruled directly (v3.3). What still stands from v3.0: Adjunto's own mint/navy
> canon; Money Employment as FREIGHT's execution-core goal; the four scorecards stay unaveraged; the
> real authority is **`HANDOFF-MASTER.md`**, to which this overlay **defers** on execution matters —
> but never on the entity/ownership model, which is the founder's alone to set (§0.1).

**Strategic ecosystem overlay** for the founder's estate — FREIGHT · Adjunto · CRUZ · Clawdia · the
Throne · the second brain. **Authority note (corrected 2026-07-19 against the real control plane):**
the canonical *operational* authority is `freightos-control-plane`'s `canon/HANDOFF-MASTER.md` +
`docs/plans/FREIGHT-OS-10-10-FOUNDER-OVERRIDE-PLAN.md`, canonical only by registry exact-path + remote
`main` + byte-identical materialization receipt — *never by proximity or frontmatter*. **This document
does not self-declare authority over the ecosystem**; it is the strategy/growth/design/cross-pillar
overlay that **defers to** that kernel on everything the kernel governs (§0.2a). It supersedes the Kimi
Masterplan v1.4 as *planning*; v1.4 remains history (add-only lineage).
This is a plan **and** a law. **Falsifiability scope:** every item names an acceptance command;
structural and spec items are machine-gated by `npm run canon` (`scripts/canon-check.mjs`, which reads
the spec files' content, not just their existence); items whose terminal evidence needs the founder or
the real world carry a founder-side acceptance **plus** a here-side Prep-now that runs now (§2).

---

## §0 — CANONICAL-LAW HEADER

### §0.1 FOUNDER OVERRIDE (the supreme clause)

**Renato Zapata IV (the founder-operator) is the supreme authority of this canon; Renato Zapata III
(his father) is co-principal** — the v1.4 WO-F-14 Dad-authority model, hereby ratified. Either
principal's explicit instruction — in any channel (chat, Telegram @supertitobot, email, commit,
voice) — **overrides any provision of this document, any skill, any workflow, any agent, and any prior
plan**, immediately and without process. An exercised override is *logged* as an add-only amendment in
§5.4 (date · instruction · clause affected), never resisted, never silently ignored, and never used as
precedent to weaken the honesty laws below without his explicit say-so. No AI output ever outranks the
founder. When the founder's instruction and this canon conflict, the founder wins and the canon is
amended to match him.

**The binding rule (founder directive, 2026-07-19): *"Per me, everything I say is binding."*** Every
instruction the founder gives — the moment he gives it, in any channel — **is canon**. It does not
wait for review, ratification, or agreement; it takes effect immediately and this document is amended
to match it (logged add-only in §5.4). There is no higher authority in this ecosystem than the
founder's word.

### §0.1a Bias-to-action (founder directive, 2026-07-19)

The founder has directed: *"All this about me not being able to do whatever because of rules — I'm the
founder; if it doesn't help me, eliminate it."* Therefore this canon carries **no process-restraint for
its own sake.** Agents acting under it default to **doing**, not asking — arming automations, drafting,
building, scanning the estate, wiring resources — without seeking permission the founder has already
granted (§0.3 full-access grant). The **only** limits that survive are the ones that *protect the
founder* and therefore help him: (1) **no fabricated data** (honesty laws §0.4 — the moat that makes
FREIGHT sellable and audit-proof); (2) **no irreversible outbound to a client or third party — a send,
a filing, a payment — without the founder's explicit GO** (§0.4-8 — this protects his money, license,
and reputation, so it stays). Everything else that merely slowed him down is eliminated. When in doubt,
act and log it (§5.4), don't wait.

### §0.2a Reconciliation with the control-plane canon

The real repo `freightos-control-plane` carries the **canonical operational authority**: a document is
canon **only** when registered in `canon/registry.json` by exact path, its provenance commit is
contained by advertised remote `refs/heads/main`, source and target are byte-identical, and a
materialization receipt binds them — *"never by frontmatter or directory proximity alone."* The active
router is `canon/HANDOFF-MASTER.md`; the execution plan of record is
`docs/plans/FREIGHT-OS-10-10-FOUNDER-OVERRIDE-PLAN.md`.

**Therefore this document has zero canonical standing under that rule — and does not claim any.** It is
the **strategic/growth/design overlay**: it plans the cross-pillar strategy, growth, and design the
kernel does not touch, and **defers to the kernel** (HANDOFF-MASTER + the founder-override plan) on
everything the kernel governs — scoring, admission, evidence, waves (**never the entity/ownership
model itself, which is the founder's alone to set, §0.1/§0.3**). On any conflict the kernel wins on
execution matters and this doc is amended to cite it. Only the founder (§0.1) outranks the kernel. To
*become* canon, this overlay's durable parts must be admitted into the control plane by its own
registry+receipt process ([WO-07]).

### §0.2 Amendment + conflict law

- **Add-only.** Nothing is ever deleted from this canon. Corrections annotate in place; superseded
  clauses are struck with a pointer to their successor.
- **Restamp-vs-successor default** (resolving v1.4's open WO-F decision): a *correction of the same
  obligation* is a **restamp** (edit in place + §5.4 note); a *genuinely new obligation that replaces
  an old one* is a **successor** (new item id, old one struck with a `→ successor` pointer). When in
  doubt, prefer successor (preserves lineage). The founder may override either way.
- **Conflict order:** Founder override → this canon §0–§5 → Masterplan v1.4 (historical annex) →
  `DESIGN.md` / `scripts/cruz-loop.md` (the live design-law of the CRUZ pillar, incorporated by
  reference). Any conflict discovered is a defect, logged in §5.4 in the same commit that resolves it.

### §0.3 Scope — FREIGHT is the one true umbrella; everything exists within it

**FOUNDER RULING (binding instantly, §0.1, 2026-07-30): "CRUZ is within FREIGHT." / "Everything
exists within FREIGHT."** This is the ownership/entity model, full stop, and it overrides the
framing this canon drew from the control-plane repo's own internal language (which spoke of
"boundary-separate" entities and "no umbrella"). That language is **reconciled, not deleted**: it
describes real, valid **engineering discipline** (no shared raw database, no proximity-based data/
doctrine import, independent scorecards per surface) that operates *inside* the one FREIGHT
umbrella — it is not evidence of separate ownership, and it never again overrides the founder's
statement above. Where the two seem to conflict, the founder's word is the entity model; the
isolation rules are implementation hygiene underneath it.

**Ground truth, reconciled:**

- **F.R.E.I.G.H.T.** is the umbrella — the whole enterprise, its private freight-brokerage execution
  core, and every product/surface within it. The execution core is *prepare-only*: it researches,
  ranks, prepares, reconciles, monitors, recovers, and learns so the next **authorized** action is
  ready; the human owns every irreversible/signed/licensed act, send, bill, and money move. Its
  execution-core goal is **"Money Employment"** (verified cold calls → booked-and-covered Norfleet
  loads → bank-settled cash). Control plane: `freightos-control-plane` (canon/kernel/admission/
  evidence — the execution kernel, §0.2a).
- **Adjunto** — within FREIGHT — is the **public-facing brand/product** (`adjunto-integration-launch`),
  with its **own mint/navy Seal-Tile design canon** (does not inherit CRUZ's white+red) and its own
  $0/$4.99/$9.99 contract. The public lead-gen surface.
- **CRUZ** — within FREIGHT (founder ruling above) — is the EVCO customs-clearance portal
  (`evco-portal` → portal.renatozapata.com; a licensed human owns the final customs act), in the
  white+red canon (`DESIGN.md`). This repo is CRUZ's design source.
- **Clawdia** — within FREIGHT — is the real proactive/briefing presence (`clawdia-presence`) and
  also the operational cockpit for FREIGHT's execution core (`app/plaios/freight/`, §1.6/P6); the
  same repo also hosts Clawdia's own personal-AI identity project — within FREIGHT, measured by its
  own independent single-user rubric (never merged into FREIGHT's execution scoring, per the
  independent-scorecards allowance below). **@supertitobot / Telegram** is the founder-ruled name for
  the proactive rail ([WO-15] closed).
- **The Throne Mac Studio** — within FREIGHT — is the physical operating body (`throne-stack`):
  release-pinned, PM2 `freight-throne` on loopback + private Tailnet Serve, **public Funnel OFF**,
  `operating_state=not_ready` (signed authority absent → telephony withheld). [WO-13].
- **The second brain** (`aguila-brain`) and **the Deck** (Monitor 1 + Monitor 2 + phone, P6) are both
  within FREIGHT — operator-facing surfaces over the same umbrella.

**Design mandate:** everything within FREIGHT is *beautifully and badassly designed*; each surface
may keep its own visual canon (CRUZ white+red, Adjunto mint/navy) for product-fit reasons, coherent
within itself, all serving the one enterprise.

**Independent scorecards (engineering discipline, kept):** Adjunto, the FREIGHT execution core
(Money Employment), and PLAIOS are still measured and reported **independently** — not combined or
averaged into one number (§4) — because that is honest measurement practice, not because they are
separately owned. They are all FREIGHT's.

**Access reality (§0.4-7):** the founder granted full access. Verified reach: this repo + all 9
admitted real repos (`freightos-control-plane`, `evco-portal`, `aguila-brain`, `throne-stack`,
`adjunto-integration-launch`, `clawdia-presence`, `beatvig`, `ayudasolares` — the last two confirmed
unrelated side projects) + Gmail/Calendar/GitHub MCPs + skills + Routines + Artifacts. Casa Zapata
(personal) remains out of scope only because the founder has not brought it in.

### §0.4 The inherited honesty laws (v1.4 H1–H10, kept in force)

1. **No self-declared 100.** A score is claimed only after its checks run green and the run is
   recorded in §5.4. This canon never rounds itself up.
2. **Simulation is labeled** (`SIM`, `DATOS DEMO`, `POR ACTIVAR`); never presented as live.
3. **Two-term reporting.** Scores are always *certifiable-here x/y · founder-side z/w*, never one
   bare merged number.
4. **Named gaps.** An unmet item scores 0 *with its name*; nothing is silently omitted.
5. **No prose counts.** Every number in a score report is reproducible by the command cited beside it.
6. **Exit-code honesty.** True unpiped exit codes; masking a red check is a BLOCKER finding.
7. **Honest data in product.** `DATOS DEMO` on illustrative figures; feeds show **EN VIVO** or
   **POR ACTIVAR**, never fake-connected; empty ≠ zero; missing ≠ error.
8. **The trust loop is sacred.** CRUZ/SuperTito/Adjunto *prepare*; the human *signs*. Nothing files,
   pays, or emails without an explicit GO, and every irreversible act has a visible cancel window.
   (The one named, logged exception: a non-consequential intake acknowledgment — §3 P1, no
   commitment/price/date content.)
9. **Fresh evidence.** A claim about live state cites a run at the current HEAD; stale evidence is
   re-run by machine, never hand-patched.
10. **Overrides are auditable.** Founder overrides and manual interventions are logged (§5.4), in place.
11. **Provenance evidence chain** (from the real control plane): a measured score cites its immutable
    rubric+scorecard commit, hashes, proof artifacts, and exact reproduction command — else it is stored
    *unverified, no numeric numerator*.
12. **No self-evidencing / no circular provenance.** A document cannot serve as its own evidence; canon
    Markdown does not embed its own commit/hash.
13. **Green CI ≠ authority.** Private CI passing is never merge/durability/canonical authority (only the
    registry + remote-main + byte-identical receipt is — §0.2a).

---

## §1 — GROUND TRUTH: THE REAL ESTATE (inventoried in / reachable from this environment)

The biggest defect of Masterplan v1.4 was that **none of it could run here** — it bound six twin repos
and a `receipts-v4/` store under `/mnt/agents/output/freight-twin/`, unreachable from this workspace.
This canon is denominated **only** over what is real and reachable here, and labels honestly what is
present-but-not-yet-connected.

### §1.1 This repository (`renatozapatabot-star/claude-code`, branch `claude/freight-os-optimization-6gn2qz`)

| Asset | What it is | Status / verify |
|---|---|---|
| `server.js` + `data/` | CRUZ zero-dep Node server: static + JSON API | EN VIVO — `npm run check` → exit 0 |
| `public/` | CRUZ app — white+red canon, bilingual ES/EN, trust loop, living globe, mobile field mode | EN VIVO — `npm start` → :4317 |
| `scripts/verify.mjs` | Headless-browser verification (desktop + 375px, console + overflow gates) | **EN VIVO** — playwright bootstrapped + wired to the sandbox chromium; `node scripts/verify.mjs` → `VERIFY: CLEAN` (19 shots, 0 console errors, 0 overflow @375) this session |
| `FREIGHT-OS-CANON.md` (this) + `scripts/canon-check.mjs` | The canon + its machine guard | EN VIVO — `npm run canon` → exit 0 |
| `FREIGHT-OS-PIPELINE.md` · `design/reference/THE-DECK.md` · `FREIGHT-GROWTH.md` | The P1/P6/P7 spec docs (authored this session) | EN VIVO — content-checked by `npm run canon` |
| `DESIGN.md` · `scripts/cruz-loop.md` · `DESIGN_LOG.md` | White+red design law · the 06:01 loop directive · the slice log | on disk (log entries dated 2026-06-30) |
| `design/reference/` | The real CRUZ.dc.html package: monolith app (~3,900 lines; exact `wc -l` = 3928), 13+ surfaces, `CRUZ-100-PLAN.md`, `CRUZ-MASTERPLAN-10.md`, component map, screenshots | on disk |
| `.claude/workflows/{cruz-100-critic,cruz-complete-frontend}.js` | Saved multi-agent routines; **invoked as Skills** (`Skill({skill:'cruz-100-critic'})`) | on disk / skill registry |
| The **06:01 CRUZ loop** | The daily self-improvement Routine described in `scripts/cruz-loop.md` | **POR ACTIVAR** — no trigger armed in this account; arm via [WO-10]/`create_trigger` |

### §1.2 The skills arsenal (installed capability, invocable from any session)

Each is an **installed skill**; its live legs (Supabase reads/writes, Telegram, WhatsApp) are
**POR ACTIVAR** until [WO-01] (DB) / [WO-03] (Telegram) land — a skill is called "working" only once its
end-to-end run is logged in §5.4. Mapped to pillars below; **general tooling** (`pdf`, `docx`, `xlsx`,
`pptx`, `loop`, `update-config`, `artifact-design`) is utility, not pillar-owned. `canon-check`'s
resource law asserts every non-utility skill appears in ≥1 §3 item or spec doc:

- **FREIGHT (OS) ops (P1/P6):** `email-ingestion`, `document-checklist-validator`,
  `compliance-alert-analyzer`, `crossing-intelligence`, `dispatch-coordinator`, `warehouse-tracker`,
  `anomaly-detector`, `demand-forecaster`, `cost-optimizer`, `rate-quote-generator`,
  `financial-summary`, `new-client-onboarding`, `portal-builder`, `usmca-certificate-generator`,
  `mve-compliance`, `oca-opinion`, `evco-audit-report`, `client-communication-writer`,
  `whisper-transcriber`.
- **CRUZ design/build (P4):** `cruz-build-intelligence`, `Skill({skill:'cruz-100-critic'})`,
  `Skill({skill:'cruz-complete-frontend'})`, `dataviz`, `artifact-design`.
- **Documents / meta:** `pdf`, `docx`, `xlsx`, `pptx`, `skill-creator`, `deep-research`,
  `operator-intel`, `loop`, `update-config`.

### §1.3 Connections and channels

- **Gmail MCP** (drafts; sends stay founder-signed §0.4-8) · **Google Calendar MCP** · **GitHub MCP**
  (this repo; more via [WO-07]) · **Routines/cron** · **Artifacts** · **Workflow engine** (the §5 review
  rounds).
- **Telegram:** **@supertitobot** (SuperTito — POR ACTIVAR, [WO-03]) · **@cruz_rz_bot** (CRUZ alert leg
  used by `anomaly-detector` / `crossing-intelligence`). The Deck (P6) unifies both.
- **Businesses under FREIGHT:** Renato Zapata & Co, Norfleet Logistics, other services.
- **Clients:** EVCO (Ursula Banda — primary; 6,917 tráficos, 97.8% with pedimento, real prod data),
  **MAFESA** (confirmed live 2nd tenant in `evco-portal` — 775 tráficos 100% pedimento coverage,
  98.3% docs, 100% suppliers, **$5.86M verified** — not previously in this canon's roster, added
  2026-07-30), Duratech, Milacron, Foam Supplies. **Ports:** Laredo/SOIA.
  **Growth surface:** the founder's LinkedIn network + the Adjunto/CRUZ sites and emails (P7).
- **Data layer:** the Supabase project the skills read/write (POR ACTIVAR from this session — [WO-01]).

  🚨 **URGENT — live SEV-1 tenant-isolation risk (found 2026-07-30, `evco-portal/EVCO-DEMO-READY-
  2026-05-15.md`):** the real portal's `scopedQuery` is **hardcoded to EVCO_CANDIDATES**; MAFESA's
  portal access needs proper `session.companyId`-based scoping and does not yet have it. The repo's
  own doc calls this a SEV-1 risk **"if a non-EVCO user logs in today."** Two real tenants, real
  financial data (~$5.86M+ verified), are exposed to this cross-tenant risk **right now**, not
  hypothetically. This is flagged here for the founder's immediate attention — it is not something
  this session should silently patch in a production client-data repo without explicit direction.

### §1.4 The inherited artifact — Masterplan v1.4 (historical annex)

**Survives as law:** the two-term scoring model (§4), honesty laws H1–H10 (§0.4), the fixpoint/review
meta-protocol (§5), and the WO-exactness bar (a work order fails if the founder must choose anything the
plan could pre-decide). **Re-grounded** (§2–§3): its 13 RES items, 10 ST items, 21 WO-F rows — each
mapped to an action that runs here, a SIM-HERE harness, or an exact WO with a live Prep-now. The v1.4
→ canon coverage map lives in §5.5 (so nothing is silently dropped). **Retired honestly:** its SHAs,
paths, suite counts, and receipts — unverifiable here, quoted only as history.

---

### §1.5 The real ecosystem repos (discovered + admitted 2026-07-19)

The v1.4 "twin repos" were not fiction — they are the founder's **real** private repos. Discovered via
`list_repos`; the core are admitted this session (`add_repo`):

| Repo | Role in FREIGHT | State |
|---|---|---|
| `freightos-control-plane` | The private **execution OS** control plane (canon/kernel/admission/evidence) | **admitted + cloned** `/workspace/freightos-control-plane` |
| `adjunto-integration-launch` | **Adjunto** — within FREIGHT, the public-facing brand/product | **admitted + cloned** `/workspace/adjunto-integration-launch` |
| `evco-portal` | **CRUZ** client portal (portal.renatozapata.com) — the REAL deployment | **admitted + cloned** `/workspace/evco-portal` |
| `aguila-brain` | The **CRUZ-scoped project vault** (customs domain notes, client material — per Throne's own two-vault decision record) | **admitted + cloned + populated** `/workspace/aguila-brain` → pushed `master` (was a stock empty Obsidian install) |
| `throne-stack` | **Clawdia / the Throne Mac Studio stack** — Docker+Tailscale+LiteLLM+Hermes runtime; carries its OWN separate ops vault at `throne-stack/vault/` (identity, decisions, playbooks — NOT client material) | **admitted + cloned** `/workspace/throne-stack` |
| `clawdia-presence` | Two things in one repo, both within FREIGHT: (1) **Clawdia's own personal-AI project** (`CANON.md`/`GOAL.md`/`BECOMING.md` — a Grok-native "falsifiable emergent-self" experiment, measured independently by its own single-user rubric, never merged into FREIGHT's other scorecards); (2) the **real FREIGHT operator cockpit** at `app/plaios/freight/` + `lib/freight-execution/` — this IS the Deck (P6, corrected above) | **admitted + cloned** `/workspace/clawdia-presence` |
| `beatvig` | Confirmed **unrelated** — a sports-betting +EV tool (day-0 stage) | admitted + cloned; **out of FREIGHT scope** |
| `ayudasolares` | Confirmed **unrelated** — an empty Next.js stub (solar-assistance concept, unbuilt) | admitted + cloned; **out of FREIGHT scope** |

This de-defers the plan hard: the pillars port against **real code**, not a twin. **Correction
(2026-07-19, after reading `throne-stack`):** `aguila-brain` is not a generic "everything" second
brain — Throne's own `2026-05-09-two-vault-model.md` decision record establishes it as the
**CRUZ-scoped** vault (project/client work, kept separate from Clawdia's operational vault
specifically so future MCP access can be scoped per-vault without exposing client material). This
session's population of `aguila-brain` (§P8) is compatible with that scoping for the Clients/CRUZ
content, but the FREIGHT/Adjunto overview notes added there should be treated as **bootstrap
cross-reference only** pending a founder call on where FREIGHT-wide notes belong (§0.4-8 boundary
law — flagged, not resolved, in [WO-15]-adjacent follow-up).

### §1.6 Control-plane ground truth (what the real FREIGHT execution OS actually is)

Extracted from `freightos-control-plane` (workflow `wf_6c83a7eb-f63`, 69 findings). The overlay defers
to these:

- **The goal — "Money Employment":** a freight-brokerage autonomy loop (kernel CLI `freight_execution.py`:
  `start-attempt · disposition · reconcile-export · money-employment · practice · coaching`). 100 =
  a `signed_authority.v2` receipt + 20 verified calls in shift 1 + 40/weekday avg + 200 unique verified
  calls in 14 days + one booked-and-covered load + one linked positive **Norfleet settlement deposit**
  + `operating_state=real_cash`. Control-plane snapshot (evidence_cutoff 2026-07-15): **0 verified
  calls, 0 cash.** Real automation schemas: `freight_load/rate/quote/proposal/carrier_score/
  dispatch_draft/guided_call/call_notes/cadence/tai_autofill/tai_entry/doc_fields/email_intake/
  memory_fact/adjunto_leads`. (The customs skills — mve/oca/pedimento/usmca/evco-audit — are
  **CRUZ/EVCO-scoped**, a distinct workflow *within* FREIGHT §0.3 — not merged into the freight-
  brokerage execution schemas above, but not a separate business either; both are FREIGHT's.)

  **Correction — the loop is LIVE (found in the founder's real Google Calendar, not a repo):** two
  recurring weekday **FREIGHT DIAL BLOCK** events run the Money-Employment loop operationally —
  **Block 1** (East-coast prime, ≤09:00 first dial, target 20 attempts) and **Block 2** (West
  late-AM/East PM, target 20 attempts; **tripwire**: if the day is under 20 attempts when Block 2
  starts, Block 2 alone must clear the 40/day floor). Each event's description names the real
  **cockpit**: `https://throne.tail5af2c9.ts.net:8443/plaios/freight` (PLAIOS's freight surface,
  Tailscale-private — unreachable from this sandbox, honestly noted). Protocol: cards arrive via a
  **06:30 daily brief email**; every disposition is logged in ≤60s (one keystroke); **"no build work
  during this block — the fleet builds, you dial."** This corrects the control-plane snapshot above:
  the 0/0 figure is a point-in-time cutover reading, not evidence the loop is idle — the operational
  rhythm is real and running. The true verified-calls/cash count is only knowable from the live
  cockpit (out of this sandbox's reach) or the founder's own report.

  **The real invocation chain (read directly from `clawdia-presence/lib/freight-execution/`,
  2026-07-30):** the Next.js cockpit's API routes never touch business logic directly — every
  action (`active-ticket`, `queue`, `start-attempt`, `disposition`, `void-attempt`, `events`,
  `practice`) spawns `python3 <kernel-script> --db <path> --authority-dir <path> --queue <path>
  <command>` (12s timeout, 1MB stdout cap, stderr never surfaced to the browser — customer data
  never risks reflection), reads exactly one JSON line back, and parses it against a strict
  `freight.execution-response.v1` envelope schema — anything else (multi-line, malformed, timeout)
  fails closed as `runtime_unavailable`. Paths resolve from `PLAIOS_ROOT` (default `~/plaios` on the
  Throne) — **this chain only runs on the real Throne machine; it cannot be exercised from this
  sandbox.** Runtime health is version-bound: `evaluateFreightRuntimeHealth` requires the release git
  SHA, expected build id, and actual build id to all match (40-hex `FULL_GIT_SHA` regex) before it
  reports `ok`, with auth boundary `tailnet_identity_plus_signed_session`. **Conclusion for "fastest
  path to first verified call": the mechanism is already built and running (the dial-block calendar
  rhythm above) — the fastest lever is not more engineering, it's the founder (or whoever holds the
  dial-block shift) actually working the queue** `lib/freight-execution` already serves.
- **The two-agent model:** **Claude Code = planner / judge / canon-keeper; Grok (grok-4.5) = executor**
  of sealed handoff packets (one per session, SHA-pinned, isolated worktree) + adversarial
  CONFIRMED/PLAUSIBLE second opinions. A **heartbeat** contract (`status:grok`, `check:heartbeat`,
  ≤20 min, fail-closed `HEARTBEAT_STALE/MISSING`) governs liveness; directives are never dropped
  (`blocked_on` instead).
- **The real recurring engine — Wave-0 custody/truth loop** (`everyday-wave0-cycle.mjs`): custody →
  durability → verification, driven by Grok sealed packets + heartbeat, over a **9-wave roadmap W0–W8**
  (W0 custody/truth · W1 first value circuits · W2 first collected cash · W3 durability · W4 Adjunto
  free-value · W5 complete private operator product · W6 corridor moat · W7 prepared-action agents ·
  W8 gated integrations). RoadmapItemV1 durability tiers: `volatile | local_commit | remote_commit`.
  (This is the real loop — distinct from the CRUZ 06:01 *design* loop, which is a CRUZ-only thing.)
- **PLAIOS** — a major subsystem: snapshot 10/10 but `claimed_100=false` pending an independent
  **elapsed-time** release receipt (12h soak + two post-cold boards 20h apart; time never simulated).
- **Admission is one-way + fail-closed:** two mandatory stages, **no writes until the founder
  physically approves** (`admission:dry-run` stdout-only → `admission:tranche-t1` review-only). Deny
  model bars runtime/customer/OAuth/bank/quotes/exports/agreements segments + `.db/.log/.key/.pem`
  etc. Committed content is gated by `staged-allowlist.json` (`check:staged` pre-commit,
  `check:range -- <BASE>` whole-diff + binary reject) with **secret-scanning** (GitHub tokens, PEM,
  Stripe live, `sb_secret_`, service_role JWTs).
- **State + backups:** private state root outside the repo (dirs 0700, files 0600; `events.db`,
  `privacy.db`; `state:init/check`); backup-promotion matrix + `check:b2-restore` (B2 offsite) +
  recovery-set — the real custody obligations v1.4 only simulated.
- **CI acceptance suite** (macOS-15, Node 22, Python 3.14, SQLite ≥3.51.3): `npm ci --ignore-scripts` →
  `npm test` → `run-tests-receipt` → `verify-freight-os-10-10-plan` → `check:plan --require-local-commit`
  → `pytest kernel/source/tests` → `check:range -- $BASE` → `git diff --check`.

## §2 — THE DE-DEFERRAL LAW (the founder's mandate, made law)

> Founder, 2026-07-19: *"Anything that defers the plan — find a way to continue."*

**Law:** No item may exist in a bare deferred state. Every item carries exactly one continuation state,
and two of the three begin executing without the founder:

- **`EXEC-NOW`** — executable here today, command named. (`EXEC-NOW*` = one documented one-command
  bootstrap first, e.g. `npm i -D playwright`; not a founder action.)
- **`SIM-HERE`** — a certified harness built in this repo proving the machinery end-to-end (labeled
  SIM); the real leg is then a thin swap, not a build.
- **`WO+PREP`** — terminal evidence genuinely needs the founder/real world. Then: an **exact work
  order** (steps · acceptance command · evidence sink) **plus a `Prep-now` that names a §3 item id**
  we execute now (draft the packet, build the harness, place the hold, pre-decide every choice) so the
  founder's action is a signature, never a project.

A deferral without a continuation state is a **BLOCKER** (`canon-check` hunts it: token blocklist +
every WO's Prep-now must cite a `[P#-W#-##]` executable home). Time itself is never simulated — its
WO+PREP arms the clock, drills, and logging now so the days merely have to pass.

### §2.1 The re-grounded work-order register (v1.4 WO-F-01..21 → WO-01..13)

- **[WO-01]** Supabase read-only DB atlas (absorbs v1.4 A-2, RES-02 custody) — **Founder:** grant a
  read-only Supabase role to one Claude session (or run `financial-summary` once and share output). —
  **Acceptance:** `DB-ATLAS.md` committed, citing the **read-only role name used** and the session's
  statement log showing **0 write ops** (structural, not honor-system). — **Prep-now:** [P5-W1-01]
  builds the atlas template + redaction rules + the read-only-role checklist so the session is
  mechanical. — **Evidence:** `DB-ATLAS.md`.
- **[WO-02]** Ratify this canon v2.2 (absorbs WO-F-14) — **Founder:** reply "ratified" (or amend —
  §0.1). — **Acceptance:** §5.4 gains the ratification row in the next commit. — **Prep-now:**
  [W0-01] delivers the canon to the founder this session. — **Evidence:** §5.4 row.
- **[WO-03]** SuperTito rail token (absorbs WO-F-10/17/19; handle **@supertitobot** ratified 2026-07-19)
  — **Founder:** place the @supertitobot token in the skills runtime secret store (never in git). —
  **Acceptance:** decision row in §5.4. — **Prep-now:** [P2-W2-01] builds the whole bot against a mock
  Telegram server so the token is the last mile. — **Evidence:** §5.4 row + P2 suite green.
- **[WO-04]** Escalation/batch + receipt-issuer policy values (absorbs WO-F-16/18, receipt-issuer model)
  — **Founder:** ratify the pre-decided defaults (escalation batch cap 25; alert dedup window 1h;
  receipt-issuer = the gateway process only, single authorized issuer) or set his own. — **Acceptance:**
  values recorded in `supertito/POLICY.md` with a test pinning them. — **Prep-now:** [P2-W2-03] writes
  the defaults + pinning test (founder signs, doesn't choose). — **Evidence:** `supertito/POLICY.md`.
- **[WO-05]** Adjunto billing law (absorbs WO-F-13 / RES-05) — **Founder:** adopt *full-price swap,
  never stack* (upgrade refunds the outgoing plan, charges the new at exact list price; no proration;
  every amount ∈ {0, 499, 999}). — **Acceptance:** *(leg a, signable now)* rule recorded in §5.4;
  *(leg b, gated on [WO-07])* encoded as tests in the Adjunto repo. — **Prep-now:** [P3-W2-01] writes
  the rule + 8-case test spec. — **Evidence:** §5.4 row + spec file.
- **[WO-06]** ADJUNTO-100 rubric admission (absorbs WO-F-21 / A-1) — **Founder:** upload the
  ADJUNTO-100-RUBRIC document. — **Acceptance:** rubric committed under `design/reference/` with 12
  named dimensions. — **Prep-now:** [P3-W2-02] drafts the 12-dimension rubric so the founder edits, not
  authors. — **Evidence:** committed rubric.
- **[WO-07]** Real-repo admission (absorbs WO-F-15/01) — the real repos are named in §1.5 and the core
  are **already admitted** this session (`freightos-control-plane`, `evco-portal`, `aguila-brain`
  cloned/added). — **Founder:** confirm scope for the remaining (`adjunto-integration-launch`,
  `throne-stack`, `clawdia-presence`, `beatvig`, `ayudasolares`) — one "add" each, or "all of them." —
  **Acceptance:** each repo cloned in-session; its pillar's §3 battery runs its real `npm` checks. —
  **Prep-now:** [P3-W3-01] and [P4-W4-01b] write every §3 battery repo-relative + this session already
  cloned the control plane and mapped its check surface. — **Evidence:** session log + battery output.
- **[WO-08]** MVE / compliance cadence (absorbs Taps 4–7 spirit) — **Founder:** approve the tentative
  calendar holds + the weekly Routine (MVE E2 verification — mandatory since 2026-03-31, penalties
  $4,790–$7,190 MXN/op; weekly EVCO audit; anomaly summary). — **Acceptance:** Routine armed; holds go
  live. — **Prep-now:** [P1-W2-01] places the tentative **POR ACTIVAR** calendar holds now and stages
  the first drafts; founder approval merely flips them live. — **Evidence:** Routine id + holds + §5.4.
- **[WO-09]** Licensed-authority packet (absorbs WO-F-04 Tap 3) — **Founder:** deliver the
  brokerage/agency authority packet before any *consequential automated* client send. — **Acceptance:**
  packet stored founder-side; §5.4 row. **Nothing waits on this** — every outbound is founder-signed
  (§0.4-8), so drafts flow now, sends stay human. — **Prep-now:** [P7-W2-02] makes every send one
  founder click. — **Evidence:** §5.4 row.
- **[WO-10]** The 7-day floor (absorbs WO-F-09 / G9-02 — irreducible time). The daily Routine is
  **already armed** (`trig_01CschhiJHbCoZkHtpufkUJ1`, daily 06:01 UTC, fresh session per fire — §5.4),
  so the clock is running now, honoring the §2 time-law. — **Founder:** ratify (or disarm) the running
  loop. — **Acceptance:** **7 consecutive daily loop commits with a `verify=CLEAN` (or, until the
  playwright bootstrap runs, `loop-ran + zero BLOCKER`) header** — the floor observes the **CRUZ 06:01
  loop's health**, independent of the real DB. — **Prep-now:** [P4-W1-01] hardens the log header
  (machine-readable, bound to `verify`'s real exit). — **Evidence:** `DESIGN_LOG.md` + git-log window + §5.4.
- **[WO-11]** Backup + custody of the data layer (absorbs WO-F-02/03, RES-02; *after [WO-01]*) —
  **Founder:** confirm Supabase PITR/backup schedule + snapshot location; keys stay in his vault, never
  in git. — **Acceptance:** `DB-ATLAS.md §Backups` filled with real RPO/RTO; restore rehearsed once
  (row-count + checksum identity). — **Prep-now:** [P5-W2-02] writes the restore-rehearsal runbook. —
  **Evidence:** atlas §Restore + rehearsal log.
- **[WO-12]** Calibration sitting (absorbs WO-F-11/12) — **Founder:** in one sitting confirm the CRUZ
  Embarques column set, the ops-dashboard KPI targets, and the portal rollout order (pre-decision:
  EVCO → Duratech → Milacron → Foam Supplies). — **Acceptance:** answers folded into `data/` + §5.4. —
  **Prep-now:** [P6-W1-02] ships concrete default KPI targets as `DATOS DEMO` so the sitting is
  edits-only. — **Evidence:** §5.4 row + data commit.
- **[WO-13]** The Throne (runtime host — absorbs WO-F-03) — the physical operating body is the **Throne
  Mac Studio** (repo `throne-stack`); the founder has granted it: *"the Throne studio is yours, all
  that's in it and all ever done in it — use it."* — **Founder:** confirm the Throne's Tailnet
  node/deploy target (host + `THRONE_TAILNET_SERVE`, Funnel OFF — v1.4 G4 law). — **Acceptance:** the
  Throne target recorded in §5.4; each pillar's deploy check runs against it. — **Prep-now:**
  [P2-W3-01]/[P4-W4-01b] write the deploy checks host-parameterized; `throne-stack` admitted via
  [WO-07]. — **Evidence:** §5.4 row.
- **[WO-14]** Second-brain admission (`aguila-brain`) — the founder: *"everything within the second
  brain lives under FREIGHT."* Repo **already admitted** this session. — **Founder:** confirm what the
  second brain may surface to whom (founder/father/employees/clients) via the Deck + @supertitobot. —
  **Acceptance:** the second-brain access matrix recorded in §5.4; [P8-W1-01] ingestion spec runs
  against real content. — **Prep-now:** [P8-W1-01] writes the ingestion + access-matrix spec now. —
  **Evidence:** §5.4 row + `SECOND-BRAIN.md`.
- **[WO-15]** SuperTito bot name — **CLOSED by founder instruction (2026-07-19):** *"It's
  @supertitobot — everything else should be deleted."* The existing Throne bot (`@clawdyia_rz_bot`,
  Hermes gateway) is renamed/repurposed to **@supertitobot**; no other name/bot for this rail. —
  **Founder:** (already given — the ruling above). — **Acceptance:** the Telegram bot handle at
  Throne reads `@supertitobot`; P2-W3-01 wires to it under that name only. — **Prep-now:**
  [P2-W3-01] — the `supertito/` package is channel-agnostic, so pointing it at the real bot is a
  config change, not a rebuild. —
  **Evidence:** §5.4 row (this instruction, logged verbatim).
- **[WO-16]** 🚨 **SEV-1 fix: MAFESA/EVCO cross-tenant scoping in `evco-portal`** — the real portal's
  `scopedQuery` is hardcoded to EVCO_CANDIDATES; MAFESA needs `session.companyId`-based scoping (the
  repo's own doc calls this SEV-1 "if a non-EVCO user logs in today" — real client data, ~$5.86M+
  verified value, exposed now). — **Founder:** confirm scope to admit `evco-portal` for a write-fix
  ([WO-07] already admits read access; this needs write/push authorization on that specific repo,
  since it holds live client data). — **Acceptance:** `scopedQuery` derives tenant strictly from
  `session.companyId` (never a hardcoded candidate list); a cross-tenant read/write test (EVCO
  session querying MAFESA data and vice versa) is added and passes denied. — **Prep-now:**
  [P4-W1-00] — this finding is fully diagnosed and located (`EVCO-DEMO-READY-2026-05-15.md` line
  113); the fix is scoped and ready to implement the moment write access is confirmed — no further
  investigation needed. — **Evidence:** commit in `evco-portal` + the cross-tenant test result.

- **[WO-17]** 🔍 **Real-bot integration gap, discovered by direct evidence (2026-07-30) —** a
  screenshot of the live `@supertitobot` Telegram thread shows the founder saying *"Now you do
  brother, I'm saying I'm giving you your own email"* and the real bot correctly, honestly replying:
  *"técnicamente no puedo recibir correos ni interactuar con sistemas externos; soy un modelo de
  lenguaje que vive aquí en este chat"* — confirming, from the live system itself, that the deployed
  bot has **zero backend tool-wiring today**: no Gmail access, no globalpc/Aduanet/econta access,
  nothing beyond a chat LLM in a Telegram thread. This is the real gap the Cortana ruling
  ([P2-W3-02]) and the inbox-ownership ruling ([P2-W2-04]) both need closed — this session's
  Gmail-MCP-backed triage is real but lives in *this Claude Code session*, not in the founder's actual
  phone bot. — **Founder:** authorize + supply the credentials/API surface for the live bot's backend
  to reach (a) Gmail API (service account or OAuth refresh token scoped to `ai@renatozapata.com`, so
  the bot process itself — not just this session — can read/triage/draft), (b) globalpc /
  `soportetrafico@globalpc.net` (Sistema de Tráfico access — read scope), (c) Aduanet (customs-crossing
  status — read scope), (d) econta (accounting/invoicing — read scope). — **Acceptance:** each granted
  system has a real credential wired into the bot's backend (not this session) and a live round-trip
  proving it (bot cites a real fact only obtainable via that system); each ungranted system stays
  named here, not silently dropped. — **Prep-now:** [P2-W2-04]'s `inbox-triage.mjs` + [P2-W3-02]'s
  channel-agnostic classify/rank shape are the receiving end, already built and tested — the only
  missing piece per system is the credential + a thin adapter translating that system's real
  data into the same `{id, dateMs, fromMe, subject, snippet}`-shaped input. — **Evidence:** the
  screenshot (logged §5.4) + wiring commits per system as they land.

*(v1.4 WO-F rows with no live obligation here — the ConnectUC/Callicity CDR export tap — are retired
with reason in §5.5, not silently dropped: no ConnectUC access exists in this estate; it re-enters as a
WO only if the founder brings that system under FREIGHT.)*

---

## §3 — THE FIVE-PLUS-TWO PILLARS · CLOSURE WAVES W0–W5

Wave law: every wave lands **green** before its commit; failing-check-first when fixing a defect; each
wave appends evidence to §5.4. Items within a wave are parallel-safe **unless a `depends:` note says
otherwise**. Item grammar: `[P<pillar>-W<wave>-<nn>]`.

### Pillar P1 — FREIGHT (OS): the operations core

**Corrected premise (§1.6):** FREIGHT's real core is the **Money-Employment freight-brokerage loop**
(call → quote → dispatch → TAI → reconcile → Norfleet cash), owned by the control-plane kernel;
this overlay's job is the *strategy/prep* layer around it. **`FREIGHT-OS-PIPELINE.md` documents the
EVCO/CRUZ customs-clearance pipeline** (mve/oca/pedimento/usmca/evco-audit) — a distinct workflow
*within* FREIGHT (§0.3: CRUZ is within FREIGHT, not isolated from it), kept as its own operational
map and measured on its own scorecard (§4), not folded into the Money-Employment core. The items
below serve that EVCO/CRUZ pipeline + the FREIGHT prep layer.

- **[P1-W1-01]** `EXEC-NOW` — **Ops pipeline map (DONE this session).** `FREIGHT-OS-PIPELINE.md`: the 8
  stages (intake→invoice) each naming skill + trigger + Supabase table, plus the USMCA-cert /
  demand-forecast / onboarding cross-cuts, the §Savings moat, and the §Trust-loop reconciliation
  (email-ingestion draft-only exception + dispatch GO-gate). — **Acceptance:** `npm run canon` greps
  the file for all 8 stage skills + a Supabase-table token per stage + the §Savings and §Trust-loop
  sections (fails if any missing). — **Evidence:** `FREIGHT-OS-PIPELINE.md`.
- **[P1-W1-02]** `EXEC-NOW*`([WO-01] for real data) — **Compliance battery.** Run
  `compliance-alert-analyzer`, `mve-compliance`, `evco-audit-report`; stage outputs as
  drafts/artifacts (nothing sends — §0.4-8). Each output **enumerates every active client with its E2
  status**; run pre-[WO-01] is marked `DATOS DEMO` and the E2-verified claim is explicitly gated on
  [WO-01]. — **Acceptance:** three staged outputs, each listing clients + E2 status + the DATOS-DEMO/
  real label. — **Evidence:** artifacts + Gmail drafts.
- **[P1-W1-03]** `EXEC-NOW` — **Onboarding runbook.** `new-client-onboarding` produces the RFC-verify +
  IMMEX-eligibility + Spanish service-agreement drafts for the next portal-rollout client (WO-12
  order), staged draft-only. — **Acceptance:** a draft packet for the next client staged. —
  **Evidence:** Gmail drafts / `clients`.
- **[P1-W2-01]** `WO+PREP`([WO-08]) — **Arm the compliance cadence.** Weekly Routine: EVCO audit + MVE
  check + anomaly summary → founder-reviewed drafts; tentative POR ACTIVAR calendar holds placed now. —
  **Acceptance:** Routine fires; holds present. — **Evidence:** Routine id + holds.
- **[P1-W2-02]** `EXEC-NOW` — **Savings ledger (documented intent → enforced hook).** The
  `FREIGHT-OS-PIPELINE.md §Savings` per-shipment checklist is the standing rule; enforcement lands with
  the real repo ([WO-07]) as a test that fails a completion report lacking a `cost-optimizer` savings
  figure. — **Acceptance:** `canon-check` confirms the §Savings checklist has ≥6 steps incl. the
  `saved_mxn/saved_usd` write. — **Evidence:** pipeline doc.
- **[P1-W3-01]** `SIM-HERE` then `WO+PREP`([WO-01],[WO-07]) — **Close the loop on data.** *Prep-now
  (SIM):* run one `DATOS DEMO` tráfico through the full [P1-W1-01] skill chain end-to-end here and
  commit the run log, so only the data source swaps when real access lands. *Real:* one live tráfico
  traced intake→archive. — **Acceptance:** the DEMO run log committed now; the real run log on [WO-01]/
  [WO-07]. — **Evidence:** run logs.

### Pillar P2 — The proactive rail: Clawdia (real) + SuperTito/Telegram (founder-directed)

**RESOLVED by founder instruction (2026-07-19, binding instantly per §0.1): "It's @supertitobot —
everything else should be deleted."** The bot is **`@supertitobot`**, full stop. (Ground truth: a
live Telegram bot already exists on Throne under the name `@clawdyia_rz_bot` — Hermes gateway,
principal-only allowlist, smoke-tested 2026-05-09. Per the founder's ruling, that naming is
superseded/renamed to `@supertitobot`; [WO-15] is closed by this instruction, no longer an open
question.) The `supertito/` harnesses below are channel-agnostic by construction, so pointing them at
the real bot is a naming/config change, not a rebuild — re-grounding v1.4's ST-1..ST-10 +
RES-01/03/04/07/08/10/11.

**FOUNDER RULING (binding instantly, 2026-07-30, §0.1): "I want SuperTito in charge of
`ai@renatozapata.com`."** This is a major scope grant: SuperTito becomes the **owner/operator of the
real intake inbox** — the same `ai@renatozapata.com` mailbox that `email-intake.js` already polls
every 15 minutes via Gmail OAuth (§1.6/P1, confirmed live). "In charge of" is read as: (1) **triage**
— every inbound mail is read, classified, and ranked (reusing the existing Sonnet-extraction
pipeline as the ingestion leg); (2) **surfacing** — urgent/actionable mail (a hot lead gone cold, a
compliance deadline, a client asking for status) is pushed to @supertitobot on the founder's phone,
ranked by the same value×urgency model as the Deck's alert rail (P6-W2-01); (3) **drafting** — a
reply is staged as a Gmail draft (exactly the pattern already proven this session with the Ursula
Banda thread) — **never sent** without the founder's GO (§0.4-8, unconditionally, no exception for
this grant). SuperTito does not gain send authority; it gains **read + triage + draft** authority
over the one mailbox. This is a new pillar item — see [P2-W2-04] below.

**`depends:` — P2-W2 items build one shared package sequentially (scoped
test dirs), not parallel.**

- **[P2-W2-01]** `SIM-HERE` ✅ **BUILT + GREEN this session** (`supertito/`, `npm test` → 16/16;
  `npm run score` → 8/8; `npm run bench` → PASS ratio 1.02). — **Core + mock rail + admission.**
  `supertito/` package: `bot.mjs` facade,
  `mock-telegram.mjs` chaos server (outage/slow/500/409 — v1.4 ST-2), sender-registry allowlist
  enforced before any answer/capture (ST-3/X3: byte-exact ids, spoof-resistant, oracle-free denial),
  never-drop alert queue (ST-2), and a **TTL boot-token with a TOCTOU-safe check-then-use** admission
  gate (RES-04). — **Acceptance:** `node --test supertito/test/core` green incl. spoof matrix, chaos
  matrix, and the boot-token expiry + race cases. — **Evidence:** `supertito/`.
- **[P2-W2-02]** `SIM-HERE` `depends:P2-W2-01` — **Truth + ledger + provenance.** Append-only
  HMAC-chained ledgers with tail anchor, **mirrored to a second independent trust domain** (RES-01),
  single-writer lock + verified-prefix cache (ST-5/X7, O(1) amortized append, external verifier still
  walks every line), content-addressed receipt store with verify-at-record AND at-utterance (ST-4/RES-03),
  an **emitter+manifest residue check** (RES-11), "not measured yet" vocabulary, ES/EN metric aliases +
  lang fallback + tenant-tagged briefs (ST-7/ST-8/X1/X2/X4). — **Acceptance:** `node --test
  supertito/test/ledger` green; `node supertito/scripts/bench-append.mjs --n 10000` within bounds. —
  **Evidence:** `supertito/` + bench output.
- **[P2-W2-03]** `SIM-HERE` `depends:P2-W2-02` — **Escalation + policy + scorer + gates.** Batch-capped
  oldest-first escalations with mirrored deferral trail (ST-6), `supertito/POLICY.md` (defaults per
  [WO-04], incl. receipt-issuer model), a **suite-composition gate** (RES-07: fails if the claimed test
  set is incomplete), a **known-failure triage registry** (RES-08: triaged-known vs new), an
  **environment spec pin** (RES-10: node/runtime/lockfile), `st-score.mjs` (ST-100-style scorer, `SIM`
  labels, residual list where **each residual names a WO-nn or §3 item id** — ST-9/ST-10). —
  **Acceptance:** `node --test supertito/test/escalation` green; scorer idempotent; residual entries
  each cite an id. — **Evidence:** `supertito/docs/st-score.json`.
- **[P2-W2-04]** `SIM-HERE` ✅ **BUILT + EXECUTED this session** — **Inbox ownership: SuperTito in
  charge of `ai@renatozapata.com`** (founder ruling above). `supertito/src/inbox-triage.mjs`:
  classifies inbound mail (stale-hot-lead / urgent-client / compliance-deadline / routine) and ranks
  by the same value×urgency model as P6's alert rail; **read + triage + draft authority only — never
  send** (§0.4-8, no exception). This session's Gmail MCP already proves read+draft access to this
  mailbox (the Ursula Banda draft, `r-4593963464206317792`, is the existence proof). — **Acceptance:**
  `node --test supertito/test/inbox` green; a real triage pass run this session against
  `ai@renatozapata.com`, findings + any drafts logged in §5.4. — **Evidence:** `supertito/` +
  §5.4 row(s).
- **[P2-W3-01]** `WO+PREP`([WO-03],[WO-13],[WO-17]) — **Go live on the real rail.** Swap mock for the
  real @supertitobot token (founder-held), roster = {Renato IV, Renato III, bot} exactly, real chat-ids
  bound; the suite still runs against the mock (token never enters CI); deploy check host-parameterized
  per [WO-13]. **Corrected by real evidence (2026-07-30, §5.4): "go live" is not just a token swap —
  the live bot has zero backend tool-wiring today (see [WO-17]); this item's acceptance now requires
  the [WO-17] wiring, not just a round-trip chat message.** — **Acceptance:** one real
  founder-initiated round-trip logged in the ledger, where the reply is produced by real tool-backed
  data (not the bare LLM's own words) at least once; suite green. — **Evidence:** ledger entry +
  [WO-17] wiring commit.
- **[P2-W3-02]** `WO+PREP`([WO-17]) — **The Cortana law — full-ecosystem observer, founder ruling
  2026-07-30 (§0.1, binding instantly): *"Not only should SuperTito be taking note of that but of all
  changes within globalpc to aduanet to econta to emails to everything he should be my fkn Cortana"*
  and *"I basically want it so he's copied on every thread doesn't answer but helps out the whole
  ecosystem."* This generalizes [P2-W2-04] (owner of one mailbox) into a standing law: SuperTito is
  **copied/subscribed as an observer on every real system in the estate** —
  `soportetrafico@globalpc.net` (Sistema de Tráfico automation), Aduanet (customs-crossing status),
  econta (accounting/invoicing), `ai@renatozapata.com` (already [P2-W2-04]), and any future system the
  founder brings in. Per-system rule, no exception: **observe → triage/classify → surface to the
  founder → draft if a reply is warranted. Never answers, never acts, never sends** (§0.4-8 applies
  ecosystem-wide, not just to the one mailbox — this is the strongest possible reading of "Cortana":
  omnipresent visibility, zero autonomous action). "Helps out the whole ecosystem" = cross-system
  correlation SuperTito alone can do (a compliance deadline in Aduanet + a stale invoice in econta +
  a client email in Gmail, connected into one surfaced brief) — this is additive value, not new
  authority. — **Acceptance:** a per-system access matrix recorded in §5.4 (what SuperTito can read,
  where, as of what date); for each system with real access, `node --test supertito/test/inbox` (or
  its per-system analogue) green and a real observed-and-surfaced pass logged; for each system without
  access yet, an explicit [WO-17] sub-row naming the credential/API the founder must supply — no
  system may sit in a bare "someday" state. — **Prep-now:** `inbox-triage.mjs`'s classify/rank/toAlert
  functions are already channel-agnostic (message-shaped input in, alert-shaped output out); the
  Gmail leg is done ([P2-W2-04]); the same shape is ready to receive globalpc/Aduanet/econta input the
  moment [WO-17] lands real access. — **Evidence:** §5.4 access-matrix row + `supertito/` per-system
  triage modules as they're wired.

### Pillar P3 — Adjunto

- **[P3-W2-01]** `EXEC-NOW` — **Billing law spec.** `design/reference/ADJUNTO-BILLING-LAW.md`: the
  full-price-swap rule ([WO-05]) + the 8-case test spec (upgrade nets list price; subscribe→upgrade→
  cancel nets 0; every amount ∈ {0,499,999}; randomized 200-op invariant; idempotent replay), each case
  with concrete inputs/expected. — **Acceptance:** `canon-check` confirms the file names 8 cases + the
  amount-set invariant. — **Evidence:** the spec file.
- **[P3-W2-02]** `EXEC-NOW` — **Rubric draft.** `design/reference/ADJUNTO-100-RUBRIC-DRAFT.md`: 12 named
  dimensions × measurable checks, drafted from v1.4's G6 evidence ([WO-06] prep). — **Acceptance:**
  `canon-check` confirms exactly 12 dimension headings. — **Evidence:** the draft.
- **[P3-W3-01]** `WO+PREP`([WO-07]) — **Port to the real repo.** Land the billing tests + rubric scorer
  + uniform invalid-credentials/equal-cost login pad (RES-06) + the **WebAuthn/passkey auth harness**
  (ST-1: real ceremony against a real WebAuthn library, SIM-labeled, wrong-challenge/counter-regression
  refused) in the actual Adjunto codebase. — **Acceptance:** that repo's suite green with the new
  tests. — **Evidence:** commits in the Adjunto repo.

### Pillar P4 — CRUZ: the client-facing OS (this repo)

Design law `DESIGN.md`; engine the 06:01 loop; roadmap `design/reference/CRUZ-100-PLAN.md`. **Visual
items are `EXEC-NOW*`** — one bootstrap `npm i -D playwright` makes `node scripts/verify.mjs` runnable
(it exits 1 until then; §1.1).

- **[P4-W1-00]** `WO+PREP`([WO-16]) — 🚨 **SEV-1 cross-tenant fix (highest priority in this pillar).**
  Fix `evco-portal`'s `scopedQuery` to derive tenant strictly from `session.companyId`, never a
  hardcoded EVCO candidate list; add a cross-tenant denial test (EVCO session querying MAFESA data,
  and reverse, both must be refused). — **Acceptance:** the cross-tenant test passes denied; no
  hardcoded tenant list remains in `scopedQuery`. — **Prep-now:** the defect is fully diagnosed and
  located (`EVCO-DEMO-READY-2026-05-15.md:113`) — this item IS the prep; only write access to
  `evco-portal` ([WO-07]/[WO-16]) is needed to execute the fix already scoped. — **Evidence:** commit
  in `evco-portal` + test result.
- **[P4-W1-01]** `EXEC-NOW` — **Harden the loop's evidence trail.** `DESIGN_LOG.md` entries gain a
  machine-readable header `<!-- LOG date=… slice=… verify=CLEAN|ISSUES -->` **written only from
  verify.mjs's actual exit line**; `scripts/cruz-loop.md` step 9 updated; `canon-check` (or CI) diffs
  the header verdict against the recorded VERIFY line for that commit, failing on mismatch (§0.4-6). —
  **Acceptance:** next log entry carries a bound header; the diff check passes. — **Evidence:**
  `DESIGN_LOG.md`.
- **[P4-W2-01]** `EXEC-NOW*`(loop) — **Agentic through-line.** Copilot formal state machine (Idle ·
  Watching · Working · Proposed · Awaiting-Signature · Shadow) wired to nav; confidence routes work.
  `verify.mjs` gains a DOM assertion that the copilot exposes each of the six named states (via a
  `data-state` attribute), failing if any is absent. — **Acceptance:** `verify.mjs` CLEAN with the
  six-state assertion green at desktop + 375px. — **Evidence:** shots + log entry.
- **[P4-W2-02]** `EXEC-NOW*`(loop) — **Pedimentos surface for real.** Clearance pipeline → signature
  gate. `verify.mjs` (or a `data/` unit test) regex-validates the rendered pedimento mask
  `DD AD PPPP SSSSSSS` and fracción `XXXX.XX.XX` and recomputes **IVA base = valor + DTA + IGI** from
  the displayed values, failing on mismatch. — **Acceptance:** the format + IVA assertions pass. —
  **Evidence:** shots + test + log entry.
- **[P4-W3-01]** `EXEC-NOW`(standing gate, active from the start of W2 despite its id) — **The two-part
  quality gate.** *Before* a slice: `cruz-build-intelligence` (the Five-Lens pre-build pass). *After* a
  slice: `Skill({skill:'cruz-100-critic'})` (adversarial score); BLOCKER/MAJOR fixed before commit.
  `operator-intel` runs weekly to scout new techniques/skills into the loop. Not a discrete deliverable
  — a standing gate on P4-W2 onward. — **Acceptance:** both critic + build-intelligence outputs attached
  to each substantial log entry. — **Evidence:** `DESIGN_LOG.md`.
- **[P4-W4-01a]** `EXEC-NOW*`(loop) — **Role worlds (buildable now).** Broker console / operator
  cockpit / client home per `CRUZ-100-PLAN.md`, mined from the .dc.html package via
  `Skill({skill:'cruz-complete-frontend'})`, built with `DATOS DEMO` defaults; the client home carries
  the `warehouse-tracker` "where is my shipment" panel. — **Acceptance:** three role homes `verify.mjs`
  CLEAN; mining output attached. — **Evidence:** shots + log entry.
- **[P4-W4-01b]** `WO+PREP`([WO-07],[WO-13]) — **Portal convergence.** Converge the role worlds with the
  real portal stack (`portal-builder`) at portal.renatozapata.com; parity checklist. — **Acceptance:**
  portal parity checklist written + verified against the deployed host. — **Evidence:** checklist.

### Pillar P5 — The data layer (Supabase system of record)

- **[P5-W1-01]** `EXEC-NOW` — **DB atlas template.** `DB-ATLAS.md`: expected tables (traficos, entradas,
  pedimentos, documents×61, clients, quotes, accounting), the RLS posture per table (tenant-scoped, no
  client-side service-role key — v1.4 G7), the **read-only-role checklist** for [WO-01], the
  backup/RPO-RTO section, and the redaction rule (structure yes, PII no). When the atlas/anomaly scan
  surfaces a repeatable gap, `skill-creator` drafts the closing skill + eval. — **Acceptance:**
  `canon-check` confirms the file enumerates the audit checklist + the read-only-role + backup
  sections. — **Evidence:** `DB-ATLAS.md`.
- **[P5-W2-01]** `WO+PREP`([WO-01]) — **Fill the atlas from the real DB.** Read-only session: real
  schema, row counts, index health, RLS verified per table (marked PROVEN/GAP), orphan/duplicate
  pedimento scan (`anomaly-detector` run once by hand); gaps become new §3 items (via `skill-creator`
  where a skill closes them). — **Acceptance:** atlas filled; every RLS row PROVEN/GAP. — **Evidence:**
  `DB-ATLAS.md` diff.
- **[P5-W2-02]** `EXEC-NOW` — **Restore rehearsal runbook.** The step-by-step Supabase restore/PITR
  rehearsal with the identity proof (row counts + checksums match) — [WO-11] prep. — **Acceptance:**
  `DB-ATLAS.md §Restore` present with the identity-proof steps. — **Evidence:** atlas §Restore.

### Pillar P6 — The Deck: Monitor 1 + Monitor 2 + phone (the north star)

Spec: `design/reference/THE-DECK.md` (authored this session). v1.4 G8 deck-check re-grounded.

**MAJOR CORRECTION (2026-07-30, from reading `clawdia-presence` directly — the actual cockpit
source):** the Deck is **not a from-scratch build.** It already exists, real and running, at
`clawdia-presence/app/plaios/freight/` — the exact host named in the founder's live calendar events
(`throne.tail5af2c9.ts.net:8443/plaios/freight`). Real panels on disk: `DialQueue`, `GuidedCallCard`,
`LeadFeed`, `NextBestAction`, `Scoreboard`, `DeskPnl`, `CarrierBench`, `LanePricer`, `MetersPanel`,
`CadenceSignals`, `CommandPalette`, `PhonePager`, `TVMode`, `EntityGraph`, `KeysStatus`, `TopTicker`,
plus a `closer/` and `film/` mode. The backing library `lib/freight-execution/` (in the same repo)
defines a real, richer action model than this canon assumed: actions `{call, email, linkedin,
whatsapp}` (not just phone calls), `operating_state ∈ {not_ready, ready_to_prospect, revoked}`,
authority-gated `reason_code`s (`authority_missing/invalid/not_effective/expired/revoked,
scope_denied, runtime_unavailable`), a formal disposition taxonomy (`connected, voicemail, no_answer,
wrong_number, not_interested, qualified, deferred`), and **bilingual (EN/ES) guided-call scripts**
with rebuttal handling (`DeskScriptBlock`: the_ask, trial_close, rebuttals, go_off_script_cue) — CRUZ's
bilingual law, independently reinvented here. `telegram-poll.ts` exists but is an **empty stub** — the
Telegram leg of freight execution is not yet wired (honest, not overclaimed). **This corrects
[P6-W2-02] below**, which as originally drafted would have built the freight-brokerage cockpit
*inside CRUZ's own EVCO-portal codebase* — a product-surface scoping mistake (CRUZ and the Deck are
distinct surfaces within the one FREIGHT umbrella, §0.3), not an ownership boundary. Fixed.

- **[P6-W1-01]** `EXEC-NOW` — **Deck layout spec (DONE this session).** `THE-DECK.md`: Monitor 1
  (cockpit: decision queue, tráficos/semáforo, anomaly strip, warehouse), Monitor 2 (comms, financial,
  compliance calendar, `demand-forecaster` volume forecast), phone (ranked alerts, tap-to-approve),
  §Alerts (unified rail). Every panel names a source skill + Supabase table + one of {EN VIVO,
  POR ACTIVAR}. — **Acceptance:** `npm run canon` asserts every panel row carries a skill + table +
  exactly one liveness label (fails otherwise). — **Evidence:** `THE-DECK.md`.
- **[P6-W1-02]** `EXEC-NOW` — **Default KPI targets (WO-12 prep).** Write concrete `DATOS DEMO` KPI
  defaults into `data/` (listos-para-firma SLA, transmitidos/día, contribuciones-MXN goal) so the
  [WO-12] sitting is edits-only. — **Acceptance:** `data/` carries the KPI defaults marked DATOS DEMO;
  `npm run check` green. — **Evidence:** `data/` commit.
- **[P6-W2-01]** `SIM-HERE` `depends:P2-W2-01` — **Alert-rail unification.** One ranked, deduplicated,
  never-drop alert model behind both bots (value×urgency), delivered to @supertitobot and mirrored to
  the Deck. Built + tested against the P2 mock server. — **Acceptance:** `node --test
  supertito/test/alerts` green (dedup window, ranking, never-drop). — **Evidence:** `supertito/` +
  `THE-DECK.md §Alerts`.
- **[P6-W2-02]** `WO+PREP`([WO-07]) — **Harden the real cockpit (corrected — not a CRUZ build).**
  The Deck's Monitor-1 cockpit is the real `clawdia-presence/app/plaios/freight/` surface (see
  correction above), not a new CRUZ page. This item is: audit its panels against the founder's
  actual dial-block protocol (20/block, 40/day tripwire, ≤60s disposition logging), close any gaps,
  and wire `telegram-poll.ts` (currently an empty stub) if/when [WO-15]'s @supertitobot decision
  extends to freight alerts specifically. — **Acceptance:** a panel-by-panel audit note committed
  against the real repo; `telegram-poll.ts` either implemented or explicitly deferred with a named
  reason. — **Prep-now:** the panel inventory above (this session) is the audit's starting point. —
  **Evidence:** audit note in `clawdia-presence` (via [WO-07] admission) or this repo's evidence/.
  *(The CRUZ Operator Cockpit `.dc.html` design mockup remains valid for **CRUZ's own** operator
  view — EVCO-scoped, one surface within FREIGHT, distinct from the freight-brokerage cockpit above
  but not separate from FREIGHT itself; see [P4-W4-01a].)*
- **[P6-W3-01]** `WO+PREP`([WO-03],[WO-10]) — **Red-day→phone latency proof.** With the real token,
  prove a boundary incident reaches the phone and a tap-approval lands a receipt; **measure** the
  latency (no fabricated <60s claim). — **Acceptance:** one real red-day drill logged with measured
  latency. — **Evidence:** ledger + §5.4.

### Pillar P7 — Growth: Adjunto + CRUZ as lead-gen for FREIGHT

Spec: `FREIGHT-GROWTH.md` (authored this session). Outreach is drafted, never auto-sent (§0.4-8).

- **[P7-W1-01]** `EXEC-NOW` — **Growth through-line spec (DONE this session).** `FREIGHT-GROWTH.md`: the
  6-stage through-line (each naming its artifact skill + channel + draft rule), §Proof (shareable
  artifact template), §Outreach (LinkedIn/email kit). — **Acceptance:** `npm run canon` confirms every
  stage names a skill + channel and the §Proof + §Outreach sections exist. — **Evidence:**
  `FREIGHT-GROWTH.md`.
- **[P7-W2-01]** `EXEC-NOW` — **Proof-artifact template.** Per `FREIGHT-GROWTH.md §Proof`: one sample
  "what FREIGHT saved" artifact generated (`cost-optimizer` + `financial-summary`, white+red,
  `DATOS DEMO`). — **Acceptance:** one sample artifact produced. — **Evidence:** the artifact.
- **[P7-W2-02]** `EXEC-NOW` — **LinkedIn/email outreach kit (draft-only).** `client-communication-writer`
  + Gmail drafts + `deep-research` stage a batch of personalized outreach drafts from the LinkedIn
  network; **zero auto-sends** ([WO-09] gates only consequential automated sends, already human). —
  **Acceptance:** a draft batch staged in Gmail; zero sends. — **Evidence:** Gmail drafts + §5.4.
- **[P7-W2-03]** `EXEC-NOW` — **Call follow-up rail.** `whisper-transcriber` on a client/prospect call
  recording extracts commitments and stages a `client-communication-writer` follow-up as a Gmail draft
  (draft-only). — **Acceptance:** one transcript → staged follow-up draft. — **Evidence:** Gmail draft.

### Pillar P8 — The Second Brain (`aguila-brain`)

The founder: *"everything within the computer / the second brain lives under FREIGHT,"* surfaced on the
fly to founder, father, employees, and clients via the Deck + @supertitobot. Repo admitted ([WO-14]).

- **[P8-W1-01]** `EXEC-NOW` ✅ **BUILT this session.** — **Second-brain spec + real vault seed.**
  `SECOND-BRAIN.md`: access matrix (founder/father full; employees role-scoped; clients
  tenant-scoped; §0.4-8 + G7 tenant law) + surfacing rail. **The real `aguila-brain` vault (was an
  empty default Obsidian install) was populated** with `01-AGUILA/{00-FREIGHT,01-Adjunto,02-CRUZ,
  03-Clients,04-Canon,05-Daily}` — real content pulled from `freightos-control-plane`'s
  `HANDOFF-MASTER.md`, committed + pushed to `aguila-brain@master`. — **Acceptance:** `npm run canon`
  confirms `SECOND-BRAIN.md`'s access matrix + user classes + surfacing rail; vault push verified
  (`git ls-remote` shows the commit on `master`). — **Evidence:** `SECOND-BRAIN.md` +
  `aguila-brain@master` commit `7908cae`.
- **[P8-W2-01]** `WO+PREP`([WO-14],[WO-07]) — **Index the real brain for query.** The vault now has
  real content (P8-W1-01); this item builds the search/embed index the Deck + bot actually query
  against — RLS/role-scoped. — **Acceptance:** a query against the real index returns a cited
  answer, role-scoped. — **Prep-now:** the vault structure (P8-W1-01) + the P2 bot query harness
  make the ingest a thin swap — only the embed/index layer remains. — **Evidence:** index + query log.

### Wave W0 (this session) — adoption

- **[W0-01]** `EXEC-NOW` — This canon written, fixpoint-reviewed (§5.4 log), guarded by
  `scripts/canon-check.mjs`, the three W1 spec docs authored, committed and pushed to
  `claude/freight-os-optimization-6gn2qz`, and delivered to the founder. — **Acceptance:**
  `npm run canon` → exit 0; `npm run check` → exit 0; push succeeds. — **Evidence:** this file + git log.

### Wave W5 — terminal sweep (the declaration, later)

- **[W5-01]** `WO+PREP`([WO-02],[WO-10]) — **Declaration.** When every §3 item is green or
  founder-signed: re-run every acceptance command at HEAD in one session, emit the two-term score (§4),
  log it in §5.4, and only then may the canon carry *CERTIFIABLE-HERE: x/x · FOUNDER-SIDE: y/y*. Never
  self-declared; the founder countersigns (his reply is the second audit leg). — **Acceptance:** the
  §5.4 declaration row with every command's exit code. — **Evidence:** §5.4.

### §3.9 Critical path (the binding schedule)

The longest chain to declaration, with the irreducible time constraint named:

Declaration time = **MAX(the 7-day floor, every enabling-grant chain)** — not the floor alone.

```
Time floor:  [WO-10] armed now (trig ...UJ1) → 7 ELAPSED REAL DAYS
Grant chains (each must also close for its pillar to be green/signed):
  [WO-01] DB access   → P5-W2-01, P1-W3-01(real leg)
  [WO-03] bot token   → P2-W3-01, P6-W3-01
  [WO-07] real repos  → P3-W3-01, P4-W4-01b
  [WO-13] prod hosts  → P2-W3-01, P4-W4-01b
Declaration W5-01 fires when: 7 days elapsed AND every grant above signed AND its pillar work green.
```

**The 7-real-day floor is the irreducible TIME constraint** (running now — [WO-10]); declaration
*additionally* requires every enabling-grant WO signed and its pillar work green (if a grant is never
given, that pillar never closes and declaration waits — honestly stated, not hidden). Everything
buildable here (all EXEC-NOW / SIM-HERE items, the W1 + Adjunto specs) is off the critical path and
proceeds immediately.

---

## §4 — SCORING LAW (independent scorecards WITHIN FREIGHT, never combined)

All of these are FREIGHT's (§0.3, founder ruling) — Adjunto, the execution core, PLAIOS, this
overlay's plan quality. **They are still measured and reported as four independent scorecards**, each
with its own rubric, denominator, and honest state, **never combined, averaged, or inferred from one
another** — that is honest-measurement discipline (the real `AGENTS.md`'s rule), not evidence of
separate ownership. Plus CRUZ, which by law carries **no numeric score** (v1.4 H3 — binary).

| System | Rubric / gate | Honest state (2026-07-19, quoted from the control plane) |
|---|---|---|
| **Adjunto** | its own 100-rubric | ~92.2 / 100 (its own measurement; never merged) |
| **F.R.E.I.G.H.T. — Money Employment** | verified calls + booked Norfleet loads + bank-settled cash + signed_authority.v2 | **Not achieved** — verified calls = 0, verified cash = 0, `operating_state ≠ real_cash` |
| **PLAIOS** | snapshot + elapsed-time release receipt | snapshot 10/10 but `claimed_100=false`, `release_qualified=false` (pending a 12h soak + post-cold boards, elapsed-time receipt — time never simulated) |
| **This strategic overlay** (plan quality) | the §5 fixpoint rubric (PQ-1..5 + RT lenses) | proposed; 2 fixpoint rounds run (2/42/11 → 1/26/17); not yet fixpoint-clean |
| **CRUZ** | binary, EVCO-only | no numeric score, by law |

**Provenance law (from the real repo):** a measured score must cite its immutable rubric+scorecard
commit, hashes, proof artifacts, and exact reproduction command — else it is stored **unverified with
no numeric numerator**. **A document cannot serve as its own evidence** (no circular provenance).
**Green private CI ≠ authority/durability.** No self-declared 100 at any level (§0.4-1).

**Honest headline today:** *This overlay is a proposed strategic plan, not a score. Adjunto ~92.2
(its own system); Money Employment 0/not-achieved; PLAIOS snapshot-green-but-not-release-qualified;
plan quality converging (2 rounds). Nothing combined. Nothing declared.*

---

## §5 — META: THE PLAN'S OWN 100/100 (fixpoint law + review log)

### §5.1 Review lenses (v1.4 §C-3, condensed)

**PQ-1 Coverage** · **PQ-2 Precision** · **PQ-3 Falsifiability** · **PQ-4 Honesty** · **PQ-5
Sequencing** · **RT-D Deferral hunt** (any item deferring without a §2 continuation = BLOCKER) ·
**RT-R Resource hunt** (any §1 resource no item uses = MAJOR).

### §5.2 Fixpoint rule

Rounds of adversarial review (parallel critics, one lens each) → fix wave → re-review. The loop stops
when **two consecutive rounds produce zero BLOCKER/MAJOR** and remaining MINORs are non-material polish,
or when a round moves nothing (no-noticeable-improvement, per the founder). Any material change re-opens
the loop at round 0. After fixpoint the canon is *maintained, not endlessly re-planned*.

### §5.3 Machine guard (`npm run canon` → `scripts/canon-check.mjs`)

Enforces: founder-override clause + CANON-META present · all item ids unique + well-formed · every item
carries Acceptance + Evidence + a continuation-state token · every WO carries Founder + Acceptance +
Prep-now, and **every WO's Prep-now cites a `[P#-W#-##]` executable home** · every WO+PREP item names a
`[WO-##]` · **content checks** on the spec files (pipeline: 8 stage skills + tables + §Savings +
§Trust-loop; deck: every panel row has skill + table + one liveness label; growth: stages + §Proof +
§Outreach) · a **lexical deferral scan** (bare-deferral tokens outside a continuation state fail) ·
every registered path exists. Exit 0/1.

### §5.4 Amendment + review log (add-only)

| Date | Round/Event | Result |
|---|---|---|
| 2026-07-19 | v2.0 drafted — supersedes v1.4; 21 WO-F → 12 live WOs; 5 pillars enumerated | draft |
| 2026-07-19 | v2.1 — founder message: FREIGHT reframed as umbrella OS; founder-operator **Renato Zapata IV** + co-principal **Renato Zapata III** (WO-F-14 **ratified**); **@supertitobot ratified**; added P6 The Deck + P7 Growth; portal.renatozapata.com recorded | amended |
| 2026-07-19 | **Fixpoint round 1** (7 lenses, parallel Opus critics) — 2 BLOCKER · 42 MAJOR · 11 MINOR | not clean |
| 2026-07-19 | **v2.2 fix wave** — honesty relabels (verify.mjs/06:01 loop/@supertitobot/portal → POR ACTIVAR; skills → installed-not-yet-live; CRUZ.dc.html 3928 lines; workflows → Skills); coverage restored (RES-01/04/07/08/10/11, ST-1 WebAuthn, receipt-issuer, runtime-host → [WO-13]); 6 unused skills wired (demand-forecaster, new-client-onboarding, usmca-cert, whisper-transcriber, skill-creator, cruz-complete-frontend); trust-loop gates (email-ingestion exception, dispatch GO-gate); de-deferral (P7-W2-02 → EXEC-NOW; P4-W4-01 split a/b; WO-08 calendar-holds prep; WO-10 resolved to loop-health floor; P1-W3-01 SIM prep; KPI defaults [P6-W1-02]); sequencing (P2-W2 sequential + scoped tests; WO-11 after WO-01; critical path §3.9; P4-W3-01 standing gate); **3 W1 spec docs authored + content-checked**; canon-check upgraded | amended |
| 2026-07-19 | **Fixpoint round 2** (7 Opus critics, evidence: workflow `wf_b92d0bda-97e`) — 1 BLOCKER · 26 MAJOR · 17 MINOR (down from 2/42/11) | not clean |
| 2026-07-19 | **06:01 loop armed** — Routine `trig_01CschhiJHbCoZkHtpufkUJ1` (daily 06:01 UTC, fresh session per fire, founder push-notified); the [WO-10] 7-day floor is running. Founder may disarm anytime (§0.1). | event |
| 2026-07-19 | **v2.3 fix wave** — BLOCKER resolved (loop armed → floor running, [WO-10] ratify/disarm); critical path = MAX(7-day floor, grant chains) incl. [WO-13] (§3.9); resource law made machine-true (utility bucket + canon-check skill-ownership pass; dataviz/cruz-build-intelligence/operator-intel/rate-quote-generator wired); 2 Adjunto specs authored + registered + content-checked (de-defers P3-W2); CANON-META status→proposed-awaiting-ratification; deck guard strengthened (skill+table+liveness per row). Remaining round-2 MINORs + narrower MAJORs catalogued for the next maintenance pass per the diminishing-returns clause (§5.2). | amended |
| 2026-07-19 | **REAL ECOSYSTEM DISCOVERED** — `list_repos` revealed the founder's actual private repos (not twins): `freightos-control-plane` (the private execution OS, carries its own canon/kernel/evidence — *"Adjunto is the sole public company; F.R.E.I.G.H.T. is the private execution OS; physical body = the Throne Mac Studio"*), `adjunto-integration-launch`, `evco-portal` (CRUZ), `aguila-brain` (second brain), `throne-stack` (Throne host), + clawdia-presence/beatvig/ayudasolares. Core repos **admitted this session** (`add_repo`); control plane cloned to `/workspace`. — *quoted description is discovery-time source language only; superseded 2026-07-30 — Adjunto is within FREIGHT, not a separate "company", per §0.3/v3.3 founder ruling* | discovery |
| 2026-07-19 | **v2.4** — entity model corrected to ground truth (§0.3); §0.2a reconciliation with the control-plane execution canon; §1.5 real-repo table; [WO-07] concretized to named real repos; [WO-13] = the Throne; **[WO-14] + Pillar P8 Second Brain** added (`aguila-brain`, `SECOND-BRAIN.md` authored + access matrix); founder absolute-override + "everything I say is binding" + bias-to-action laws encoded (§0.1/§0.1a) | amended |
| 2026-07-19 | **Control-plane truth sweep** (6 Opus readers, workflow `wf_6c83a7eb-f63`, 69 findings: 22 corrections, 31 additions, 16 reconciles) — evidence in the workflow journal | not clean |
| 2026-07-19 | **Executed, not just planned:** `supertito/` built + green (16/16 tests, bench PASS, score 8/8); playwright bootstrapped → `verify.mjs` CLEAN (19 shots); MVE action list for Ursula Banda authored; real `aguila-brain` vault (was empty) populated + pushed to `master`; all committed/pushed to `claude/freight-os-optimization-6gn2qz` | executed |
| 2026-07-19 | **Cloned + read `throne-stack`** (real Clawdia/Throne Mac Studio repo) — discovered a live, tested Telegram bot `@clawdyia_rz_bot` (Hermes gateway, principal-only, smoke-tested 2026-05-09) and Throne's own two-vault model (`aguila-brain` = CRUZ-scoped project vault; `throne-stack/vault/` = separate Clawdia ops vault) | discovery |
| 2026-07-19 | **FOUNDER RULING (binding instantly, §0.1): "It's @supertitobot — everything else should be deleted."** [WO-15] closed: the bot is `@supertitobot` (renamed from `@clawdyia_rz_bot`); no other name. P2 pillar + `supertito/POLICY.md` updated to match. | founder-override |
| 2026-07-30 | **Deep read of the real `evco-portal`** — a mature Next.js/Supabase/Anthropic-SDK/Vapi-voice product (not just a target host), tracking its own real 12-step clearance lifecycle in `PIPELINE.md`. Ground truth: **steps 1–3, 6–7 (Intake/Classify/Completeness+Sync/Review+Approval/Shadow-Intelligence) are already ✅ WORKING in production** — `email-intake.js` runs a real 15-min Sonnet-extraction cron on `ai@renatozapata.com` via Gmail OAuth. Steps 8–11 (Transmit/Crossing/Clearance/Invoice+Payment — the actual filing-to-cash chain) are the real gap, not intake. Corrected `FREIGHT-OS-PIPELINE.md`'s blanket "POR ACTIVAR" framing for stage 1 to reflect this. Named real operator **Tito** (`tito@renatozapata.com`, confirmed independently in real Gmail threads) and real license identity **Renato Zapata & Company · Patente 3596 · Aduana 240 · Est. 1941**. | corrected |
| 2026-07-30 | 🚨 **SEV-1 SECURITY FINDING — MAFESA/EVCO cross-tenant risk.** `evco-portal`'s `scopedQuery` is hardcoded to EVCO_CANDIDATES; MAFESA lacks `session.companyId`-based scoping. The repo's own `EVCO-DEMO-READY-2026-05-15.md` calls this SEV-1 "if a non-EVCO user logs in today." Real client data, ~$5.86M+ verified value, exposed **now**, not hypothetically. Logged as **[WO-16]** + **[P4-W1-00]** (fully diagnosed, fix scoped, awaiting founder write-access confirmation on `evco-portal` — this session has read-only access and will not silently patch live client-data code without explicit direction). Added **MAFESA** to the client roster (§0.3) — a real, previously-uncounted tenant. canon-check green (50 items, 16 WOs). | found |
| 2026-07-30 | **v3.3 FOUNDER RULING + ultracode unification enforcement.** Founder, in sequence, binding instantly: *"CRUZ is within FREIGHT"* → *"Everything exists within FREIGHT"* → *"Including SuperTito and everything."* Rewrote §0.3 as the reconciled entity model (FREIGHT = the one umbrella; CRUZ/Adjunto/SuperTito/Clawdia/Throne/second-brain/Deck all within it; the control-plane's "boundary-separate" language survives only as engineering discipline — independent scorecards, no shared DB — never as ownership separation). Ran a 4-lens parallel critic sweep (workflow, 11 contradictions found) hunting every remaining place in the document that still asserted separation; fixed all 11: the P1 pipeline intro, the §0.3 Clawdia bullet, the §1.5 clawdia-presence + adjunto-integration-launch rows, the P6 correction paragraph, §0.2a's kernel-deference list (entity/ownership model now explicitly carved out from kernel authority), §4's framing, and both affected §5.4 historical rows (superseded in place, add-only). `beatvig`/`ayudasolares` correctly remain "out of FREIGHT scope" — genuinely unrelated ventures, not covered by the ruling. canon-check green (48 items, 15 WOs). | founder-override |
| 2026-07-30 | **Deep read of `clawdia-presence`** (the repo `admission-policy.json` names as the source for FREIGHT's automation surface) — found it holds TWO things: Clawdia's own personal-AI project (its own rubric) AND the **real, already-built Deck cockpit** at `app/plaios/freight/` (16 real panels: DialQueue, GuidedCallCard, LeadFeed, NextBestAction, Scoreboard, DeskPnl, CarrierBench, etc.) + `lib/freight-execution/` (real contracts: multi-channel actions call/email/linkedin/whatsapp, authority-gated reason codes, bilingual EN/ES guided-call scripts). **Caught and fixed a real defect:** [P6-W2-02] as originally drafted would have built a FREIGHT cockpit inside CRUZ's own codebase — a product-surface scoping mistake. Corrected P6 pillar to reflect the real cockpit and repointed the item at auditing/hardening it via `clawdia-presence`, not building inside CRUZ. `telegram-poll.ts` confirmed an empty stub — honestly noted, not overclaimed. `beatvig`/`ayudasolares` confirmed unrelated side projects (sports-betting tool; empty solar-assistance stub), genuinely outside FREIGHT, not part of the ruling below. — *this row's original "out of FREIGHT scope" (Clawdia) / "entity-boundary violation, CRUZ is EVCO-only" phrasing superseded 2026-07-30 by the founder's ruling (§0.3/v3.3): both are within FREIGHT; the real issue was a codebase-scoping mistake, not an ownership boundary* | corrected |
| 2026-07-30 | **Magnify-glass sweep** — all 9 real repos admitted + cloned (`freightos-control-plane`, `aguila-brain`, `evco-portal`, `throne-stack`, `adjunto-integration-launch`, `clawdia-presence`, `beatvig`, `ayudasolares`) + Gmail/Calendar pulled into scope per founder directive ("pull EVERYTHING that is my work computer... everything you have access to"). Findings: (1) **the Money-Employment dial-block loop is LIVE** — recurring calendar events name the real cockpit `throne.tail5af2c9.ts.net:8443/plaios/freight`, 06:30 brief email, 40-attempts/day floor with tripwire — corrects the control-plane's static 0/0 snapshot (§1.6 amended); (2) **Adjunto is live at `adjunto.co`** (verified 200 on `/`, `/builder`, `/proof`, `/pricing`; `/trial/:name` pilot pattern; `/api/health/version` 404 = stale deployed build, honestly noted); (3) **Ursula Banda (EVCO) had an 18-day-stale hot lead** — asked 2026-07-29 for trial access after the founder's 2026-07-11 pitch, unanswered. **Action taken:** drafted (never sent, §0.4-8) a reply with the real `adjunto.co/trial/ursula` link, using the founder's own Mode-A outreach language — draft id `r-4593963464206317792`, awaiting founder review/send. | executed |
| 2026-07-19 | **v3.0 GROUND-TRUTH CORRECTION** — the earlier drafts inherited v1.4 fictions; corrected against the real `freightos-control-plane`: (1) entity model → boundary-preserving federation; Adjunto = sole public brand (own mint/navy canon), FREIGHT = private freight-brokerage OS (goal = Money Employment), CRUZ = EVCO-only + hard no-import boundary; (2) §4 → four independent never-combined scores (Adjunto ~92.2 · Money-Employment 0/not-achieved · PLAIOS snapshot-only · plan-quality); deleted the forbidden merged CANON-100; (3) §0.2a → this overlay has zero canonical standing, defers to `HANDOFF-MASTER.md` + the founder-override plan; (4) P2 → Clawdia is the real proactive surface, @supertitobot is founder-directed/aspirational; (5) added §1.6 (Money Employment, Grok two-agent model, heartbeat, Wave0–W8, PLAIOS, admission/allowlist/secret-scan, state-root 0700/0600, B2 backups, CI suite); (6) added provenance honesty laws §0.4-11..13 — **superseded 2026-07-30 by the founder's ruling (§0.3/v3.3): CRUZ, Adjunto, and everything listed here are within FREIGHT, one enterprise, one ownership; "federation"/"boundary-separate" survives only as retired engineering-discipline language, never as an ownership claim** | amended |
| 2026-07-30 | **Built + executed: SuperTito inbox ownership ([P2-W2-04]).** `supertito/src/inbox-triage.mjs` (classify/rank/toAlert, no send-capable export — denial test passing) + `supertito/test/inbox-triage.test.mjs` (8/8 green; full suite 24/24). Ran a **real triage pass** against `ai@renatozapata.com` via Gmail MCP (201 results, `newer_than:30d`): Ursula Banda confirmed the standout stale-hot-lead (draft already staged, §5.4 above); ~180/201 results are automated `soportetrafico@globalpc.net` Sistema-de-Tráfico noise (now labelled `SuperTito/Auto-Trafico`, label id `Label_2`, created this session); one Google security "new sign-in" alert on `ai@renatozapata.com` (2026-07-28) worth a founder glance; 2 spam/promo; real EVCO import-coordination threads correctly scored non-urgent. | executed |
| 2026-07-30 | **Real-evidence gap found + logged as [WO-17]: the live `@supertitobot` has zero backend tool-wiring.** Founder-supplied screenshot of the actual Telegram thread ("SuperTito Group") shows: founder says *"Now you do brother... I'm saying I'm giving you your own email"*; the real bot honestly replies it **cannot** receive email or reach external systems — *"soy un modelo de lenguaje que vive aquí en este chat"* — and asks for pasted text instead. This is direct, first-party proof that this session's Gmail-MCP-backed triage capability ([P2-W2-04]) is real but **session-local**, not yet wired into the founder's actual phone bot. Logged **[WO-17]** (founder to supply Gmail/globalpc/Aduanet/econta credentials for the bot's own backend) and **[P2-W3-02]** (the founder's follow-on "Cortana" ruling, see next row), both `WO+PREP` with the `inbox-triage.mjs` shape as the ready receiving end. `[P2-W3-01]` (go-live) corrected: a token swap alone does not satisfy it — real tool-backed replies do. | found |
| 2026-07-30 | **FOUNDER RULING (binding instantly, §0.1) — the Cortana law, [P2-W3-02]:** *"Not only should SuperTito be taking note of that but of all changes within globalpc to aduanet to econta to emails to everything he should be my fkn Cortana"* and *"I basically want it so he's copied on every thread doesn't answer but helps out the whole ecosystem."* Generalizes [P2-W2-04] (one mailbox) into a standing ecosystem-wide law: SuperTito is copied/subscribed as an **observer** on every real system (globalpc, Aduanet, econta, all email, and future systems) — observe → triage → surface → draft-if-warranted, **never answers, never sends, never acts** (§0.4-8 extended ecosystem-wide, no exception). Cross-system correlation is the added value ("helps out the whole ecosystem"), not new authority. v3.5: added [WO-17] + [P2-W3-02], corrected [P2-W3-01]'s acceptance bar, this review-log entry. canon-check green. | founder-override |

### §5.5 v1.4 → canon coverage map (nothing silently dropped)

RES-01→P2-W2-02 · RES-02→[WO-01]/[WO-11] · RES-03/ST-4→P2-W2-02 · RES-04→P2-W2-01 · RES-05→[WO-05]/P3-W2-01 ·
RES-06→P3-W3-01 · RES-07→P2-W2-03 · RES-08→P2-W2-03 · RES-09→P4-W1-01(loop health)/P6-W3-01 · RES-10→P2-W2-03 ·
RES-11→P2-W2-02 · RES-12→P2-W2-02(lock) · RES-13→W5-01(freshness) · ST-1→P3-W3-01 · ST-2→P2-W2-01 ·
ST-3→P2-W2-01 · ST-5→P2-W2-02 · ST-6→P2-W2-03 · ST-7/8→P2-W2-02 · ST-9/10→P2-W2-03 · receipt-issuer→[WO-04] ·
runtime-host→[WO-13] · ConnectUC export→**retired** (no such system in this estate; re-enters as a WO only
if the founder brings it under FREIGHT) · WebAuthn hardware ceremony / 7-real-day floor / real-repo ports →
[WO-09]/[WO-10]/[WO-07] (irreducibly founder-side, each with a live Prep-now).

<!-- CANON-PATHS
server.js
package.json
public/index.html
public/app.js
public/styles.css
data/embarques.js
data/cruz.js
scripts/verify.mjs
scripts/cruz-loop.md
DESIGN.md
DESIGN_LOG.md
README.md
FREIGHT-OS-PIPELINE.md
FREIGHT-GROWTH.md
SECOND-BRAIN.md
design/reference/THE-DECK.md
design/reference/ADJUNTO-BILLING-LAW.md
design/reference/ADJUNTO-100-RUBRIC-DRAFT.md
design/reference/CRUZ-100-PLAN.md
design/reference/CRUZ-MASTERPLAN-10.md
design/reference/CRUZ.dc.html
.claude/workflows/cruz-100-critic.js
.claude/workflows/cruz-complete-frontend.js
supertito/src/ledger.mjs
supertito/src/receipt-store.mjs
supertito/src/sender-registry.mjs
supertito/src/bot.mjs
supertito/test/supertito.test.mjs
supertito/POLICY.md
-->

<!-- CANON-CONTENT
pipeline:FREIGHT-OS-PIPELINE.md:email-ingestion,document-checklist-validator,oca-opinion,cost-optimizer,compliance-alert-analyzer,crossing-intelligence,dispatch-coordinator,warehouse-tracker,financial-summary,usmca-certificate-generator,demand-forecaster,new-client-onboarding,rate-quote-generator,Supabase,§Savings,§Trust-loop
deck:design/reference/THE-DECK.md:§Alerts,§Charts,demand-forecaster,warehouse-tracker,anomaly-detector,dataviz,@supertitobot
growth:FREIGHT-GROWTH.md:§Proof,§Outreach,client-communication-writer,whisper-transcriber,new-client-onboarding,cost-optimizer,rate-quote-generator,dataviz,deep-research
billing:design/reference/ADJUNTO-BILLING-LAW.md:full-price,InvalidPrice,idempotent,arbitrage,The 8 test cases,amount-set invariant
rubric:design/reference/ADJUNTO-100-RUBRIC-DRAFT.md:Dimension 1,Dimension 12,named gaps,Never self-declared
brain:SECOND-BRAIN.md:access matrix,Founder,Father,Employees,Clients,surfacing rail,@supertitobot
-->
