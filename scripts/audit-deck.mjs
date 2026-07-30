#!/usr/bin/env node
// audit-deck — falsifies FREIGHT-OS-CANON.md's P6 "Deck" claims about clawdia-presence
// (see FREIGHT-OS-CANON.md §P6, the 2026-07-30 "MAJOR CORRECTION" paragraph and [P6-W2-02]).
// Reads the real clawdia-presence tree; never touches or modifies it (read-only reference,
// per this repo's own rule — new files only ever land inside claude-code). Zero-dep. Exit 0/1.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// CLAWDIA_ROOT lets this be re-pointed (e.g. a different clone path) without editing the script;
// the canon's own admission path is /workspace/clawdia-presence.
const CLAWDIA_ROOT = process.env.CLAWDIA_ROOT || '/workspace/clawdia-presence';
const FREIGHT_APP = join(CLAWDIA_ROOT, 'app', 'plaios', 'freight');
const PANELS_DIR = join(FREIGHT_APP, 'panels');
const EXEC_DIR = join(FREIGHT_APP, 'execution');
const FILM_DIR = join(FREIGHT_APP, 'film');
const EXEC_LIB_DIR = join(CLAWDIA_ROOT, 'lib', 'freight-execution');
const CONTRACTS_PATH = join(EXEC_LIB_DIR, 'contracts.ts');

const results = []; // { claim, pass, detail }
const record = (claim, pass, detail) => results.push({ claim, pass, detail });

if (!existsSync(CLAWDIA_ROOT)) {
  console.error(`AUDIT-DECK: FAIL — clawdia-presence not found at ${CLAWDIA_ROOT} (set CLAWDIA_ROOT to override)`);
  process.exit(1);
}

// --- Claim 1: every panel FREIGHT-OS-CANON.md names for the Deck actually exists on disk. ---
// Panel names taken verbatim from FREIGHT-OS-CANON.md §P6 ("Real panels on disk: ...").
const CANON_PANELS = [
  'DialQueue', 'GuidedCallCard', 'LeadFeed', 'NextBestAction', 'Scoreboard', 'DeskPnl',
  'CarrierBench', 'LanePricer', 'MetersPanel', 'CadenceSignals', 'CommandPalette',
  'PhonePager', 'TVMode', 'EntityGraph', 'KeysStatus', 'TopTicker',
];
const panelsOnDisk = existsSync(PANELS_DIR)
  ? new Set(readdirSync(PANELS_DIR).filter((f) => f.endsWith('.tsx')).map((f) => f.replace(/\.tsx$/, '')))
  : new Set();
const missingPanels = CANON_PANELS.filter((p) => !panelsOnDisk.has(p));
record(
  'Claim 1: canon-named Deck panels exist as files',
  missingPanels.length === 0,
  missingPanels.length === 0
    ? `all ${CANON_PANELS.length} panels found in ${PANELS_DIR}`
    : `missing: ${missingPanels.join(', ')} (checked ${PANELS_DIR})`,
);

// The canon also claims a closer/ and film/ mode alongside the panel grid.
const closerFilmOk = existsSync(join(FREIGHT_APP, 'closer')) && existsSync(FILM_DIR);
record(
  'Claim 1b: closer/ and film/ cockpit modes exist',
  closerFilmOk,
  closerFilmOk ? `${join(FREIGHT_APP, 'closer')} and ${FILM_DIR} both present` : 'closer/ or film/ directory missing',
);

// --- Claim 2: freight-execution/contracts.ts defines authority-gated action types. ---
// Canon text: actions {call,email,linkedin,whatsapp}; operating_state; authority-gated
// reason_codes (authority_missing/invalid/not_effective/expired/revoked, scope_denied,
// runtime_unavailable). Checked as literal source tokens, not just file-exists.
let contractsSrc = '';
let contractsReadable = existsSync(CONTRACTS_PATH);
if (contractsReadable) contractsSrc = readFileSync(CONTRACTS_PATH, 'utf8');

