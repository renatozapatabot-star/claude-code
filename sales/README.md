# CRUZ — the sell-then-build kit

**Philosophy (founder call, 2026-07): demo → sell → build.** The demo must look so good
it could win 100 clients on pure looks; we close on that, then build what the signed
clients need, in the order they need it.

**The demo is the Claude design, run literally.** `site/` renders the real
`CRUZ.dc.html` package (navy/cyan, living globe) in any browser:

```bash
cd site && python3 -m http.server 8080     # or: npx vercel deploy site --prod
# http://localhost:8080  → landing (four keys + founder program)
#   → login.html (globe front door, role selection)
#   → app.html (the command center: GO queue, pedimentos, copilot, SIMULAR)
#   → gate.html (the human-signature moment)
```

The white+red implementation in `public/` (`npm start` → :4317) is the working
app track — same substance, alternate skin. **Demos run on the Claude design.**

## Files

| File | What it is |
|---|---|
| `demo-script.md` | The 15-minute closer script, beat by beat, with objection handling |
| `pricing.md` | Price sheet: despacho + logística + white label + Programa Fundador |
| `outreach-templates.md` | Email + WhatsApp templates, ES/EN, per segment |
| `order-form-loi.md` | One-page founding-program order form / LOI skeleton |
| `runbook-5-days.md` | The five-day sprint: package → outreach → demos → close |

## Ground rules (non-negotiable)

- **Sell the pilot and the service, never "working software today."** The demo shows
  honest, watermarked data (`DATOS DEMO`). The brokerage/warehouse/cross-dock services are
  real today; the software goes live with founding clients.
- The `DATOS DEMO` watermark stays on in every demo. Honesty is the brand.
- Every price in `pricing.md` marked `[CONFIRMAR]` needs the founder's sign-off before it is quoted.
