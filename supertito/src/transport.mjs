// Channel transport with honest error classification + never-drop queue (ST-2).
// fetch/AbortController against the mock rail; classifies outage/timeout/server/conflict.
export function createTransport({ baseUrl, token = 'test-token', timeoutMs = 2000, fetchImpl = fetch }) {
  async function sendMessage(env) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeoutMs);
    try {
      const res = await fetchImpl(`${baseUrl}/bot${token}/sendMessage`, {
        method: 'POST', signal: ac.signal,
        headers: { 'content-type': 'application/json' }, body: JSON.stringify(env),
      });
      if (res.status === 409) return { ok: false, kind: 'conflict', status: 409 };
      if (res.status >= 500) return { ok: false, kind: 'server', status: res.status };
      if (!res.ok) return { ok: false, kind: 'unknown', status: res.status };
      return { ok: true };
    } catch (e) {
      if (e.name === 'AbortError') return { ok: false, kind: 'timeout' };
      return { ok: false, kind: 'outage' };
    } finally { clearTimeout(t); }
  }
  return { sendMessage };
}

// Never-drop delivery: a failed send is queued and retained until it actually delivers.
export function createDelivery({ transport, onMirror = () => {} }) {
  const queue = [];
  async function send(env) {
    const r = await transport.sendMessage(env);
    if (r.ok) { onMirror({ kind: 'alert-delivered', env }); return { delivered: true }; }
    queue.push(env); onMirror({ kind: 'alert-queued', env, error_kind: r.kind });
    return { delivered: false, queued: true, error_kind: r.kind };
  }
  async function flush() {
    const pending = queue.splice(0);
    let delivered = 0;
    for (const env of pending) {
      const r = await transport.sendMessage(env);
      if (r.ok) { delivered++; onMirror({ kind: 'alert-delivered', env }); }
      else queue.push(env); // retained — never dropped
    }
    return { delivered, remaining: queue.length };
  }
  return { send, flush, queueSize: () => queue.length };
}
