# FREIGHT (OS) — PROJECT STATUS / RECOVERY DOCUMENT

<!-- STATUS-DOC v1 — written 2026-07-30, standalone, self-contained. If you are a fresh Claude
     session (or the founder himself) reading this cold — after a rate-limit cutoff, a new session,
     or a long gap — this file alone tells you everything: what's real, what's built, what's blocked,
     and exactly what commands to run to confirm nothing has drifted. -->

**Read this first if you're picking this up cold.** The canonical law lives in
`FREIGHT-OS-CANON.md` (currently **v3.6**, founder-override supremacy, 53 items / 17 WOs, machine-checked
by `node scripts/canon-check.mjs`). This document is a *status snapshot*, not the law — it exists so
nothing is lost to a session cutoff or context compaction. Everything here is independently verifiable
by running the commands in **§Verification Playbook** below.

**Repo:** `renatozapatabot-star/claude-code` · **Branch:** `claude/freight-os-optimization-6gn2qz` ·
**Latest commit as of writing:** `cac0199` ("v3.6: ultracode power-build — 5 real artifacts,
adversarially verified") · pushed and live on `origin`.

---

## 1. What this project actually is

The founder (**Renato Zapata IV**, co-principal **Renato Zapata III**) runs a real customs-brokerage
business — **Renato Zapata & Company · Patente 3596 · Aduana 240 · Est. 1941** — and is building
**FREIGHT** as the one umbrella covering everything: the private freight-brokerage execution OS (goal:
"Money Employment" — verified cold calls → booked Norfleet loads → bank-settled cash), **CRUZ** (the
EVCO/MAFESA customs-clearance portal, real product at `evco-portal`), **Adjunto** (the public product at
`adjunto.co`), **SuperTito** (the founder's own AI, Telegram `@supertitobot` + this session's real
Gmail-backed capabilities), **Clawdia** (proactive presence + hosts the real "Deck" cockpit), **The
Throne** (the physical Mac Studio host), and the **second brain** (`aguila-brain` Obsidian vault). This
repo (`claude-code`) is the **strategy/canon/prep layer** — it does not replace the real product repos,
it documents ground truth about them, stages prep work, and executes whatever is genuinely buildable
here without live credentials it doesn't have.

## 2. The constitution — binding founder rulings (verbatim, add-only, never revoked)

These are law per `FREIGHT-OS-CANON.md` §0.1 ("Founder Override") — quoted exactly, with the date they
were given, because they govern every decision in this repo:

1. **2026-07-19:** *"REMEMBER THE WHOLE GOAL IS TO MAKE FREIGHT (OS)... using all my resources... make
   it into the best possible plan and make it canonical law MD founder override... Anything that defers
   the plan find a way to continue."* → the **De-Deferral Law** (canon §2): no item may sit in a bare
   "deferred" state; every item is EXEC-NOW, SIM-HERE, or WO+PREP (a founder-ask *plus* real prep work
   that starts immediately).
2. **2026-07-19:** *"Per me, everything I say is binding"* + *"I'm the fkn founder if it doesn't help me
   eliminate it"* → §0.1/§0.1a: every founder instruction is canon the instant it's given; no
   process-restraint for its own sake. **Only two hard limits survive, unconditionally:** (a) never
   fabricate data, (b) never send/dispatch anything irreversible to a client/third party without an
   explicit founder GO.
3. **2026-07-19:** *"It's @supertitobot — everything else should be deleted."* → [WO-15] **closed**: the
   bot is `@supertitobot`, full stop (renamed from the real `@clawdyia_rz_bot` on the Throne).
4. **2026-07-19 → 2026-07-30, in sequence:** *"CRUZ is within freight"* → *"Everything exists within
   freight"* → *"Including SuperTito and everything, use ultracode to make sure this happens
   perfectly"* → §0.3 rewritten: **FREIGHT is the one true umbrella.** Everything (CRUZ, Adjunto,
   SuperTito, Clawdia, Throne, second brain, Deck) exists within it, one ownership. The old
   "boundary-preserving federation" framing survives only as engineering discipline (independent
   scorecards), never as an ownership claim.
5. **2026-07-30:** *"I want SuperTito in charge of ai@renatozapata.com."* → [P2-W2-04]: SuperTito owns
   **read + triage + draft** authority over the real intake mailbox — **never send**, no exception.
6. **2026-07-30:** *"Not only should SuperTito be taking note of that but of all changes within globalpc
   to aduanet to econta to emails to everything he should be my fkn Cortana"* + *"I basically want it so
   he's copied on every thread doesn't answer but helps out the whole ecosystem"* → [P2-W3-02], **the
   Cortana law**: SuperTito observes every real system in the estate, correlates across them, surfaces
   to the founder — **never answers, never acts, never sends**, ecosystem-wide, no exception.
