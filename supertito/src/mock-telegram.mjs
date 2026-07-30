// Mock Telegram/Clawdia HTTP rail with chaos modes (ST-2). SIM-CERTIFIED: a real HTTP
// client speaks to a local server; the live api.telegram.org drill stays founder-side.
// The transport is channel-agnostic — the same shape backs a real Telegram or Clawdia leg.
import { createServer } from 'node:http';

export function createMockTelegram() {
  let mode = 'ok', latencyMs = 0;
  const requests = [];
  const server = createServer((req, res) => {
    let body = '';
    req.on('data', c => (body += c));
    req.on('end', () => {
      requests.push({ url: req.url, body });
      const reply = () => {
        if (mode === 'outage') { req.socket.destroy(); return; }
        if (mode === '500') { res.writeHead(500); res.end('{"ok":false}'); return; }
        if (mode === '409') { res.writeHead(409); res.end('{"ok":false,"error_code":409}'); return; }
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end('{"ok":true,"result":{"message_id":' + requests.length + '}}');
      };
      if (mode === 'slow' && latencyMs) setTimeout(reply, latencyMs); else reply();
    });
  });
  return {
    server, requests,
    listen: () => new Promise(r => server.listen(0, '127.0.0.1', () => r(server.address().port))),
    close: () => new Promise(r => server.close(r)),
    setMode: (m, ms = 0) => { mode = m; latencyMs = ms; },
  };
}
