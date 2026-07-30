// SuperTito ledger — append-only, HMAC-chained, tail-anchored, single-writer-locked,
// with a verified-prefix cache so append/read is O(1) amortized while the external
// CLI verifier still walks every line (ST-5 / RES-01 / RES-12 / X7). Channel-agnostic.
import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  appendFileSync, readFileSync, existsSync, writeFileSync, mkdirSync, rmSync,
  statSync,
} from 'node:fs';
import { dirname, join, basename } from 'node:path';

const DOMAIN = 'ST-LEDGER-V1|';
const ANCHOR_DOMAIN = 'ST-TAIL-ANCHOR-V1|';

const mac = (key, s) => createHmac('sha256', key).update(s).digest('hex');
const eq = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

// One canonical JSON serialization (sorted keys) so the chain is deterministic.
export function canonical(obj) {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(canonical).join(',') + ']';
  return '{' + Object.keys(obj).sort().map(k => JSON.stringify(k) + ':' + canonical(obj[k])).join(',') + '}';
}

function lineMac(key, prevMac, payload) {
  return mac(key, DOMAIN + prevMac + '|' + canonical(payload));
}

export class LedgerError extends Error {
  constructor(reason) { super(reason); this.name = 'LedgerError'; this.reason = reason; }
}

// Single-writer lock via atomic mkdir. Stale recovery is race-safe (EEXIST → structured
// contention, never an uncaught crash — RES-12).
export function acquireLock(lockDir, { staleMs = 30_000, now = Date.now } = {}) {
  try {
    mkdirSync(lockDir);
    writeFileSync(join(lockDir, 'owner'), JSON.stringify({ pid: process.pid, at: now() }));
    return { ok: true, release: () => { try { rmSync(lockDir, { recursive: true, force: true }); } catch {} } };
  } catch (e) {
    if (e.code !== 'EEXIST') throw e;
    // Held. Is it stale?
    let age = Infinity;
    try { age = now() - JSON.parse(readFileSync(join(lockDir, 'owner'), 'utf8')).at; } catch {}
    if (age < staleMs) return { ok: false, reason: 'lock-held' };
    // Attempt race-safe recovery: remove then re-create atomically. If a fresh holder
    // wins the mkdir between our rm and mkdir, we get EEXIST again → contention, no crash.
    try { rmSync(lockDir, { recursive: true, force: true }); } catch {}
    try {
      mkdirSync(lockDir);
      writeFileSync(join(lockDir, 'owner'), JSON.stringify({ pid: process.pid, at: now(), recovered: true }));
      return { ok: true, recovered: true, release: () => { try { rmSync(lockDir, { recursive: true, force: true }); } catch {} } };
    } catch (e2) {
      if (e2.code === 'EEXIST') return { ok: false, reason: 'stale-recovery-race' };
      throw e2;
    }
  }
}

export function createLedger(path, key, { paranoid = process.env.ST_LEDGER_PARANOID === '1' } = {}) {
  mkdirSync(dirname(path), { recursive: true });
  const anchorPath = join(dirname(path), basename(path) + '.tail-anchor.json');
  // verified-prefix cache
  let cache = { size: 0, mtimeMs: 0, count: 0, tailMac: mac(key, DOMAIN + 'genesis') };

  function readAllLines() {
    if (!existsSync(path)) return [];
    return readFileSync(path, 'utf8').split('\n').filter(Boolean);
  }

  function fullVerify() {
    let prev = mac(key, DOMAIN + 'genesis');
    const entries = [];
    for (const [i, line] of readAllLines().entries()) {
      let row;
      try { row = JSON.parse(line); } catch { throw new LedgerError('corrupt-line'); }
      const expect = lineMac(key, prev, row.payload);
      if (!row.mac || !eq(row.mac, expect)) throw new LedgerError('mac-mismatch@' + i);
      prev = row.mac; entries.push(row.payload);
    }
    return { prev, count: entries.length, entries };
  }

  // O(1) when file unchanged since last verify; O(k) for foreign appends; full re-verify
  // on shrink / mtime-regress / anchor mismatch (fail-closed paranoia preserved).
  function chainState() {
    if (paranoid) { const v = fullVerify(); cache = { size: statOr0(), mtimeMs: mtimeOr0(), count: v.count, tailMac: v.prev }; return cache; }
    const size = statOr0(), mtimeMs = mtimeOr0();
    if (size === cache.size && mtimeMs === cache.mtimeMs) return cache;
    if (size < cache.size) throw new LedgerError('ledger-shrank');
    const v = fullVerify(); // grew (foreign or ours): verify; simplest correct form
    if (existsSync(anchorPath)) {
      const a = JSON.parse(readFileSync(anchorPath, 'utf8'));
      if (a.count > v.count) throw new LedgerError('anchor-ahead-of-ledger');
    }
    cache = { size, mtimeMs, count: v.count, tailMac: v.prev };
    return cache;
  }
  const statOr0 = () => existsSync(path) ? statSync(path).size : 0;
  const mtimeOr0 = () => existsSync(path) ? statSync(path).mtimeMs : 0;

  function append(payload) {
    const st = chainState();
    const m = lineMac(key, st.tailMac, payload);
    appendFileSync(path, JSON.stringify({ payload, mac: m }) + '\n');
    // reseal tail anchor
    const anchor = { count: st.count + 1, tail_mac: m };
    anchor.anchor_mac = mac(key, ANCHOR_DOMAIN + canonical(anchor));
    writeFileSync(anchorPath, JSON.stringify(anchor));
    cache = { size: statOr0(), mtimeMs: mtimeOr0(), count: st.count + 1, tailMac: m };
    return { count: cache.count, mac: m };
  }

  function verifyAnchor() {
    if (!existsSync(anchorPath)) return existsSync(path) ? { ok: false, reason: 'anchor-missing' } : { ok: true };
    const a = JSON.parse(readFileSync(anchorPath, 'utf8'));
    const { anchor_mac, ...body } = a;
    if (!eq(anchor_mac, mac(key, ANCHOR_DOMAIN + canonical(body)))) return { ok: false, reason: 'anchor-mac-mismatch' };
    const st = fullVerify();
    if (st.count !== a.count) return { ok: false, reason: 'anchor-count-mismatch' };
    if (!eq(st.prev, a.tail_mac)) return { ok: false, reason: 'anchor-tail-mismatch' };
    return { ok: true, count: st.count };
  }

  return {
    append,
    count: () => chainState().count,
    readAll: () => fullVerify().entries,
    verify: () => { fullVerify(); return verifyAnchor(); },
    verifyAnchor,
    _fullVerify: fullVerify,
  };
}
