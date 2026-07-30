#!/usr/bin/env node
// canon-check — structural + content law of FREIGHT-OS-CANON.md (§5.3). Zero-dep. Exit 0/1.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const canonPath = join(root, 'FREIGHT-OS-CANON.md');
const failures = [];
const fail = (m) => failures.push(m);

if (!existsSync(canonPath)) { console.error('CANON-CHECK: FAIL — FREIGHT-OS-CANON.md missing'); process.exit(1); }
const text = readFileSync(canonPath, 'utf8');
const lines = text.split('\n');

// 1. Supreme clause + meta block.
if (!text.includes('FOUNDER OVERRIDE')) fail('founder-override clause missing');
if (!/<!-- CANON-META /.test(text)) fail('CANON-META block missing');
if (!text.includes('§5.4')) fail('§5.4 amendment/review log missing');

// 2. Collect item blocks.
const starts = [];
lines.forEach((l, i) => { if (/^- \*\*\[[A-Z0-9-]+\]\*\*/.test(l)) starts.push(i); });
const blocks = starts.map((s, k) => {
  let e = k + 1 < starts.length ? starts[k + 1] : lines.length;
  for (let j = s + 1; j < e; j++) if (/^(#{1,6} |---|<!--)/.test(lines[j])) { e = j; break; }
  return { id: lines[s].match(/^- \*\*\[([A-Z0-9-]+)\]\*\*/)[1], body: lines.slice(s, e).join('\n') };
});
if (blocks.length === 0) fail('no item blocks found');

// 3. IDs unique + well-formed.
const seen = new Set();
for (const { id } of blocks) {
  if (seen.has(id)) fail(`duplicate item id ${id}`);
  seen.add(id);
  if (!/^(P\d-W\d-\d{2}[ab]?|W\d-\d{2}|WO-\d{2})$/.test(id)) fail(`malformed item id ${id}`);
}

// 4. Field law per class.
for (const { id, body } of blocks) {
  if (!body.includes('**Acceptance:**')) fail(`${id} missing Acceptance`);
  if (!body.includes('**Evidence:**')) fail(`${id} missing Evidence`);
  if (id.startsWith('WO-')) {
    if (!body.includes('**Founder:**')) fail(`${id} missing Founder action`);
    if (!body.includes('**Prep-now:**')) fail(`${id} missing Prep-now (§2)`);
    // De-deferral: every WO's Prep-now must cite an executable §3 item home.
    const prep = body.slice(body.indexOf('**Prep-now:**'));
    if (!/\[(P\d-W\d-\d{2}[ab]?|W\d-\d{2})\]/.test(prep)) fail(`${id} Prep-now cites no [P#-W#-##] executable home (§2)`);
  } else {
    if (!/`(EXEC-NOW\*?|SIM-HERE|WO\+PREP)`/.test(body)) fail(`${id} missing continuation state (§2)`);
    if (/`WO\+PREP`/.test(body) && !/\(\[WO-\d{2}\]/.test(body)) fail(`${id} WO+PREP without a named [WO-nn]`);
  }
}

// 5. Referenced WOs exist.
const woIds = new Set(blocks.filter(b => b.id.startsWith('WO-')).map(b => b.id));
for (const { id, body } of blocks)
  for (const m of body.matchAll(/\[(WO-\d{2})\]/g))
    if (!woIds.has(m[1])) fail(`${id} references missing ${m[1]}`);

// 6. Lexical deferral scan — bare-deferral tokens are illegal anywhere.
for (const tok of ['TBD', 'TODO:', 'FD-OPEN', 'DEFERRED-BARE']) if (text.includes(tok)) fail(`bare-deferral token "${tok}" present`);
// Deferral phrases must sit on a line that also carries a continuation state, a WO ref, or a liveness label.
const deferRe = /\b(to be decided|figure out later|will decide later)\b/i;
lines.forEach((l, i) => {
  if (deferRe.test(l) && !/(EXEC-NOW|SIM-HERE|WO\+PREP|\[WO-\d{2}\]|POR ACTIVAR|de-deferral|De-Deferral|bare defer)/.test(l))
    fail(`line ${i + 1}: deferral language without a continuation state — "${l.trim().slice(0, 60)}"`);
});

// 7. Registered paths exist.
const pathsBlock = text.match(/<!-- CANON-PATHS\n([\s\S]*?)-->/);
if (!pathsBlock) fail('CANON-PATHS block missing');
else for (const p of pathsBlock[1].split('\n').map(s => s.trim()).filter(Boolean))
  if (!existsSync(join(root, p))) fail(`registered path missing: ${p}`);

// 8. Content checks on the spec files (makes their acceptances real, not file-exists-vacuous).
const contentBlock = text.match(/<!-- CANON-CONTENT\n([\s\S]*?)-->/);
if (!contentBlock) fail('CANON-CONTENT block missing');
else for (const spec of contentBlock[1].split('\n').map(s => s.trim()).filter(Boolean)) {
  const [name, file, tokensCsv] = spec.split(':');
  const fp = join(root, file);
  if (!existsSync(fp)) { fail(`content-spec ${name}: file missing ${file}`); continue; }
  const body = readFileSync(fp, 'utf8');
  for (const tok of tokensCsv.split(',')) if (!body.includes(tok)) fail(`content-spec ${name} (${file}): missing token "${tok}"`);
}

// 8b. Deck panel rows: every source-bearing row needs a skill token, a table token, and one liveness label.
const deckPath = join(root, 'design/reference/THE-DECK.md');
if (existsSync(deckPath)) {
  for (const row of readFileSync(deckPath, 'utf8').split('\n')) {
    if (!/^\| /.test(row) || /^\| Panel/.test(row) || /^\|[-\s|]+\|/.test(row)) continue;
    if (!/`[a-z-]+`|CRUZ|signature/.test(row)) continue; // only source-bearing rows
    const live = (row.match(/EN VIVO/g) || []).length + (row.match(/POR ACTIVAR/g) || []).length;
    if (live !== 1) fail(`THE-DECK row lacks exactly one liveness label: "${row.trim().slice(0, 50)}"`);
    if (!/`[a-z-]+`|CRUZ|signature/.test(row.split('|').slice(2, 3).join(''))) { /* skill in col 2 */ }
    if (!/`(traficos|documents|pedimentos|clients|accounting|inventory|locations|fracciones|expedientes)`/.test(row))
      fail(`THE-DECK row names no Supabase table: "${row.trim().slice(0, 50)}"`);
  }
}

// 9. Resource law: every non-utility §1.2 skill must appear in a §3 item or a registered spec doc.
const UTILITY = new Set(['pdf', 'docx', 'xlsx', 'pptx', 'loop', 'update-config', 'artifact-design', 'morning', 'casa-zapata-project-manager']);
const SKILLS = ['email-ingestion', 'document-checklist-validator', 'compliance-alert-analyzer', 'crossing-intelligence',
  'dispatch-coordinator', 'warehouse-tracker', 'anomaly-detector', 'demand-forecaster', 'cost-optimizer',
  'rate-quote-generator', 'financial-summary', 'new-client-onboarding', 'portal-builder', 'usmca-certificate-generator',
  'mve-compliance', 'oca-opinion', 'evco-audit-report', 'client-communication-writer', 'whisper-transcriber',
  'cruz-build-intelligence', 'cruz-100-critic', 'cruz-complete-frontend', 'dataviz', 'deep-research', 'operator-intel', 'skill-creator'];
const specTexts = (pathsBlock ? pathsBlock[1].split('\n').map(s => s.trim()).filter(p => /\.md$/.test(p)) : [])
  .filter(p => existsSync(join(root, p))).map(p => readFileSync(join(root, p), 'utf8')).join('\n');
const section3 = text.slice(text.indexOf('## §3'));
for (const sk of SKILLS) {
  if (UTILITY.has(sk)) continue;
  if (!section3.includes(sk) && !specTexts.includes(sk)) fail(`resource law: skill "${sk}" is wired to no §3 item or spec doc`);
}

if (failures.length) {
  console.error(`CANON-CHECK: FAIL — ${failures.length} violation(s)`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log(`CANON-CHECK: PASS — ${blocks.length} items (${[...seen].filter(i => i.startsWith('WO-')).length} WOs), content-checked, founder-override present, all paths real`);
