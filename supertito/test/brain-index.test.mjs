// Tests for supertito/src/brain-index.mjs — [P8-W2-01], the real second-brain query layer.
//
// Two kinds of coverage on purpose:
//  1. Unit tests against inline SIM/fixture notes (labeled SIM below) — hermetic, no dependency on
//     any external repo being present in whatever environment runs this suite.
//  2. One integration test against the REAL `aguila-brain` vault at /workspace/aguila-brain — it
//     reads real files (never writes) and skips itself (not a false pass) if that read-only external
//     repo isn't mounted in this environment, so this suite is honest in both worlds.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  categoryForPath,
  parseVaultNote,
  buildBrainDoc,
  tokenize,
  buildBrainIndex,
  searchBrainIndex,
  loadVaultDocs,
} from '../src/brain-index.mjs';
import { resolveBrainAccess, answerFromBrain } from '../src/brain-access.mjs';

// ---- categoryForPath -------------------------------------------------------------------------

test('categoryForPath: maps each real vault folder to its documented category', () => {
  assert.deepEqual(categoryForPath('01-AGUILA/00-FREIGHT/Overview.md'), { category: 'ops' });
  assert.deepEqual(categoryForPath('01-AGUILA/01-Adjunto/Overview.md'), { category: 'ops' });
  assert.deepEqual(categoryForPath('01-AGUILA/02-CRUZ/Overview.md'), { category: 'broker' });
  assert.deepEqual(categoryForPath('01-AGUILA/04-Canon/Entity-Boundary.md'), { category: 'canon' });
  assert.deepEqual(
    categoryForPath('01-AGUILA/05-Daily/2026-07-19.md'),
    { category: 'daily', principalOnly: true },
  );
  assert.deepEqual(categoryForPath('01-AGUILA/00-Overview.md'), { category: 'canon' });
  assert.ok(categoryForPath('01-AGUILA/00-FREIGHT/Overview.md'), 'tolerates the 01-AGUILA/ prefix');
  assert.deepEqual(categoryForPath('00-FREIGHT/Overview.md'), { category: 'ops' }, 'also works bare (no 01-AGUILA/ prefix)');
});

test('categoryForPath: mixed-tenant Clients roster is employee-scoped (ops), not client-tenant-scoped', () => {
  // Ground truth: today's real 03-Clients/Overview.md names EVCO, Duratech, Milacron, and Foam
  // Supplies all in one file. Assigning it any single client's tenant would leak the other three.
  const result = categoryForPath('01-AGUILA/03-Clients/Overview.md');
  assert.deepEqual(result, { category: 'ops' });
  assert.equal(result.tenant, undefined);
});

test('categoryForPath: recognizes a future per-tenant nested path and extracts the tenant', () => {
  // SIM — the real vault has no per-client subfolder yet; this is the shape it would need for a
  // genuinely tenant-scoped note to exist, matching brain-access.test.mjs's own SIM fixture ids
  // (e.g. 'aguila-brain:03-Clients/EVCO/trafico-9931.md').
  assert.deepEqual(
    categoryForPath('01-AGUILA/03-Clients/EVCO/trafico-9931.md'),
    { category: 'client-doc', tenant: 'EVCO' },
  );
});

test('categoryForPath: excludes Obsidian boilerplate, dotfiles, and non-markdown', () => {
  assert.equal(categoryForPath('Welcome.md'), null);
  assert.equal(categoryForPath('01-AGUILA/Welcome.md'), null);
  assert.equal(categoryForPath('.obsidian/app.json'), null);
  assert.equal(categoryForPath('.git/HEAD'), null);
  assert.equal(categoryForPath('01-AGUILA/00-FREIGHT/notes.txt'), null);
  assert.equal(categoryForPath(''), null);
  assert.equal(categoryForPath(undefined), null);
});

test('categoryForPath: unrecognized folder returns null rather than guessing a category', () => {
  assert.equal(categoryForPath('01-AGUILA/99-Unknown/whatever.md'), null);
});

// ---- parseVaultNote ---------------------------------------------------------------------------

const SIM_NOTE = `---
tags: [freight, overview]
source: some-source
---

# Heading

First real paragraph of the note, mentioning Money Employment and verified cash.

Second paragraph.
`;