7. **2026-07-30:** *"Founder absolutely fkn override on everything btw"* / *"Founder override on
   everything"* — reaffirms #2 as standing, continuous law, not a one-time grant.
8. **2026-07-30:** *"Make this the most ambitious thing ever and document everything in case I rate
   limit"* — this document is the direct response to that instruction.

**The two hard limits (③b above) have held throughout, with concrete proof:** the SEV-1 EVCO/MAFESA fix
is staged as a patch file, never applied to the live repo without write-access confirmation. The Ursula
Banda outreach is a staged Gmail draft, never sent. SuperTito's every capability built this session
(inbox-triage, correlate, system-adapters) has an explicit denial test proving no send-capable export
exists.

## 3. WO register — every founder-ask, current state

| WO | Ask | Status |
|---|---|---|
| WO-01 | Supabase read-only DB atlas/credentials | **OPEN** — founder to grant |
| WO-02 | Ratify canon v2.2+ | **OPEN** (canon has iterated since; re-ratification implicit via continued founder engagement) |
| WO-03 | Real @supertitobot token | **OPEN** — founder-held |
| WO-04 | Escalation/receipt-issuer policy values | **OPEN** |
| WO-05 | Adjunto billing law adoption | **RESOLVED** (full-price-swap rule adopted; now *implemented* — see §5) |
| WO-06 | ADJUNTO-100 rubric admission | **OPEN** |
| WO-07 | Real-repo admission | **DONE** — all 9 real repos admitted + cloned to `/workspace` |
| WO-08 | MVE/compliance cadence approval | **OPEN** |
| WO-09 | Licensed-authority packet | **OPEN** |
| WO-10 | The 7-day floor | **ARMED** — Routine `trig_01CschhiJHbCoZkHtpufkUJ1`, daily 06:01 UTC, running |
| WO-11 | Backup/custody of data layer | **OPEN** (blocked on WO-01) |
| WO-12 | Calibration sitting (KPIs, rollout order) | **OPEN** |
| WO-13 | The Throne (runtime host confirmation) | **OPEN** |
| WO-14 | Second-brain admission (`aguila-brain`) | **DONE** — admitted, populated, pushed |
| WO-15 | SuperTito bot name | **CLOSED** — `@supertitobot`, founder-ruled 2026-07-19 |
| WO-16 | 🚨 SEV-1 MAFESA/EVCO cross-tenant fix, write access | **OPEN** — fix is a verified, ready-to-apply patch (`evidence/evco-cross-tenant-fix.patch`); `evco-portal` untouched, awaiting founder write-access confirmation |
| WO-17 | Real credentials: Gmail-for-the-bot, globalpc, Aduanet, econta | **OPEN** — shape-adapters + correlation engine built and tested; only credentials are missing |

**Bottom line: nothing has been silently dropped. Every open WO has a named founder-ask AND real prep
work already done in the meantime** (per the De-Deferral Law). This is enforced mechanically — `node
scripts/canon-check.mjs` fails the build if any WO is missing a `Prep-now` citing a real, built item.

## 4. Pillar status (P1–P8)

