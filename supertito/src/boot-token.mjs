// TTL boot-token with TOCTOU-safe check-then-use (RES-04). The token binds an admission
// snapshot + expiry; boot re-verifies at consume time, so the window is the TTL, not a gap.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { canonical } from './ledger.mjs';

const DOMAIN = 'ST-BOOT-TOKEN-V1|';
const mac = (key, s) => createHmac('sha256', key).update(s).digest('hex');
const eq = (a, b) => typeof a === 'string' && typeof b === 'string' && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export const DEFAULT_TTL_MS = 60_000; // [WO-04] ratifiable default

export function mintBootToken(key, snapshot, { ttlMs = DEFAULT_TTL_MS, now = Date.now } = {}) {
  const payload = { snapshot, issued_at_ms: now(), expires_at_ms: now() + ttlMs };
  return { ...payload, token_mac: mac(key, DOMAIN + canonical(payload)) };
}

// Re-verifies AT boot: mac valid, not expired, and the live snapshot still matches.
export function consumeBootToken(key, token, liveSnapshot, { now = Date.now } = {}) {
  if (!token || typeof token !== 'object') return { ok: false, reason: 'token-missing' };
  const { token_mac, ...payload } = token;
  if (!eq(token_mac, mac(key, DOMAIN + canonical(payload)))) return { ok: false, reason: 'token-mac-invalid' };
  if (now() > payload.expires_at_ms) return { ok: false, reason: 'token-expired' };
  if (canonical(payload.snapshot) !== canonical(liveSnapshot)) return { ok: false, reason: 'admission-drift' };
  return { ok: true };
}
