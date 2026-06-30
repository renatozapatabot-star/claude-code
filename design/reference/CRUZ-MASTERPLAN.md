# CRUZ — The 10/10 Execution Plan
*Single source of truth. Replaces the 11 prior planning docs. Every item has an acceptance test — "done" means the test passes in the live build, not that work was dispatched.*

The thesis of 10 is not more features. It is three things:
1. **The agent is the surface, not a pill** — it lives docked, acts on the object you're looking at, and never covers the work.
2. **Every agent action is transparent the way Clasificación IA is** — read → extract → classify → validate → price → draft, with confidence + defend/override. That one screen is the house style for *all* agency.
3. **The two-sided loop is felt, not described** — one cold end-to-end run plays across broker + shipper views with motion, no reload.

---

## DONE (live in CRUZ.dc.html)

### ✅ M3 — Distinct hero per section *(template fatigue killed)*
Each section now has its own signature: **Resumen** = action hero + night briefing; **Tráficos** = live border-operations ticker (pulsing Laredo wait + crossing/paid/review/value); **Pedimentos** = defense-ready compliance band; **Anexo 24** = dark "capital at rest" balance hero + flow stats; **Expedientes** = document-type cards; **Indicadores** = the KPI grid, kept as the one place it's the right answer. No two adjacent sections read as the same skeleton.

### ✅ M2 — Inline ⚡ acts on the exact object → live reasoning trace
Every shipment row (Tráficos + command-center list) carries a quiet ⚡. Click it and CRUZ **pins** that exact object: the dock opens to a live reasoning trace for *that* shipment — read → extract → classify → validate → price → draft, with its confidence band — and holds at the signature gate. A "Fijado a SHP-X · Reanudar auto" chip makes the pin legible and dismissable. Page-aware actions (draft supplier request, chase invoice, assemble SAT packet, handle IMMEX expiry…) cover the non-row screens. The Clasificación IA transparency is now the house style for all agency.

### ✅ M4 — "Watch a clear" guided run
A ▶ launcher in the dock pins a fresh end-to-end run (SHP-44310, new supplier, $4,820 saved) you can watch stream step-by-step to the human gate — the signature climax of the loop, on a real timer, with optimistic toast + undo + ledger. The shipper→broker CofO handoff (WS4) remains the detailed two-sided instance.

### ✅ M1 — Killed the pill → docked agent
The floating copilot that covered data on every screen is gone. CRUZ now lives in a **right-edge dock** that reserves its own space so content always reflows beside it and nothing is ever covered.
- Collapsed = a 64px full-height **rail** (live orb + progress ring + state dot + proposal count + the page's top ⚡ action + expand chevron).
- Expanded = a 372px full-height **panel** (solid surface, left border) carrying the full run: autonomy control, page-aware actions, goal card, agent crew, confidence routing, step rail, human gate, thread, ledger, composer.
- Shell reserves `padding-right` (372 open / 64 rail / 0 mobile) via `data-agent`. On ≤760px the dock becomes a bottom sheet and the rail hides.
- *Acceptance (met):* on Resumen, Tráficos, Indicadores, Anexo 24, Expedientes the dock never overlaps a card, row, or KPI in either state.

### ✅ M1b — De-slopped the brand mark
Logo gradient was cyan→indigo→fuchsia (the one piece of AI slop). Now a disciplined teal-family mark (`#22D3EE → #0891B2 → #0E7490`) inside the app's own accent system. Client-brand avatars keep their distinct colors (intentional variety) and white-label theming is untouched.

---

## NEXT — to finish the 10

### M2.1 — extend ⚡ to the last lists
Pedimentos, Anexo 24 and Alertas rows should carry the same ⚡ pin (Tráficos + command-center done). Mechanical, low-risk — same pattern.

### M3 — One distinct hero layout per section *(kills template fatigue)*
**Done:** Anexo 24 now leads with a dark "capital at rest" balance hero + vertical flow stats (distinct from Indicadores' KPI grid). **Remaining:** give Tráficos / Pedimentos / Expedientes each a signature so no two adjacent sections read as the same template.
Resumen, Indicadores, Anexo 24, Tráficos, Expedientes share the same H1 + status-pill + 4-KPI-grid + table skeleton. Give each a signature:
- **Resumen** = live border map + "tu acción ahora" hero (not a KPI grid).
- **Tráficos** = the working queue (dense, scannable, ⚡ per row).
- **Twin/Shipment** = the shared timeline as hero.
- **Anexo 24** = the valued inventory ledger.
- **Indicadores** = the only place a KPI grid is the right answer — keep it, make it the exception.
- *Acceptance:* no two adjacent sections read as the same template; one radius/shadow/spacing scale documented.

### M4 — Two-sided perspective play
Extend "Watch a clear" into a perspective-switching run: supplier email → upload → classify → GO → cleared, animated across broker AND shipper views, no reload. The launcher + reasoning engine are done; what remains is the role-switch choreography and per-shipment `requirements[]`.

### M5 — Proof pass
Living data pervasive + smooth (already partial). A11y: focus-visible, AA contrast on every accent-on-light, reduced-motion honored, clean console, no layout shift. A contact sheet of every screen × desktop/390px × broker/shipper.

---

## Sequence
M2 → M4 → M3 → M5. M2 makes the agent feel intelligent everywhere; M4 is the demo that makes a reviewer lean in; M3 removes the last "samey" feeling; M5 proves it. Verify each at desktop + 390px before the next. No big-bang.

## What 10 means
A reviewer opens it cold — laptop and phone, either language, broker or shipper — and never finds a wrong color, a dead button, a fake-feeling state, a screen that doesn't fit, or an agent that can't act on what they're looking at. It feels alive, trustworthy, and unmistakably the border's frontier model.