const REQUIRED_ACTIONS = ['call', 'email', 'linkedin', 'whatsapp'];
const REQUIRED_REASON_CODES = [
  'authority_missing', 'authority_invalid', 'authority_expired', 'authority_revoked',
  'scope_denied', 'runtime_unavailable',
];
const hasActionsArray = /ACTIONS\s*=\s*\[[^\]]*\]/.test(contractsSrc)
  && REQUIRED_ACTIONS.every((a) => contractsSrc.includes(`"${a}"`));
const hasReasonCodes = REQUIRED_REASON_CODES.every((r) => contractsSrc.includes(`"${r}"`));
const hasOperatingState = contractsSrc.includes('OPERATING_STATES')
  && contractsSrc.includes('ready_to_prospect') && contractsSrc.includes('not_ready');
const claim2Pass = contractsReadable && hasActionsArray && hasReasonCodes && hasOperatingState;
record(
  'Claim 2: contracts.ts defines authority-gated multi-channel action types',
  claim2Pass,
  !contractsReadable
    ? `${CONTRACTS_PATH} not found`
    : `ACTIONS{call,email,linkedin,whatsapp}=${hasActionsArray}, ` +
      `reason_codes{${REQUIRED_REASON_CODES.join('|')}}=${hasReasonCodes}, ` +
      `operating_state{not_ready,ready_to_prospect}=${hasOperatingState}`,
);

// --- Claim 3: a genuine bilingual EN/ES script pattern exists in the execution/film layer. ---
// "Genuine" means more than a stray "es"/"en" substring: a BilingualText-shaped type or object
// (paired en/es fields) actually consumed by a component that renders both languages.
function scanForBilingualPattern(dir) {
  if (!existsSync(dir)) return { found: false, files: [] };
  const hits = [];
  for (const f of readdirSync(dir)) {
    if (!/\.(ts|tsx)$/.test(f)) continue;
    const p = join(dir, f);
    const src = readFileSync(p, 'utf8');
    const hasPairedField = /\ben:\s*string/.test(src) && /\bes:\s*string/.test(src);
    const hasBilingualTypeRef = /BilingualText/.test(src);
    const rendersBoth = /\.en\b[\s\S]{0,400}\.es\b|\.es\b[\s\S]{0,400}\.en\b/.test(src);
    if ((hasPairedField || hasBilingualTypeRef) && rendersBoth) hits.push(f);
  }
  return { found: hits.length > 0, files: hits };
}
const execHits = scanForBilingualPattern(EXEC_DIR);
const filmHits = scanForBilingualPattern(FILM_DIR);
const panelsHits = scanForBilingualPattern(PANELS_DIR); // GuidedCallCard.tsx is the canon-cited script surface
const contractsDefinesType = /type\s+BilingualText\s*=\s*\{\s*en:\s*string;\s*es:\s*string;?\s*\}/.test(contractsSrc);
const claim3Pass = contractsDefinesType && (execHits.found || filmHits.found || panelsHits.found);
record(
  'Claim 3: bilingual EN/ES script pattern present in execution/film layer',
  claim3Pass,
  `BilingualText type in contracts.ts=${contractsDefinesType}; ` +
    `execution/ hits=[${execHits.files.join(', ')}]; film/ hits=[${filmHits.files.join(', ')}]; ` +
    `panels/ hits=[${panelsHits.files.join(', ')}] (guided-call script surface the canon cites)`,
);

// --- report ---
console.log('AUDIT-DECK — FREIGHT-OS-CANON.md P6 "Deck" claims vs. clawdia-presence source');
console.log(`root: ${CLAWDIA_ROOT}\n`);
let anyFail = false;
for (const { claim, pass, detail } of results) {
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${claim}`);
  console.log(`       ${detail}`);
  if (!pass) anyFail = true;
}
console.log('');
if (anyFail) {
  console.error(`AUDIT-DECK: FAIL — ${results.filter((r) => !r.pass).length} claim(s) falsified`);
  process.exit(1);
} else {
  console.log(`AUDIT-DECK: PASS — all ${results.length} claims hold against the real source`);
  process.exit(0);
}
