# CRUZ — deployable demo site

Static, self-contained build of the CRUZ interactive prototype. No backend, no
build step. All data is illustrative and honestly watermarked (`DATOS DEMO`).

## Pages

| URL | Surface |
|---|---|
| `/` (`index.html`) | Marketing landing — globe, agent demo, ROI slider, white-label pitch |
| `/login.html` | Login with the data-globe (role selection routes below) |
| `/app.html` | The full application — cockpit, pedimentos, expedientes, facturación, clientes |
| `/console.html` | Broker console (admin role) |
| `/cockpit.html` | Operator cockpit (operador role) |
| `/gate.html` | The approval gate — the human-signature moment |

`support.js` is the runtime: vendored React 18 (production) + the DC shim
(`vendor/dc-shim.js`) that runs the `*.dc.html` Design Component format
standalone. Source prototypes live in `design/reference/` — these pages are
generated copies with rewritten links; edit the source, not these.

## Deploy (pick one)

```sh
# Vercel — from the repo root
npx vercel deploy site --prod

# Netlify — from the repo root
npx netlify-cli deploy --dir site --prod

# Any static host: upload the contents of site/ as-is.
```

## Run locally (for demos without internet, minus webfonts)

```sh
cd site && python3 -m http.server 8080
# open http://localhost:8080
```

## Demo notes

- Language: ES/EN toggle, persisted in `localStorage` (`cruz.lang`).
- The top-bar **SIMULAR** menu in the app flips role and screen-state live —
  built exactly for sales demos.
- Keyboard: `⌘K` palette · `/` search · `1–9` tabs · `G` GO · `?` shortcuts.
- The copilot answers with a canned "demo mode" line when no LLM backend is
  attached (`window.claude.complete` stub in the shim).
- Keep the `DATOS DEMO` watermark. Sell the pilot and the brokerage service —
  never "working software today."
