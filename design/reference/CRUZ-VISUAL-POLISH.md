# CRUZ — The Visual Polish Layer (VPL)
*The "$50M Series A" aesthetic pass. A cross-cutting refinement layer that sits on top of the 10/10 Master Plan. It does NOT touch workflows, navigation, IA, or modules — it only elevates the visual craft to Linear / Vercel / Mercury / Stripe / Ramp / Arc level. Every item has an acceptance test.*

## What we take from the brief (and what we skip)

**TAKE (high-value, brand-safe):** 8-pt spacing system · translucent 1px borders (−50% border weight) · sculpted glass + ultra-soft layered shadows · refined status pills · premium active-nav treatment · Raycast-grade search/command bar · restrained slate neutrals (fewer grays) · 3-tier contrast hierarchy · functional 150–250ms motion · +10–15% whitespace · "Bloomberg-by-Apple" calm density.

**SKIP / ADAPT (would break what we already locked):**
- **Font swap to Geist/SF Pro/Instrument Sans → SKIP.** We already run **Inter Tight (display) + Hanken (text) + Space Mono (numbers)** — the brief's own #1 pick is Inter Tight. Swapping fonts would shatter the cross-surface consistency we just unified. We keep the stack and instead fix the *weights/tracking/hierarchy* (the real gap).
- **"Increase data density" → ADAPT.** The client (almanac) must stay calm; density gains apply to the terminal consoles only.
- Everything else maps cleanly onto the existing spine — no new colors invented.

---

## 1. TYPOGRAPHY — make type the hero
- **Weight discipline:** Display H1/H2 = 800 · section/card titles = 700 · body = 450–500 · data/mono = 500–600 · labels/eyebrows = 600 + uppercase + `letter-spacing:.08–.16em`. **Kill bold-everywhere** — most current 700s on secondary text drop to 500.
- **Tracking:** display `letter-spacing:-.02em`; mono unchanged; micro-labels widened.
- **Optical sizes:** H1 30–34, section 19–22, card-title 15–16, body 13.5–14, label 10–11, mono-data 12–14. One scale, documented.
- *Acceptance:* no screen uses more than ~3 weights; secondary text never competes with headings; the eye lands on the H1 first every time.

## 2. SPACING — 8-pt grid, mathematically intentional
- Adopt a strict scale: **4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48**. Every padding/gap/row-height snaps to it. Card padding 20–24; section gaps 24–32; row height 56–60 (terminal) / 64 (touch).
- **+10–15% whitespace** at section level — let panels breathe.
- *Acceptance:* a spacing audit finds zero off-grid values in component markup; nothing looks accidentally placed.

## 3. SURFACES — sculpted glass, layered depth (not decoration)
- **Borders −50%:** replace solid `--border` with **translucent** hairlines — terminal `rgba(255,255,255,.06–.09)`, almanac `rgba(15,30,55,.06–.10)`. Separation comes from *depth*, not outlines.
- **Elevation scale (3 steps), ultra-soft, multi-layer:**
  - `--e1: 0 1px 2px rgba(8,15,30,.04), 0 1px 1px rgba(8,15,30,.03)`
  - `--e2: 0 2px 8px rgba(8,15,30,.06), 0 8px 24px rgba(8,15,30,.06)`
  - `--e3: 0 4px 12px rgba(8,15,30,.08), 0 24px 60px rgba(8,15,30,.12)` (terminal uses black-based rgba).
- **Glass:** almanac cards `rgba(255,255,255,.72)` + `blur(20px)` + a 1px top-inner highlight `inset 0 1px 0 rgba(255,255,255,.6)`; terminal panels `rgba(19,33,46,.7)` + blur + faint top highlight. Radius scale: 12 / 16 / 20.
- *Acceptance:* cards read as sculpted layers; no harsh 1px gray boxes; no neumorphism; no gratuitous gradients.

