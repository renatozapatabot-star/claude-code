#!/usr/bin/env node
// canon-check — structural + content law of FREIGHT-OS-CANON.md (§5.3). Zero-dep. Exit 0/1.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
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
const allIds = new Set(blocks.map(b => b.id));
for (const { id, body } of blocks) {
  if (!body.includes('**Acceptance:**')) fail(`${id} missing Acceptance`);
  if (!body.includes('**Evidence:**')) fail(`${id} missing Evidence`);
  if (id.startsWith('WO-')) {
    if (!body.includes('**Founder:**')) fail(`${id} missing Founder action`);
    if (!body.includes('**Prep-now:**')) fail(`${id} missing Prep-now (§2)`);
    // De-deferral: every WO's Prep-now must cite an executable §3 item home that actually exists
    // (shape-match alone isn't enough — v3.7 audit found this let a dangling/renamed id slip through).
    const prep = body.slice(body.indexOf('**Prep-now:**'));
    const prepIds = [...prep.matchAll(/\[(P\d-W\d-\d{2}[ab]?|W\d-\d{2})\]/g)].map(m => m[1]);
    if (prepIds.length === 0) fail(`${id} Prep-now cites no [P#-W#-##] executable home (§2)`);
    else if (!prepIds.some(pid => allIds.has(pid))) fail(`${id} Prep-now cites ${prepIds.join(',')} but none resolve to a real parsed item (§2)`);
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
    if (!/`(traficos|documents|pedimentos|clients|accounting|inventory|locations|fracciones|expedientes|entradas|quotes)`/.test(row))
      fail(`THE-DECK row names no Supabase table: "${row.trim().slice(0, 50)}"`);
  }
}

// 9. Resource law: every non-utility §1.2 skill must appear in a §3 item or a registered spec doc.
const UTILITY = new Set(['pdf', 'docx', 'xlsx', 'pptx', 'loop', 'update-config', 'artifact-design', 'morning', 'casa-zapata-project-manager']);
const SKILLS = ['email-ingestion', 'document-checklist-validator', 'compliance-alert-analyzer', 'crossing-intelligence',
  'dispatch-coordinator', 'warehouse-tracker', 'anomaly-detector', 'demand-forecaster', 'cost-optimizer',
  'rate-quote-generator', 'financial-summary', 'new-client-onboarding', 'portal-builder', 'usmca-certificate-generator',
  'mve-compliance', 'oca-opinion', 'evco-audit-report', 'client-communication-writer', 'whisper-transcriber',
  'cruz-build-intelligence', 'cruz-100-critic', 'cruz-complete-frontend', 'dataviz', 'operator-intel', 'skill-creator'];
const specTexts = (pathsBlock ? pathsBlock[1].split('\n').map(s => s.trim()).filter(p => /\.md$/.test(p)) : [])
  .filter(p => existsSync(join(root, p))).map(p => readFileSync(join(root, p), 'utf8')).join('\n');
const section3 = text.slice(text.indexOf('## §3'));
for (const sk of SKILLS) {
  if (UTILITY.has(sk)) continue;
  if (!section3.includes(sk) && !specTexts.includes(sk)) fail(`resource law: skill "${sk}" is wired to no §3 item or spec doc`);
}

// 10. POLICY law: a POLICY.md row citing a named CONST in a source file must have its ratified
// value actually present in that file — not just the file existing (a prior research round found
// nothing checked this; a POLICY.md row can drift from the code it claims to pin).
// Kept deliberately pragmatic: literal-match first, then a tiny safe arithmetic evaluator (no
// eval/Function) for the common `N * M * K` ms-constant shape, converted to human duration forms
// (Ns / Nmin / Nh) since that's how POLICY.md actually states most of them.
function safeEvalArithmetic(expr) {
  const cleaned = expr.replace(/_/g, '').trim();
  if (!/^[\d\s+\-*/().]+$/.test(cleaned)) return null;
  const tokens = cleaned.match(/\d+(?:\.\d+)?|[+\-*/()]/g);
  if (!tokens) return null;
  let pos = 0;
  const parseFactor = () => {
    if (tokens[pos] === '(') { pos++; const v = parseExpr(); pos++; return v; }
    const t = tokens[pos++];
    return t === undefined ? NaN : Number(t);
  };
  const parseTerm = () => {
    let v = parseFactor();
    while (tokens[pos] === '*' || tokens[pos] === '/') { const op = tokens[pos++]; const rhs = parseFactor(); v = op === '*' ? v * rhs : v / rhs; }
    return v;
  };
  const parseExpr = () => {
    let v = parseTerm();
    while (tokens[pos] === '+' || tokens[pos] === '-') { const op = tokens[pos++]; const rhs = parseTerm(); v = op === '+' ? v + rhs : v - rhs; }
    return v;
  };
  const result = parseExpr();
  return (pos === tokens.length && Number.isFinite(result)) ? result : null;
}
function msHumanForms(n) {
  const forms = new Set([String(n), String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '_')]);
  if (n % 1000 === 0) forms.add(`${n / 1000}s`);
  if (n % 60000 === 0) { forms.add(`${n / 60000}min`); forms.add(`${n / 60000} min`); }
  if (n % 3600000 === 0) forms.add(`${n / 3600000}h`);
  return [...forms];
}
const policyPaths = (pathsBlock ? pathsBlock[1].split('\n').map(s => s.trim()).filter(Boolean) : [])
  .filter(p => /POLICY\.md$/i.test(p));
