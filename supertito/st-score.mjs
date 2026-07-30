// ST-100-style scorer (ST-9). Honest: SIM-labeled items, machine-readable residual list,
// two-term print, never a bare 100. Runs the suite and reports.
import { execSync } from 'node:child_process';

const dims = [
  { name: 'sender-auth (spoof-resistant, oracle-free)', sim: false },
  { name: 'ledger integrity (HMAC chain + tail anchor + lock)', sim: false },
  { name: 'receipt provenance (verify at record + utterance)', sim: false },
  { name: 'escalation (batch cap, oldest-first, no loss/double-fire)', sim: false },
  { name: 'i18n ES/EN parity + lang fallback', sim: false },
  { name: 'boot-token TTL + TOCTOU-safe', sim: false },
  { name: 'channel chaos + never-drop [SIM-CERTIFIED — live token founder-side]', sim: true },
  { name: 'append O(1)-amortized @ 10k [bench]', sim: false },
];
const founder_side_residuals = [
  'real @supertitobot/Clawdia token custody ([WO-03])',
  'roster -> real chat/user ids ([WO-03])',
  'live channel outage drill vs mock ([P6-W3-01])',
];

let suiteOk = false, benchOk = false;
try { execSync('node --test test/*.test.mjs', { cwd: import.meta.dirname, stdio: 'ignore' }); suiteOk = true; } catch {}
try { execSync('node scripts/bench-append.mjs --n 10000', { cwd: import.meta.dirname, stdio: 'ignore' }); benchOk = true; } catch {}

const passed = suiteOk && benchOk ? dims.length : 0;
const report = {
  total: `${passed}/${dims.length}`,
  sim_certified: dims.filter(d => d.sim).map(d => d.name),
  founder_side_residuals,
  suite: suiteOk, bench: benchOk,
};
console.log(JSON.stringify(report, null, 2));
console.log(`\nON-OUR-END: ${report.total} certifiable-here (${report.sim_certified.length} SIM-CERTIFIED) · founder-side residuals: ${founder_side_residuals.length} (listed) — never a bare 100`);
process.exit(suiteOk && benchOk ? 0 : 1);
