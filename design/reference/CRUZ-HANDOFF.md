# CRUZ — Developer Handoff

The Cross-Border Operating System. Bilingual (ES/EN) customs-brokerage cockpit for the US–Mexico border. This package is a **high-fidelity interactive prototype**, not production code.

## Files
- `CRUZ.dc.html` — the application (single Design Component, ~3,400 lines).
- `CRUZ Login.dc.html` — login with the photoreal data-globe.
- `CRUZ Landing.dc.html` — marketing landing (same globe, replicated).
- `CRUZ-MASTERPLAN*.md`, `CRUZ-ROAD-TO-10.md` — design rationale + execution log.

## Architecture
- Single DC class `Component extends DCLogic`. State-driven view router (`this.state.view` → ~30 `is*` flags in `renderVals()`).
- **Bilingual:** every string lives in `DICT.en` / `DICT.es`; `t` resolves the active language. Never hardcode copy in markup.
- **Roles:** `this.state.role` ∈ {cliente, operador, contabilidad, bodega, admin}. Nav, KPIs, CTAs, shadow-mode, and the briefing all derive from role.
- **Inline styles only** (per DC runtime). Entrance animations are CSS `@keyframes` that animate **transform only** — never opacity — so content is never gated on a paused animation timeline. Honor `prefers-reduced-motion` (already wired).

## Key mechanics to preserve in production
1. **The trust loop is the product.** CRUZ prepares; the human signs. Nothing files, pays, or emails without explicit approval. The "human gate," confidence-routing strip (auto-cleared / your-signature / escalated), and shadow mode all encode this. Do not let the agent auto-file above the user's threshold.
2. **Confidence routing** is driven by per-line certainty bands tied to the Autonomía dial. Wire thresholds to real model confidence + value/risk rules.
3. **Border-aware GO queue** — sequences crossings against live wait-time windows. Needs real CBP/port feeds.
4. **Honesty layer** — `DATOS DEMO` watermark + LIVE/STAGED badges. In production, replace with real feed-status indicators (SAT, CBP, e.conta).

## Simulate harness (dev tool — strip or gate behind a flag in prod)
Top-bar `SIMULAR` menu flips **role** and **screen-state** (Loaded / Honest-empty / Skeleton / Error+retry / Shadow) live, no reload. Built for demos and QA. It never mutates the trust loop.

## Keyboard
`⌘K` palette · `/` search · `1–9` tabs · `G` GO · `J/K` scroll · `?` shortcuts · `Esc` close.

## Integrations to build (currently illustrative)
SAT (pedimentos/Anexo 24), CBP, e.conta + QuickBooks (Facturación), carrier/port wait-time feeds. All UI states (synced/connect/error) already exist — wire the data.

## Known prototype limits
- All data is illustrative (honestly watermarked).
- LLM copilot replies use `window.claude.complete` where available; production needs a real backend.
- Canvas globe is validated by pixel-probe (tooling can't screenshot canvas) — eyeball it in a real browser before sign-off.
