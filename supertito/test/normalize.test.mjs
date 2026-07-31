// Tests for supertito/src/normalize.mjs — the shared normalize-key helper extracted from three
// independent hand-rolled copies (correlate.mjs entity grouping, brain-access.mjs tenant matching,
// cortana.mjs extractEntity). No SIM/fixture data needed — this is a pure string function.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeKey } from '../src/normalize.mjs';

test('normalizeKey: trims and lowercases', () => {
  assert.equal(normalizeKey('  MAFESA  '), 'mafesa');
  assert.equal(normalizeKey('Mafesa'), 'mafesa');
  assert.equal(normalizeKey('MAFESA'), 'mafesa');
});

test('normalizeKey: null and undefined both collapse to empty string, never throw', () => {
  assert.equal(normalizeKey(null), '');
  assert.equal(normalizeKey(undefined), '');
});

test('normalizeKey: already-empty or whitespace-only input collapses to empty string', () => {
  assert.equal(normalizeKey(''), '');
  assert.equal(normalizeKey('   '), '');
});

test('normalizeKey: idempotent — normalizing an already-normalized key is a no-op', () => {
  const once = normalizeKey('  EVCO ');
  assert.equal(normalizeKey(once), once);
});

test('normalizeKey: two differently-cased/whitespaced strings for the same real entity collapse to the same key', () => {
  assert.equal(normalizeKey('MAFESA'), normalizeKey('Mafesa'));
  assert.equal(normalizeKey(' MAFESA '), normalizeKey('mafesa'));
});

test('normalizeKey: distinct entities never collapse into the same key', () => {
  assert.notEqual(normalizeKey('EVCO'), normalizeKey('MAFESA'));
});

test('normalizeKey: non-string input is coerced rather than throwing', () => {
  assert.equal(normalizeKey(42), '42');
});

test('denial: module exposes no send/dispatch/reply-capable export', async () => {
  const mod = await import('../src/normalize.mjs');
  const exportNames = Object.keys(mod);
  assert.deepEqual(exportNames, ['normalizeKey']);
  assert.ok(!exportNames.some((n) => /send|dispatch|reply/i.test(n)), 'no send-capable export exists');
});
