# CRUZ — Canonical Design System (white + red)

**El Sistema Operativo Transfronterizo.** The cross-border (US–MX) customs operating
system for EVCO. This is the canonical, founder-approved design language: **warm paper +
one confident red stamp.** It supersedes the navy/cyan tokens in `design/reference/` — those
remain the source of truth for *substance* (components, copy, trust loop), not palette.

> Founder call (2026-06): "The white and red looks dope. Make it the new canonical 10/10."

## North star
A real EVCO shipper, warehouse, accounting, manager, or broker looks at any screen and feels:
*"This is the cleanest, most serious, most beautiful tool for my operation."* — and it is usable
at 3 AM. Calm, dense operational software. Not a landing page. Almost like using Google for the
first time: one obvious move, radical clarity over a messy domain.

## Tokens (see `public/styles.css` `:root`)
| Role | Token | Value |
|---|---|---|
| Brand / stamp / primary action | `--cruz` | `#cf3a22` |
| Paper (app canvas) | `--paper` | `#faf8f5` |
| Surface | `--surface` | `#ffffff` |
| Ink (primary text) | `--ink` | `#1a1c20` |
| Hairline | `--line` | `#e7e2da` |
| Semáforo verde / ok / LIVE | `--ok` | `#1f8a52` |
| Amarillo / needs-you / STAGED | `--warn` | `#b5781a` |
| Rojo / hold / risk | `--alert` | `#c23a2a` |
| In-transit / info | `--info` | `#2a6bb0` |

- **Type:** system sans for UI; system mono (`--mono`) with `tabular-nums` for every code, pedimento,
  confidence, and money figure. Customs is paperwork made precise.
- **Geometry:** hairline borders over shadows; subtle radii; fewer, stronger moves.
- **Accent is semantic, never decorative.** Red = brand mark, primary action, the human gate.

## The trust loop is the product
CRUZ **prepares**; the human **signs**. Nothing files, pays, or emails without an explicit GO.
- **Decision queue** (`¿Qué necesita de ti ahora?`) — ranked by value × urgency; confidence `/99`; semáforo.
- **Signature gate** (`Compuerta de firma`) — "Nada se transmite hasta que firmes — luego 5 s para cancelar."
- **5-second undo** (`Deshacer`) → then logged to the copilot ledger (`Lo que CRUZ hizo hoy`).
- **Persistent copilot** on every surface — state machine, Supervisado/Co-piloto, context, ≤3 proposals, crew, ask.

## Honest-data rules (non-negotiable)
- `DATOS DEMO` watermark while figures are illustrative.
- Feeds show **EN VIVO** (green) or **POR ACTIVAR** (gray) — never fake "connected."
- Empty ≠ zero. Missing ≠ error. Unsynced renders `—` / "Pendiente de sincronización."

## Hard boundaries
- Spanish UI, English code. ES default; `localStorage cruz.lang`.
- Existing CRUZ substance first; do not invent new components or a new design language.
- No generic cards, purple gradients, marketing hero, or decorative filler.
- Preserve auth/tenant/compliance invariants. Never auto-file/pay/email above the user's line.
- Mobile 375px must be clean, touchable, non-overlapping (verified every slice).

## The 10/10 lens (score every diff)
Clarity · Trust · Beauty · Cohesion · Density · Safety. Prefer the smallest high-leverage move.
