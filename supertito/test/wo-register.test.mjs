import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseWoRegisterTable } from '../src/wo-register.mjs';

test('parses OPEN/CLOSED/RESOLVED/DONE status buckets from the standard row shape', () => {
  const md = [
    '| WO | Ask | Status |',
    '|---|---|---|',
    '| WO-01 | Do a thing | **OPEN** — founder to grant |',
    '| WO-02 | Do another | **CLOSED** — done 2026-01-01 |',
    '| WO-03 | Third thing | **RESOLVED** (adopted) |',
    '| WO-04 | Fourth thing | **DONE** — admitted, populated |',
  ].join('\n');
  const { items, warnings } = parseWoRegisterTable(md);
  assert.equal(items.length, 4);
  assert.deepEqual(items.map((i) => i.statusBucket), ['open', 'closed', 'resolved', 'done']);
  assert.equal(warnings.length, 0);
});

test('a status cell with no OPEN/CLOSED/RESOLVED/DONE verdict is kept as unclear, not guessed', () => {
  const md = '| WO-10 | The 7-day floor | **ARMED BUT NOT PRODUCING OUTPUT — v3.7 correction.** Honest status: 0/7. |';
  const { items, warnings } = parseWoRegisterTable(md);
  assert.equal(items.length, 1);
  assert.equal(items[0].statusBucket, 'unclear');
  assert.equal(items[0].statusLabel, 'ARMED BUT NOT PRODUCING OUTPUT — v3.7 correction.');
  assert.ok(warnings.some((w) => w.includes('WO-10') && w.includes('unclear')));
});

test('alarmCount reflects real 🚨 usage in the ask column, distinct from other emoji', () => {
  const md = [
    '| WO-16 | 🚨 SEV-1 something | **OPEN** |',
    '| WO-18 | 🔍 Real bug | **OPEN** |',
    '| WO-19 | 🚨🚨 HIGHEST PRIORITY | **OPEN** |',
    '| WO-20 | No emoji here | **OPEN** |',
  ].join('\n');
  const { items } = parseWoRegisterTable(md);
  const byId = Object.fromEntries(items.map((i) => [i.id, i.alarmCount]));
  assert.equal(byId['WO-16'], 1);
  assert.equal(byId['WO-18'], 0);
  assert.equal(byId['WO-19'], 2);
  assert.equal(byId['WO-20'], 0);
});

test('duplicate WO id: keeps the first row, warns, does not throw', () => {
  const md = [
    '| WO-01 | First version | **OPEN** |',
    '| WO-01 | Second version (stale duplicate) | **CLOSED** |',
  ].join('\n');
  const { items, warnings } = parseWoRegisterTable(md);
  assert.equal(items.length, 1);
  assert.equal(items[0].ask, 'First version');
  assert.ok(warnings.some((w) => w.includes('duplicate row for WO-01')));
});

test('header/separator/non-row lines are ignored silently, not warned about', () => {
  const md = [
    '## 3. WO register',
    '',
    '| WO | Ask | Status |',
    '|---|---|---|',
    '| WO-01 | Real row | **OPEN** |',
    'some unrelated prose mentioning nothing structured',
  ].join('\n');
  const { items, warnings } = parseWoRegisterTable(md);
  assert.equal(items.length, 1);
  assert.equal(warnings.length, 0);
});

test('text that mentions WO-NN ids but matches no row shape warns instead of silently returning empty', () => {
  const md = 'WO-01 and WO-02 are discussed in prose here, no table at all.';
  const { items, warnings } = parseWoRegisterTable(md);
  assert.equal(items.length, 0);
  assert.ok(warnings.some((w) => w.includes('table format may have changed')));
});

test('empty/undefined input returns empty items with no warnings and does not throw', () => {
  assert.deepEqual(parseWoRegisterTable(undefined), { items: [], warnings: [] });
  assert.deepEqual(parseWoRegisterTable(''), { items: [], warnings: [] });
});

// REAL DATA, not a fixture: this is the literal WO register table text copied verbatim from this
// repo's own PROJECT-STATUS.md §3 at the time this test was written (2026-07-31) — proof the
// parser works against the actual live document, not just synthetic rows shaped to fit it.
test('parses the real, live WO register table from PROJECT-STATUS.md verbatim', () => {
  const real = [
    '| WO-01 | Supabase read-only DB atlas/credentials | **OPEN** — founder to grant |',
    '| WO-05 | Adjunto billing law adoption | **RESOLVED** (full-price-swap rule adopted; now *implemented* — see §5) |',
    '| WO-07 | Real-repo admission | **CLOSED** — all 9 real repos admitted + cloned to `/workspace` (resolved ambiguous status in v3.7 audit) |',
    '| WO-10 | The 7-day floor | **ARMED BUT NOT PRODUCING OUTPUT — v3.7 correction.** Routine `trig_01CschhiJHbCoZkHtpufkUJ1` really fires (confirmed via `list_triggers`) but `DESIGN_LOG.md` has zero qualifying entries and neither target branch has a matching commit in 11 real days. Honest status: **0/7**, an open reliability defect, not a running clock. Needs Throne/environment-side debugging. |',
    '| WO-14 | Second-brain admission (`aguila-brain`) | **DONE** — admitted, populated, pushed; access-matrix enforcement now real code (`supertito/src/brain-access.mjs`, 16/16 tests) |',
    '| WO-15 | SuperTito bot name | **CLOSED** — `@supertitobot`, founder-ruled 2026-07-19 |',
    '| WO-16 | 🚨 SEV-1 MAFESA/EVCO cross-tenant fix, write access | **OPEN — APPLY NOW (reversed 2026-07-31).** Fix is a verified, COMPLETE, ready-to-apply patch. |',
    '| WO-18 | 🔍 Real bot reliability bug: repeat-spam of an identical fallback message when the conversational layer fails | **OPEN, but the fix is fully built** |',
    '| WO-19 | 🚨🚨 **HIGHEST PRIORITY** — real, live security defects in `evco-portal` | **OPEN — rotate the 7 passwords out of band immediately** |',
    '| WO-20 | 🚨 Governance/process finding — not a code bug | **OPEN — founder must choose: (a) a real human-gated merge cadence, or (b) designate one AI session/tool as sole merge authority.** |',
  ].join('\n');
  const { items, warnings } = parseWoRegisterTable(real);
  assert.equal(items.length, 10);
  const byId = Object.fromEntries(items.map((i) => [i.id, i]));
  assert.equal(byId['WO-01'].statusBucket, 'open');
  assert.equal(byId['WO-05'].statusBucket, 'resolved');
  assert.equal(byId['WO-07'].statusBucket, 'closed');
  assert.equal(byId['WO-10'].statusBucket, 'unclear');
  assert.equal(byId['WO-14'].statusBucket, 'done');
  assert.equal(byId['WO-15'].statusBucket, 'closed');
  assert.equal(byId['WO-16'].statusBucket, 'open');
  assert.equal(byId['WO-16'].alarmCount, 1);
  assert.equal(byId['WO-18'].alarmCount, 0);
  assert.equal(byId['WO-19'].alarmCount, 2);
  assert.equal(byId['WO-19'].statusBucket, 'open');
  assert.equal(byId['WO-20'].alarmCount, 1);
  // only WO-10 is a real ambiguous case in this snippet
  assert.deepEqual(warnings.filter((w) => w.includes('unclear')).map((w) => w.slice(0, 6)), ['WO-10:']);
});