## 4. COLOR — restrained, intentional slate
- **Collapse the grays to one slate ramp** (replace ad-hoc `#64758A/#8A99A9/#7d8ea0/#9fb1c2` etc. with a single 6-step slate scale per register). Color carries *meaning only*: cyan = live/healthy/primary action · emerald = cleared/good · amber = staged/attention · red = risk/hold. Nothing else colored.
- **3-tier contrast:** `--text-strong` (commands attention) → `--text` (recedes) → `--text-muted` (near-invisible until needed). Tune so tertiary truly fades and primary truly leads.
- *Acceptance:* a single slate ramp drives all neutrals; removing every non-semantic color leaves the UI fully legible; AA holds on every accent-on-surface pair.

## 5. NAVIGATION — luxurious active state (structure unchanged)
- Active rail item: subtle **inset glow + depth** — `background: rgba(34,211,238,.10)`, a 2px inset left bar with a soft cyan glow, icon in `--accent-text`; never neon. Hover: 150ms lift + faint surface tint. Consistent 44–48px hit targets on the 8-pt grid.
- *Acceptance:* the active tab reads as "lit from within," not filled with bright color; hover feels alive but quiet.

## 6. SEARCH / COMMAND BAR — the centerpiece (Raycast/Spotlight)
- Elevate the ⌘K bar: soft depth (`--e2`), a perfect focus ring (`0 0 0 3px rgba(34,211,238,.18)`), beautiful `kbd` chips (mono, translucent border, subtle inset), and a focused palette with refined row hovers + result icons. It should feel like the OS's center.
- *Acceptance:* focus state is gorgeous; kbd chips are crisp; the palette feels like Raycast, not a `<select>`.

## 7. TABLES & LISTS — Linear/Mercury-grade
- Softer row separators (translucent hairline, not solid), elegant hover (whole-row tint + 1px accent-left on focus), tighter-but-calm density on terminal, clear column hierarchy (primary mono-ID + secondary muted + right-aligned tabular numerals). Rows feel alive, not spreadsheet.
- *Acceptance:* tables read like Linear; status pills refined (see 8); no zebra-stripe spreadsheet feel.

## 8. STATUS PILLS — refined and beautiful
- One pill system: 9999px radius, `padding:4px 10px`, 6px dot with a soft 0–4px glow, label 10.5–11px/600, bg = color@8–12% + 1px color@28–34% border. Verde/auto-cleared, your-signature, escalated, LIVE/STAGED, Shadow — all from the same recipe.
- *Acceptance:* every pill across every surface uses the identical recipe; they look minted, not bootstrap.

## 9. MOTION — premium microinteractions (functional)
- One grammar: 150ms hover/tap · 200–250ms panel/popover · 400ms page · `cubic-bezier(.22,1,.36,1)`. Hover elevation (e1→e2), shape-matched skeletons, status-bearing loaders (trace accelerates near done), shared-element morph row→detail. All reduced-motion safe.
- *Acceptance:* nothing flashy; every transition explains a state change; reduced-motion fully honored.

## 10. ICONOGRAPHY — one unified set
- Normalize all icons to **1.75–2px stroke, rounded caps/joins, 24px grid** (we already use this on most). Audit for the few inconsistent ones; one visual voice.
- *Acceptance:* every icon shares stroke weight + corner radius; none look borrowed.

---

## HOW IT SLOTS INTO THE SEQUENCE
The VPL is applied as **token-level refactors** so it propagates, not a per-screen repaint:
1. **Lock the refined token set** (type weights, 8-pt scale, translucent borders, 3-step elevation, slate ramp, pill recipe, focus ring) in the shared spine + the Copilot Dock first → it cascades to broker, operator, client embeds.
2. Then per-surface polish passes in the existing order: **landing → login → client → broker → operator**, each ending with the "YC demo-day" check.

## THE FINAL BAR (every screen)
> "Would this sit comfortably beside Linear, Vercel, Mercury, Arc, Ramp, and Stripe in a YC demo-day deck?"
If not, refine: hierarchy, spacing, elevation, restraint. The product must read *expensive, modern, intelligent, inevitable* — elite engineers obviously behind it — while every existing workflow, nav, and module stays exactly where it is.
