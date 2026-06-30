// CRUZ — minimal zero-dependency server.
// Serves the static frontend and a small JSON API over the in-memory dataset,
// so the brand experience "works both ways" (frontend <-> backend) with `node server.js`.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { EMBARQUES, PIPELINE, summary } = require('./data/embarques');
const { DECISIONS, SOURCES, CREW, COPILOT, ledgerSeed } = require('./data/cruz');

const PORT = process.env.PORT || 4317; // 43-17 -> "CRUZ" on a phone keypad.
const PUBLIC = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
};

function json(res, code, body) {
  const data = JSON.stringify(body);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(data);
}

/** Normalize text for accent-insensitive search (José -> jose). */
function norm(s) {
  return (s || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function searchEmbarques(q) {
  const terms = norm(q).split(/\s+/).filter(Boolean);
  if (!terms.length) return EMBARQUES;
  return EMBARQUES.filter((e) => {
    const hay = norm([e.id, e.cliente, e.origen, e.destino, e.estadoLabel, e.aduana, e.agente, e.pedimento, e.mercancia, e.caja].join(' '));
    return terms.every((t) => hay.includes(t));
  });
}

function serveStatic(req, res) {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/') rel = '/index.html';
  const filePath = path.normalize(path.join(PUBLIC, rel));
  if (!filePath.startsWith(PUBLIC)) return json(res, 403, { error: 'forbidden' });
  fs.readFile(filePath, (err, buf) => {
    if (err) {
      // SPA fallback: unknown non-asset routes return the shell.
      if (!path.extname(filePath)) {
        return fs.readFile(path.join(PUBLIC, 'index.html'), (e2, html) => {
          if (e2) return json(res, 404, { error: 'not found' });
          res.writeHead(200, { 'Content-Type': MIME['.html'] });
          res.end(html);
        });
      }
      return json(res, 404, { error: 'not found' });
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(buf);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/health') return json(res, 200, { ok: true, service: 'cruz', ts: new Date().toISOString() });

  if (url.pathname === '/api/summary') return json(res, 200, summary());

  if (url.pathname === '/api/pipeline') return json(res, 200, PIPELINE);

  if (url.pathname === '/api/decisions') return json(res, 200, { results: DECISIONS });
  if (url.pathname === '/api/sources') return json(res, 200, { results: SOURCES });
  if (url.pathname === '/api/copilot') {
    const view = url.searchParams.get('view') || 'inicio';
    return json(res, 200, { view, crew: CREW, ledger: ledgerSeed(), context: COPILOT[view] || COPILOT.inicio });
  }

  if (url.pathname === '/api/embarques') {
    const q = url.searchParams.get('q') || '';
    const estado = url.searchParams.get('estado');
    let rows = searchEmbarques(q);
    if (estado) rows = rows.filter((e) => e.estado === estado);
    return json(res, 200, { count: rows.length, query: q, results: rows });
  }

  const m = url.pathname.match(/^\/api\/embarques\/([\w-]+)$/);
  if (m) {
    const e = EMBARQUES.find((x) => x.id.toLowerCase() === m[1].toLowerCase());
    return e ? json(res, 200, e) : json(res, 404, { error: 'embarque no encontrado' });
  }

  if (url.pathname.startsWith('/api/')) return json(res, 404, { error: 'ruta no encontrada' });

  return serveStatic(req, res);
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`CRUZ escuchando en http://localhost:${PORT}`);
});

module.exports = server;