| Pillar | What it is | Real status |
|---|---|---|
| **P1** FREIGHT OS core | Money-Employment loop (control-plane-owned) + EVCO/CRUZ pipeline (this repo's map) | Pipeline mapped (`FREIGHT-OS-PIPELINE.md`); real intake (`email-intake.js`) confirmed **already WORKING** in production on `ai@renatozapata.com`; Money-Employment dial-block loop confirmed **LIVE** via real calendar events |
| **P2** SuperTito/Clawdia proactive rail | Inbox ownership + Cortana ecosystem law | `supertito/` package: 39/39 tests green. Real triage pass run against `ai@renatozapata.com` (201 threads). Cross-system correlation engine built + tested. Real bot (`@supertitobot`) confirmed to have **zero backend wiring today** (WO-17) — this session's capabilities are real but session-local until credentials land |
| **P3** Adjunto | Public product at `adjunto.co` | Verified live (200s on `/`, `/builder`, `/proof`, `/pricing`). Billing law now a real, tested pure-function ledger (10/10), ready to port |
| **P4** CRUZ | EVCO/MAFESA client-facing portal (`evco-portal`) | 🚨 SEV-1 cross-tenant bug found, diagnosed, and a verified patch staged (not applied — needs write access) |
| **P5** Data layer | Supabase | Blocked entirely on WO-01 (no credentials yet) |
| **P6** The Deck | Money-Employment cockpit, real code in `clawdia-presence/app/plaios/freight/` | Confirmed real (16 panels, authority-gated multi-channel contracts, bilingual EN/ES scripts). `scripts/audit-deck.mjs` makes this claim falsifiable/re-checkable forever — currently PASS |
| **P7** Growth | Adjunto/FREIGHT growth mechanics | Spec authored (`FREIGHT-GROWTH.md`); not yet built out this round |
| **P8** Second brain | `aguila-brain` Obsidian vault | Admitted, was empty, now populated + pushed to its own `master` branch |

## 5. Everything built + tested this session (exact files, exact commands)

All of the below are **real, running Node.js code with real `node:test` suites**, independently
re-verified by this session after being built (not just trusted from an agent report):

| File | Purpose | Test command | Result |
|---|---|---|---|
| `supertito/src/inbox-triage.mjs` + test | Classify/rank/alert real Gmail threads (read+triage+draft only) | `node --test supertito/test/inbox-triage.test.mjs` | 8/8 |
| `supertito/src/correlate.mjs` + test | Cortana law's cross-system correlation engine | `node --test supertito/test/correlate.test.mjs` | 6/6 |
| `supertito/src/system-adapters.mjs` + test | WO-17 shape-conversion (globalpc/Aduanet/econta → canonical input) | `node --test supertito/test/system-adapters.test.mjs` | 9/9 |
| `design/reference/adjunto-billing.mjs` + test | Adjunto billing law, real pure ledger | `node --test design/reference/adjunto-billing.test.mjs` | 10/10 |
| `evidence/evco-cross-tenant-fix.patch` + `.test.ts` | SEV-1 fix, staged as a verified git-apply-clean patch (NOT applied to evco-portal) | `git apply --check` against a scratch copy of the real file (verified 2026-07-30) | applies cleanly |
| `scripts/audit-deck.mjs` | Falsifiable check of the canon's Deck claims against real `clawdia-presence` source | `node scripts/audit-deck.mjs` | PASS (4/4 claims), negative-control-verified |
| `scripts/canon-check.mjs` | The canon's own structural/content law | `node scripts/canon-check.mjs` | PASS — 53 items, 17 WOs |
| **Whole supertito suite** | everything above + pre-existing core/ledger/escalation | `node --test supertito/test/*.test.mjs` | **39/39** |
| **Repo code sanity** | `server.js` + `data/embarques.js` syntax | `npm run check` | green |

## 6. Verification playbook (run these to confirm nothing has drifted)

```bash
cd /home/user/claude-code
node scripts/canon-check.mjs                          # canon structural law — expect PASS, 53 items, 17 WOs
npm run check                                          # repo code sanity — expect green
node --test supertito/test/*.test.mjs                  # SuperTito full suite — expect 39/39
node --test design/reference/adjunto-billing.test.mjs  # Adjunto billing law — expect 10/10
node scripts/audit-deck.mjs                            # Deck claims vs real source — expect PASS
git log --oneline -5                                   # confirm you're at or past cac0199
git status --porcelain                                 # should be clean if nothing new is in flight
```

If any of these fail, something has drifted from this snapshot — treat that as the first thing to
investigate before trusting anything else in this document.

## 7. Hard laws that must survive any session gap (do not relax these)

1. **Never fabricate data.** Every SIM/fixture value in this repo is explicitly labeled as such in a
   comment. If real access doesn't exist, say so — don't invent output.
2. **Never send/dispatch/auto-reply anything.** SuperTito/the AI reads, triages, and drafts — it never
   sends without an explicit founder GO. This is tested (denial tests exist on every SuperTito module).
3. **Never write to the real external repos** (`evco-portal`, `clawdia-presence`, `adjunto-integration-launch`,
   `throne-stack`, `aguila-brain` after its initial population, `freightos-control-plane`) without
   explicit founder write-access confirmation for that specific repo. Everything built against them this
   session is staged in *this* repo (`evidence/`, `design/reference/`) instead.
4. **This overlay canon has zero canonical standing over `freightos-control-plane/canon/HANDOFF-MASTER.md`**
   except on the entity/ownership model, which is the founder's alone to rule on (§0.2a).
5. **The founder's word is instantly binding** the moment he says it, in any channel — encode it into
   the canon in the same session if at all possible, add-only, never silently overwritten.

## 8. If you're a fresh session with no memory of any of this

Read, in order: (1) this file, (2) `FREIGHT-OS-CANON.md` §0 (the constitution) and §2 (the WO
register), (3) run the verification playbook above, (4) check `git log` for anything committed after
`cac0199` that this document doesn't yet describe. Then pick up wherever the open WOs and the founder's
most recent message point.