for (const pPath of policyPaths) {
  const pFull = join(root, pPath);
  if (!existsSync(pFull)) continue; // already caught by check 7
  const pDir = dirname(pFull);
  const rows = readFileSync(pFull, 'utf8').split('\n')
    .filter(l => /^\|/.test(l) && !/^\|\s*-+\s*\|/.test(l) && !/^\|\s*Policy\s*\|/i.test(l));
  for (const row of rows) {
    let cells = row.split('|').map(c => c.trim());
    if (cells[0] === '') cells = cells.slice(1);
    if (cells[cells.length - 1] === '') cells = cells.slice(0, -1);
    if (cells.length < 3) continue;
    const [policyName, defaultCell, sourceCell] = cells;
    const pathMatch = sourceCell.match(/`([^`]+)`/);
    if (!pathMatch) continue; // row cites no source file (e.g. "alert rail") — not this check's job
    const relSrc = pathMatch[1];
    const remainder = sourceCell.slice(sourceCell.indexOf(pathMatch[0]) + pathMatch[0].length);
    const constNames = [...remainder.matchAll(/\b([A-Z][A-Z0-9_]{2,})\b/g)].map(m => m[1]);
    if (constNames.length === 0) continue; // row names no constant (e.g. textual policy) — not this check's job
    const srcFull = join(pDir, relSrc);
    if (!existsSync(srcFull)) { fail(`POLICY row "${policyName}": source file missing ${relSrc}`); continue; }
    const srcBody = readFileSync(srcFull, 'utf8');
    for (const cn of constNames) {
      if (!new RegExp(`\\b${cn}\\b`).test(srcBody)) { fail(`POLICY row "${policyName}": constant ${cn} not found in ${relSrc}`); continue; }
      const declMatch = srcBody.match(new RegExp(`\\b${cn}\\s*=\\s*([^;\\n]+)`));
      if (!declMatch) { fail(`POLICY row "${policyName}": no declaration found for ${cn} in ${relSrc}`); continue; }
      const rhs = declMatch[1].trim();
      const quoted = [...rhs.matchAll(/'([^']+)'|"([^"]+)"/g)].map(m => m[1] ?? m[2]);
      if (quoted.length > 0) {
        for (const q of quoted) if (!defaultCell.includes(q)) fail(`POLICY row "${policyName}": ${cn} value "${q}" (from ${relSrc}) not reflected in POLICY.md's stated default "${defaultCell}"`);
        continue;
      }
      const num = safeEvalArithmetic(rhs);
      if (num === null) { fail(`POLICY row "${policyName}": ${cn}'s value (${rhs}) in ${relSrc} could not be verified against POLICY.md's stated default — neither a literal nor a simple arithmetic match`); continue; }
      const forms = msHumanForms(num);
      const lowerDefault = defaultCell.toLowerCase();
      if (!forms.some(f => lowerDefault.includes(f.toLowerCase()))) fail(`POLICY row "${policyName}": ${cn} = ${rhs} (${num}) in ${relSrc} does not match POLICY.md's stated default "${defaultCell}"`);
    }
  }
}

// 11. "audit fix" comment law: a source file citing an inline "vX.Y audit fix" comment must have a
// sibling test file that exists and actually has tests — a prior research round found nothing
// verified this, so a comment claiming a fix landed could sit next to a stale/empty test file.
function siblingTestPath(relPath) {
  if (relPath.includes('/src/')) return relPath.replace('/src/', '/test/').replace(/\.mjs$/, '.test.mjs');
  return relPath.replace(/\.mjs$/, '.test.mjs');
}
for (const dir of ['supertito/src', 'design/reference']) {
  const dirFull = join(root, dir);
  if (!existsSync(dirFull)) continue;
  for (const entry of readdirSync(dirFull)) {
    if (!entry.endsWith('.mjs') || entry.endsWith('.test.mjs')) continue;
    const relPath = `${dir}/${entry}`;
    const body = readFileSync(join(root, relPath), 'utf8');
    if (!/audit fix/i.test(body)) continue;
    const testRel = siblingTestPath(relPath);
    const testFull = join(root, testRel);
    if (!existsSync(testFull)) { fail(`"${relPath}" has an audit-fix comment but its sibling test file ${testRel} does not exist`); continue; }
    const testCount = (readFileSync(testFull, 'utf8').match(/\btest\(/g) || []).length;
    if (testCount === 0) fail(`"${relPath}" has an audit-fix comment but its sibling test file ${testRel} has zero tests`);
  }
}

if (failures.length) {
  console.error(`CANON-CHECK: FAIL — ${failures.length} violation(s)`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log(`CANON-CHECK: PASS — ${blocks.length} items (${[...seen].filter(i => i.startsWith('WO-')).length} WOs), content-checked, founder-override present, all paths real, POLICY.md constants verified, audit-fix comments test-backed`);
