# CRUZ — handoff to local Claude Code (read me first)

**Philosophy (founder call, 2026-07): demo → sell → build.** The Claude Design
(navy/cyan `CRUZ.dc.html` package) is the canonical look for the demo/closer. Make it
100/100, sell with it, then build what signed clients need.

## State of the world (this branch: `claude/cruz-monetization-strategy-8pksjy`)

1. **`site/` — the closer, runnable anywhere.** The real Claude-design prototypes
   (`design/reference/*.dc.html`) now run standalone in a browser via a purpose-built
   runtime (`site/support.js` = React 18 + DC shim, see `site/vendor/dc-shim.js`).
   Pages: `index.html` (landing) · `login.html` · `app.html` · `console.html` ·
   `cockpit.html` · `gate.html`. Verified headless: 0 console errors, 0 mobile overflow.
   - Landing gained two founder sections **in the design's own language**: the four keys
     (patente MX · corretaje EE.UU. · bodega · cross-docking) and the founding-program
     pill above the final CTA. Both bilingual (DICT en/es).
2. **`public/` — the white+red implementation track** (previous canon per `DESIGN.md`).
   Received a polish pass: 4-up KPI grids, "Lo que CRUZ hizo" disclosure checklist in the
   signature gate, plus a white+red `landing.html`. Kept as the working-app track; the
   **demo runs on the Claude design** per the founder override.
3. **`sales/` — the sell-then-build kit.** Demo script (walks `site/`), pricing
   (`[CONFIRMAR]` anchors), outreach templates ES/EN, founding LOI, 5-day runbook.

## Do this first, locally

```bash
# 1. See the closer exactly as a prospect would
cd site && python3 -m http.server 8080   # → http://localhost:8080 (textures load locally!)

# 2. Reconnect the live Claude Design project (was unreachable from the cloud sandbox)
/design-login
# then sync/import: https://claude.ai/design/p/31291144-dc6f-47d2-85b5-2db30cb1f809?file=CRUZ.dc.html
# Diff the project's CRUZ.dc.html against design/reference/CRUZ.dc.html and reconcile —
# the local copy was vaulted from a ZIP and has two small founder edits
# (nav-label collapse fix in CRUZ.dc.html; four-keys + founder pill + mobile wraps in CRUZ Landing.dc.html).

# 3. Ship it
npx vercel deploy site --prod            # your account, your domain
# 4. Stripe payment link for the USD 2,500 founder deposit → paste into sales/pricing.md
# 5. Founder confirms every [CONFIRMAR] price → print the kit → run sales/runbook-5-days.md
```

## Known gaps / decisions queued

- The globe's photoreal textures load from jsdelivr — vendored fallback (dot-globe) covers
  offline; consider committing the two JPGs into `site/assets/` locally.
- `window.claude.complete` (copilot replies in `app.html`) is stubbed with a demo line —
  wire a real backend later; it degrades honestly.
- Brand fork: Claude design (navy) vs white+red (`DESIGN.md`). Founder override says the
  demo is navy; decide before building new surfaces whether white+red continues at all.
- `sales/order-form-loi.md` needs a lawyer's read before first signature.
