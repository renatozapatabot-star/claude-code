# What to ask Claude Code — the push to 10/10
Copy these as discrete tasks. They're ordered; each has a built-in acceptance test so "done" is provable, not asserted. Point Claude Code at `CRUZ.dc.html` (the app) + the four spec-grade surfaces (`CRUZ Approval Gate/Accuracy/Autonomy/Opportunities.dc.html`) + `CRUZ-10-PLAN-vs-SPEC.md`.

---

## Prompt 1 — P0: put every screen on the two-register spine
"`CRUZ.dc.html` already exposes a semantic token spine in `:root` (`--surface`, `--surface-raised`, `--surface-sunken`, `--text-strong`, `--text`, `--text-muted`, `--accent`, `--accent-solid`, `--success/--warning/--danger` + `-bg`/`-line`, `--border`, `--focus`) that matches the four standalone surfaces. Convert every inline style in the app from the legacy tokens (`--ink`, `--ink2`, `--muted`, `--cyan-ink`, `--line`, `--surface2`, raw hex) to the semantic names. Then add a `[data-register="terminal"]` dark re-alias block and render the broker/operator views with `data-register="terminal"`, client views with `data-register="almanac"`. **Acceptance:** grep shows zero raw hex and zero legacy-token refs in component markup; toggling `data-register` on the shell flips the whole app between light/dark with no contrast failures."

## Prompt 2 — P4: four states on every data component
"Every data component must ship all four states: populated · honest-empty (icon + 'not synced yet — fills in as your operation runs' + the unblocking action; never blank, never fake-zero) · loading (skeleton matching the shape) · error (recoverable + retry). The app has a global Simulate harness — replace it with per-component state so each table/card/KPI renders its own four states. **Acceptance:** every list/table/KPI can be forced into each of the four states and renders correctly; no component shows a bare 0 when data is absent."

## Prompt 3 — P5: domain-correctness audit (license-protecting)
"Audit every screen against §9 of the spec: pedimento `DD AD PPPP SSSSSSS` stored/displayed WITH spaces as text (canonical `26 24 3596 6500441`); fracción `XXXX.XX.XX` (+NICO); every money field labeled MXN/USD; **IVA base = customs value + IGI + DTA** (never invoice×0.16); DTA/PRV as own lines with basis; DOF exchange rate only; UTC stored / America/Chicago displayed; semáforo as a pill and a SEPARATE event from bridge+lane; MVE/E2 date as a configurable value with source + effective date on the card (never hardcoded); T-MEC origin rule-cited (tariff-shift/RVC) + margin-to-threshold + 5-yr trail (never a fabricated certificate). **Acceptance:** a checklist passes on every relevant screen; flag any violation with file+line."

## Prompt 4 — P6a: responsive, verified at 375px ON A REAL DEVICE
"Make every screen work at 375px: tables → stacked cards, bottom tab bar = 5 items + a 'Más' sheet (no horizontal scroll), agent = full-width bottom sheet, KPI grids 2-up, touch targets ≥60px, provenance/source cards tappable (not hover). Then **open it on a real 375px device** (or a real mobile emulator) and produce a contact sheet: every screen × {375, 1440} × {broker, client} × {ES, EN}. **Acceptance:** the contact sheet exists and shows zero horizontal scroll / clipping anywhere. (This is the gate the design tool could not self-verify — it needs a real viewport.)"

## Prompt 5 — P6b: white-label onboarding + one live feed
"Build the white-label onboarding flow from a single brand source (logo, name, color, domain, patente) that re-skins a tenant in minutes; keep one clearly-labeled live-dogfood tenant + fictional tenants. Then wire ONE real integration end-to-end (start with DOF FX or e.conta — whichever has credentials) so at least one LIVE badge is genuinely live, proving the LIVE/STAGED layer is real. **Acceptance:** a tenant re-skin is demoed in <5 min; one feed flips from STAGED to a real LIVE value with a real last-sync."

## Prompt 6 — the agentic spine wiring (make the surfaces functional)
"The four standalone surfaces (Approval Gate, Accuracy, Autonomy, Opportunities) are designed and self-contained. Wire them into the app's router and state: the Approval Gate consumes a real prepared pedimento object; Autonomy's dial actually governs which agent actions auto-run vs gate; Opportunities is populated by the agent's findings; Accuracy reads real measured pass-rates. **Acceptance:** changing the Autonomy dial visibly changes agent behavior elsewhere; signing in the Gate writes to the append-only audit; an Opportunity's editable plan executes its (non-gated) steps."

---

## The two things ONLY a developer environment can certify (why this can't finish in a design tool)
1. **375px device proof** (Prompt 4) — needs a real viewport; a fixed-width design preview cannot screenshot a phone.
2. **A genuinely live regulated feed** (Prompt 5) — needs real SAT/CBP/e.conta/DOF credentials.
Until both pass, a *literal* 10/10 is uncertifiable — by anyone, in any tool. These two prompts are the last gates.

## Order & definition of done
P0 → P4 → P5 → P6a → P6b → P6 (wiring). **10/10 = a reviewer opens it cold on a phone and a laptop, as broker and shipper, in ES and EN; every screen is purpose-built and register-correct; every component is honest in all four states; every number cites its source; the agent acts on what they're looking at with autonomy they control; the broker holds the one signature; and a contact sheet + one live feed prove it.**
