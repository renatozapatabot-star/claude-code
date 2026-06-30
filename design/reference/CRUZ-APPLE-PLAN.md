# CRUZ — The Apple-Grade Plan (whole-app, not one screen)
*Make all of `CRUZ.dc.html` feel like an iOS app Steve Jobs shipped — VC-funded, team-designed to the last pixel. The benchmark is the orb: it is already beautiful, considered, alive. Nothing in the app is allowed to look less finished than the orb. No reskin — we elevate the existing navy/cyan/paper language to its ceiling.*

## The north star
**"Rate everything against the orb."** The orb has depth, a light source, motion that breathes, perfect roundness, restraint. Every other element — a nav icon, a table row, an empty state — must feel as intentional. If it looks like a bootstrap default next to the orb, it's not done.

The bar, on every screen: *Would Jobs ship this on stage? Would a team of ten have sweated this detail? Is there anything left to remove?*

---

## 1. GLOBAL SYSTEMS (app-wide — fix once, everything inherits)

### 1.1 Typography (the biggest single lift)
Lock one system and apply it to **every** screen, not just Tráficos:
- **Display** (Archivo/Inter Tight) for hero answer-lines + section titles — weight 600, tight tracking (−.02em), large optical sizes.
- **Text** (Hanken/Inter) for all UI — weights 450/500 only; kill the bold-everywhere.
- **Mono** (Space Mono) for *every* identifier/number/value — tabular, selectable.
- One scale: 30 / 22 / 18 / 15 / 13 / 11. Sentence case; ALL-CAPS only for 11px letter-spaced eyebrows.
- *Result: instant hierarchy everywhere — the eye always lands on the answer first.*

### 1.2 The nav rail (currently functional → make it a spectacle)
- Refined **icon set** (one stroke weight, rounded joins, optically centered), generous 8-pt spacing, the active item with the **luxurious inset cyan glow** (already on the consoles — bring it here), the logo mark given room to breathe, the collapse interaction buttery (250ms).
- The rail is the first thing seen — it must feel as crafted as the orb.

### 1.3 Surfaces, borders, elevation (the VPL, finally applied to the client)
- Translucent **−50% hairlines** (`--line` → `rgba(15,30,55,.06)` on light) — separation by depth + space, not boxes. (Carefully, around the dark command-center overrides.)
- The 3-layer ultra-soft shadow (already in `--shadow`) on every card.
- Radius scale 12/16/20; the orb stays the only circle.

### 1.4 Color + contrast
- Color = **semáforo + confidence only**; cyan = live/action/AI; brass-free. Collapse the ad-hoc grays to one slate ramp. 3-tier text (strong → muted → faint) so the eye is guided effortlessly.

### 1.5 Motion grammar (one set, restrained)
- 150ms hover · 250ms panel · 400ms page · `cubic-bezier(.22,1,.36,1)`. Count-up (already wired), shape-matched skeletons, status-bearing loaders, shared-element morph on row→detail. The orb + semáforo state-change get the spend; nothing else flashy. Reduced-motion safe.

### 1.6 Chrome discipline (Musk: delete the part)
- Gate **SIMULAR / flask / DEMO-DATA** dev tools behind a flag — a Jobs demo shows zero scaffolding. Keep the header to: wordmark · book-of-business · the **centerpiece search** (Raycast depth + focus ring + ⌘K chips) · notifications · profile.

---

## 2. EVERY SCREEN gets the Tráficos treatment (the finished reference)
Apply the proven pattern to **all 11+ tabs** — Resumen, Indicadores, Pedimentos, Files, Warehouse In, Annex 24, In Warehouse, Monthly Report, MVE, Search, Alerts, Map·Center, Clients:
1. **Answer-first hero** — one human-truth line in display weight; counts demoted to a quiet sub. (Resumen already strong; bring the rest up.)
2. **Semáforo pills** — the one crisp recipe everywhere status appears.
3. **Alive tables/lists** — translucent separators, hover lift + cyan accent, tabular-mono numbers, ⚡ on hover.
4. **State parity** — empty / loading-skeleton / error each as beautiful as populated (Jobs: the empty state matters most).
5. **Progressive disclosure** — lead with 1–3 numbers; detail one tap deeper.

## 3. THE EXIT ARTIFACTS (design is the channel)
The **cleared-document PDF** and **status email** a client/supplier sees must be as sexy as the app — typeset, sealed, screenshot-worthy. This is the viral GTM made tangible.

## 4. MOBILE — a real iOS app at 375px
Bottom tab bar, stacked cards, full-width copilot sheet, 60px touch targets, the orb repositioned. The corridor runs on phones; it should feel native, not a shrunk desktop.

---

## SEQUENCE
1. **Global typography + nav-rail spectacle + VPL borders on `--line`** (one pass, the whole app jumps).
2. **Centerpiece search + chrome discipline** (gate dev tools).
3. **Screen-by-screen Tráficos treatment** (Resumen → Indicadores → Pedimentos → Files → the rest), each with state parity.
4. **Exit artifacts** (PDF + email).
5. **Mobile 375px pass.**
6. **Then** broker + operator + login + landing **re-sync to this finished CRUZ** — it is the master.
7. Frontier substance (real per-load reasoning, the Gate, audit, two-sided moment).

## DEFINITION OF DONE
Open any tab, on phone or laptop, ES or EN: every element is as considered as the orb, the eye lands on the answer first, nothing looks like a default, there's nothing left to remove, and a supplier would screenshot it. CRUZ looks like a ten-person design team shipped it with a16z's money — built entirely on the language it already has.
