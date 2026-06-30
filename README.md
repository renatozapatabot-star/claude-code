# CRUZ — El Sistema Operativo Transfronterizo

The cross-border (US–MX) customs operating system for EVCO. White + red canon.
**CRUZ prepares; the signature is yours.** Spanish UI, English code.

```bash
npm start        # serve at http://localhost:4317
npm run check    # syntax-check server + data modules
npm run verify   # headless browser verification → scripts/shots/ (desktop + 375px)
```

Zero runtime dependencies — pure Node `http` + static files. (`playwright` is dev-only for `verify`.)

## Architecture
```
server.js            Zero-dep HTTP server: static + JSON API
data/embarques.js    Shipment dataset (semáforo, confidence, duties, crossing timeline)
data/cruz.js         Trust loop: decision queue, LIVE/STAGED sources, copilot, agent crew
public/              index.html · styles.css (design tokens) · app.js (bilingual + trust loop)
design/reference/    The real CRUZ.dc.html package — source of truth for SUBSTANCE (not palette)
scripts/cruz-loop.md The recursive 100/100 design loop (run daily at 06:01)
DESIGN.md            Canonical white+red design system + invariants + the 10/10 lens
DESIGN_LOG.md        One entry per shipped slice
```

### API
`GET /api/health · /api/summary · /api/pipeline · /api/embarques?q=&estado= ·
/api/embarques/:id · /api/decisions · /api/sources · /api/copilot?view=`

## The trust loop (the product)
Decision queue → **signature gate** ("Nada se transmite hasta que firmes — luego 5 s para cancelar")
→ **5-second undo** → logged to the copilot ledger. Honest data everywhere: `DATOS DEMO`,
**EN VIVO / POR ACTIVAR**, "Pendiente de sincronización." Never auto-file/pay/email.

## Recursive self-improvement loop
`scripts/cruz-loop.md` is the canonical directive. A scheduled session runs it daily at **06:01**
(full effort, full autonomy): audit → pick the smallest high-leverage move → implement → verify in
browser at desktop + 375px → document in `DESIGN_LOG.md` → commit & push. It self-improves each run.

## Import status (why the design was seeded from a ZIP, not the MCP)
The original handoff asked to import `CRUZ.dc.html` via the `claude_design` MCP and to read the live
portal. Both are **unreachable from this headless web sandbox**:
- `claude_design` MCP / `/design-login` requires an interactive terminal (no headless auth path).
- `claude.ai/design` share link returns 403 (auth-gated; no session cookies in the container).
- `portal.renatozapata.com` is blocked by the environment's egress network policy (403 at the proxy).

The full design package (`CRUZ.dc.html` + 13 surfaces + planning docs + screenshots) was instead
**provided as an upload** and vaulted into `design/reference/`. To re-sync later, either run
`/design-login` in an interactive Claude Code terminal, or add `renatozapata.com` to the environment's
network allowlist, or drop updated files into `design/reference/`.