test('parseVaultNote: extracts flat scalar + array frontmatter and leaves the body intact', () => {
  const { frontmatter, body } = parseVaultNote(SIM_NOTE);
  assert.deepEqual(frontmatter.tags, ['freight', 'overview']);
  assert.equal(frontmatter.source, 'some-source');
  assert.match(body, /^# Heading/);
  assert.match(body, /Money Employment/);
});

test('parseVaultNote: a note with no frontmatter block returns it as the whole body', () => {
  const { frontmatter, body } = parseVaultNote('# No frontmatter here\n\nJust text.');
  assert.deepEqual(frontmatter, {});
  assert.match(body, /Just text/);
});

test('parseVaultNote: an unterminated --- block is treated as no frontmatter, not a crash', () => {
  const { frontmatter, body } = parseVaultNote('---\ntags: [a]\n\nno closing marker');
  assert.deepEqual(frontmatter, {});
  assert.match(body, /no closing marker/);
});

test('parseVaultNote rejects non-string input', () => {
  assert.throws(() => parseVaultNote(null), TypeError);
});

// ---- tokenize -----------------------------------------------------------------------------------

test('tokenize: lowercases, splits on non-alphanumerics, drops stopwords and 1-char tokens', () => {
  assert.deepEqual(tokenize('The MVE-Status is not clean.'), ['mve', 'status', 'clean']);
});

test('tokenize: tolerates non-string input rather than throwing', () => {
  assert.deepEqual(tokenize(undefined), []);
  assert.deepEqual(tokenize(null), []);
});

// ---- buildBrainDoc --------------------------------------------------------------------------

test('buildBrainDoc: builds a BrainDoc-shaped record with category, snippet, tokens', () => {
  const doc = buildBrainDoc('01-AGUILA/00-FREIGHT/Overview.md', SIM_NOTE);
  assert.equal(doc.id, '01-AGUILA/00-FREIGHT/Overview.md');
  assert.equal(doc.category, 'ops');
  assert.equal(doc.principalOnly, undefined);
  assert.match(doc.snippet, /Money Employment/);
  assert.ok(doc.tokens.includes('money'));
  assert.ok(doc.tokens.includes('employment'));
});

test('buildBrainDoc: daily notes carry principalOnly: true', () => {
  const doc = buildBrainDoc('01-AGUILA/05-Daily/2026-07-19.md', SIM_NOTE);
  assert.equal(doc.category, 'daily');
  assert.equal(doc.principalOnly, true);
});

test('buildBrainDoc: returns null for an excluded path instead of a partial doc', () => {
  assert.equal(buildBrainDoc('Welcome.md', 'anything'), null);
});

// ---- buildBrainIndex + searchBrainIndex ------------------------------------------------------

// SIM fixtures — three small invented notes, not real vault content, sized to exercise ranking.
const DOC_FREIGHT = buildBrainDoc(
  '01-AGUILA/00-FREIGHT/Overview.md',
  '---\ntags: [freight]\n---\n\nMoney Employment loop targets verified calls and verified cash via Norfleet settlement.',
);
const DOC_CRUZ = buildBrainDoc(
  '01-AGUILA/02-CRUZ/Overview.md',
  '---\ntags: [cruz]\n---\n\nCRUZ is the EVCO customs portal. A licensed human owns the final customs act.',
);
const DOC_CANON = buildBrainDoc(
  '01-AGUILA/04-Canon/Entity-Boundary.md',
  '---\ntags: [canon]\n---\n\nAdjunto is the sole public brand. CRUZ is the EVCO portal only, never blurred with FREIGHT.',
);
const FIXTURE_DOCS = [DOC_FREIGHT, DOC_CRUZ, DOC_CANON];

test('buildBrainIndex + searchBrainIndex: ranks the doc containing the query term above unrelated docs', () => {
  const index = buildBrainIndex(FIXTURE_DOCS);
  const results = searchBrainIndex(index, 'Money Employment verified cash');
  assert.ok(results.length >= 1);
  assert.equal(results[0].id, DOC_FREIGHT.id);
  assert.match(results[0].snippet, /Money Employment/);
});

test('searchBrainIndex: a query naming CRUZ ranks the CRUZ doc first even though Canon also mentions CRUZ', () => {
  const index = buildBrainIndex(FIXTURE_DOCS);
  const results = searchBrainIndex(index, 'licensed human customs act');
  assert.equal(results[0].id, DOC_CRUZ.id);
});

test('searchBrainIndex: zero token overlap returns an empty array, never a padded/irrelevant list', () => {
  const index = buildBrainIndex(FIXTURE_DOCS);
  const results = searchBrainIndex(index, 'xyzzy nonexistent gibberish');
  assert.deepEqual(results, []);
});

test('searchBrainIndex: respects topK', () => {
  const index = buildBrainIndex(FIXTURE_DOCS);
  const results = searchBrainIndex(index, 'customs CRUZ FREIGHT Adjunto', { topK: 1 });
  assert.equal(results.length, 1);
});

test('searchBrainIndex: result shape feeds answerFromBrain directly (no adapter needed)', () => {
  const index = buildBrainIndex(FIXTURE_DOCS);
  const [top] = searchBrainIndex(index, 'Money Employment');
  const founder = { role: 'founder' };
  const result = answerFromBrain('Money Employment', [top], founder);
  assert.deepEqual(result.cited, [DOC_FREIGHT.id]);
  assert.match(result.answer, /Money Employment/);
});

test('searchBrainIndex rejects a raw docs array instead of a real index', () => {
  assert.throws(() => searchBrainIndex({ docsById: {} }, 'q'), TypeError);
  assert.throws(() => buildBrainIndex('not-an-array'), TypeError);
});

test('searchBrainIndex rejects an empty query', () => {
  const index = buildBrainIndex(FIXTURE_DOCS);
  assert.throws(() => searchBrainIndex(index, ''), TypeError);
});

// ---- end-to-end honesty: index -> resolveBrainAccess denies what it should ---------------------

test('end-to-end: an employee whose roleScope does not match the matched doc is denied, not shown a wrong-scope answer', () => {
  const index = buildBrainIndex(FIXTURE_DOCS);
  const matched = searchBrainIndex(index, 'licensed human customs act'); // -> DOC_CRUZ, category 'broker'
  const warehouseEmployee = { role: 'employee', roleScope: 'warehouse' };
  assert.equal(resolveBrainAccess(warehouseEmployee, matched[0]).allow, false);
  const result = answerFromBrain('licensed human customs act', matched, warehouseEmployee);
  assert.deepEqual(result, { answer: 'not in the brain yet', cited: [] });
});

test('end-to-end: a client role is denied every doc in the current real vault (all employee/principal-scoped)', () => {
  const index = buildBrainIndex(FIXTURE_DOCS);
  const matched = searchBrainIndex(index, 'CRUZ FREIGHT Adjunto customs');
  const client = { role: 'client', tenant: 'EVCO' };
  const result = answerFromBrain('CRUZ FREIGHT Adjunto customs', matched, client);
  assert.deepEqual(result, { answer: 'not in the brain yet', cited: [] });
});

// ---- real vault integration (skips itself honestly if the external repo isn't mounted here) -----

const REAL_VAULT_DIR = '/workspace/aguila-brain';

test('loadVaultDocs + real vault: indexes real content and answers a real query with a real citation', { skip: !fs.existsSync(REAL_VAULT_DIR) && 'aguila-brain not mounted in this environment' }, async () => {
  const docs = await loadVaultDocs(REAL_VAULT_DIR);
  assert.ok(docs.length > 0, 'expected at least one real indexable note');
  assert.ok(!docs.some((d) => d.id.endsWith('Welcome.md')), 'Obsidian boilerplate must not be indexed');

  const index = buildBrainIndex(docs);
  const matched = searchBrainIndex(index, 'Money Employment verified calls Norfleet');
  assert.ok(matched.length > 0, 'expected the real FREIGHT overview note to match this query');

  const founder = { role: 'founder' };
  const result = answerFromBrain('Money Employment verified calls Norfleet', matched, founder);
  assert.notDeepEqual(result, { answer: 'not in the brain yet', cited: [] });
  assert.ok(result.cited.length > 0);
});

test('loadVaultDocs: a nonexistent vault directory returns an empty array, never a crash', async () => {
  const docs = await loadVaultDocs('/nonexistent/path/does-not-exist-anywhere');
  assert.deepEqual(docs, []);
});

test('loadVaultDocs rejects malformed input', async () => {
  await assert.rejects(() => loadVaultDocs(''), TypeError);
  await assert.rejects(() => loadVaultDocs(undefined), TypeError);
});

// ---- denial: no send/dispatch/reply-capable export ---------------------------------------------

test('denial: module exposes no send/dispatch/reply-capable export, and loadVaultDocs never writes', async () => {
  const mod = await import('../src/brain-index.mjs');
  const exportNames = Object.keys(mod);
  assert.deepEqual(
    new Set(exportNames),
    new Set([
      'categoryForPath', 'parseVaultNote', 'buildBrainDoc', 'tokenize',
      'buildBrainIndex', 'searchBrainIndex', 'loadVaultDocs',
    ]),
  );
  assert.ok(!exportNames.some((n) => /send|dispatch|reply/i.test(n)), 'no send-capable export exists');
  assert.match(mod.loadVaultDocs.toString(), /readdir|readFile/, 'the only I/O is read-only fs calls');
  assert.ok(!/writeFile|rm\(|unlink|appendFile/.test(mod.loadVaultDocs.toString()), 'loadVaultDocs never writes');
});
