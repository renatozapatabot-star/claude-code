// 10k-append benchmark (ST-5). Proves the verified-prefix cache keeps append O(1)-amortized.
// Exit 1 on breach so superlinear regression is caught.
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { createLedger } from '../src/ledger.mjs';

const n = Number((process.argv.find(a => a.startsWith('--n='))?.split('=')[1]) ??
  (process.argv[process.argv.indexOf('--n') + 1]) ?? 10000);
const l = createLedger(join(mkdtempSync(join(tmpdir(), 'st-bench-')), 'l.jsonl'), 'k'.repeat(32));

const t0 = performance.now();
const windows = {};
for (let i = 0; i < n; i++) {
  const a = performance.now();
  l.append({ i, note: 'com' });
  const dt = performance.now() - a;
  const w = Math.floor(i / 2000);
  (windows[w] ??= []).push(dt);
}
const total = performance.now() - t0;
const p95 = (arr) => arr.slice().sort((x, y) => x - y)[Math.floor(arr.length * 0.95)];
const early = windows[1] ? p95(windows[1]) : 0;      // 2k-4k
const late = windows[Math.floor(n / 2000) - 1];       // last window
const lateP95 = late ? p95(late) : 0;
const ratio = early ? lateP95 / early : 0;

console.log(`total=${total.toFixed(0)}ms n=${n} p95_late=${lateP95.toFixed(3)}ms ratio=${ratio.toFixed(2)}`);
const fail = [];
if (total > 60_000) fail.push('total>60s');
if (lateP95 > 25) fail.push('p95>25ms');
if (ratio > 2.5) fail.push('ratio>2.5 (superlinear)');
if (fail.length) { console.error('BENCH FAIL: ' + fail.join(', ')); process.exit(1); }
console.log('BENCH PASS');
