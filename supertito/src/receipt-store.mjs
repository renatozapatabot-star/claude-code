// Content-addressed, HMAC-sealed receipt store — provenance verified at record AND at
// utterance (ST-4 / RES-03). Proves integrity/existence, not content truth (issuer trust
// stays founder/deck-side — stated, never hidden).
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { canonical } from './ledger.mjs';

const DOMAIN = 'ST-RECEIPT-V1|';
const sha256 = (s) => createHash('sha256').update(s).digest('hex');
const hmac = (key, s) => createHmac('sha256', key).update(s).digest('hex');
const eq = (a, b) => typeof a === 'string' && typeof b === 'string' && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export function createReceiptStore(dir, key) {
  mkdirSync(dir, { recursive: true });
  const pathFor = (id) => join(dir, id + '.json');

  function put(body) {
    const c = canonical(body);
    const id = sha256(c);
    const rec = { body, sha256: id, hmac: hmac(key, DOMAIN + id + '|' + c) };
    writeFileSync(pathFor(id), JSON.stringify(rec));
    return { receipt_id: id, sha256: id };
  }

  function verify(id) {
    if (typeof id !== 'string' || !/^[0-9a-f]{64}$/.test(id)) return { ok: false, reason: 'receipt-missing' };
    const p = pathFor(id);
    if (!existsSync(p)) return { ok: false, reason: 'receipt-missing' };
    let rec;
    try { rec = JSON.parse(readFileSync(p, 'utf8')); } catch { return { ok: false, reason: 'receipt-corrupt' }; }
    const c = canonical(rec.body);
    const recomputed = sha256(c);
    if (recomputed !== id || rec.sha256 !== id) return { ok: false, reason: 'receipt-hash-mismatch' };
    if (!eq(rec.hmac, hmac(key, DOMAIN + id + '|' + c))) return { ok: false, reason: 'receipt-mac-mismatch' };
    return { ok: true };
  }

  return { put, verify };
}
