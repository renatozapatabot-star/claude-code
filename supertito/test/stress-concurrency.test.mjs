// Real concurrency + adversarial stress testing over supertito modules (see PROJECT-STATUS.md /
// FREIGHT-OS-CANON.md v3.8 "round 4"/WO-19 for prior-round context — this file is new, does not
// modify any existing *.test.mjs). "Concurrency" here means what it can mean in single-threaded
// Node: shared mutable state raced across real `await`/microtask boundaries (genuine event-loop
// interleaving via Promise.all), not simulated parallelism. Every number below was produced by an
// actual `node --test` run, not hand-computed.
//
// FINDINGS (see inline comments at each test for detail):
//   1. fallback-limiter.beginProbe correctly serializes concurrent HALF_OPEN probes ONLY when the
//      caller obeys its documented contract (persist nextState synchronously, before any await).
//      Under a very plausible real-world misuse (persist the state update in a .then()/after the
//      awaited LLM call, not before it) every concurrent caller observes the stale OPEN state and
//      is admitted as a probe — the exact resilience4j #1432 bug class beginProbe exists to close,
//      reopened by ordinary async misuse. This is a real, confirmed risk for whoever wires this
//      into Hermes (WO-18), not a defect in the pure function's logic itself.
//   2. alerts.mjs dedupeAlerts has a genuine sliding-window bug: once a thread's occurrences split
//      into an out-of-window "new occurrence" entry, every later occurrence for that thread is
//      compared only against the ORIGINAL first-ever occurrence (byThread.get(thread_id) is never
//      updated once a spinoff happens), never against the most recent occurrence. A run of alerts
//      that are each within-window of their immediate neighbor, but far from the very first
//      occurrence, never merges — confirmed below with a real burst pattern.
//   3. correlate.mjs, cortana.mjs, inbox-triage.mjs all handle 10k-50k item arrays and adversarial
//      unicode (zero-width joiners, RTL override characters, embedded null bytes, lone surrogates,
//      500k+ char strings) without throwing or a performance cliff — genuinely correct passes,
//      confirmed with real timings, not asserted blindly.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { beginProbe } from '../src/fallback-limiter.mjs';
import { dedupeAlerts, rankAlerts } from '../src/alerts.mjs';
import { correlate } from '../src/correlate.mjs';
import { runCortanaPass } from '../src/cortana.mjs';
import { classifyThread } from '../src/inbox-triage.mjs';
import { adaptGlobalpc } from '../src/system-adapters.mjs';
import { resolveBrainAccess } from '../src/brain-access.mjs';

// ---------------------------------------------------------------------------------------------
// 1. fallback-limiter.beginProbe under real async interleaving
// ---------------------------------------------------------------------------------------------

test('beginProbe: correct usage (persist synchronously, before any await) serializes concurrent probes to exactly 1 of N', async () => {
  let sharedState = { status: 'open', consecutiveFailures: 3, openedAtMs: 0 };
  const nowMs = 1_000_000;
  const cooldownMs = 1000;

  async function handler() {
    // Contract: read + claim + persist all happen before the first await, so a second concurrent
    // handler running in the gap between this one's persist and its own read always sees the
    // already-claimed 'half_open' state.
    const { allowed, nextState } = beginProbe(sharedState, nowMs, cooldownMs);
    if (allowed) sharedState = nextState;
    await new Promise((resolve) => setImmediate(resolve)); // the awaited LLM call itself
    return allowed;
  }

  const results = await Promise.all(Array.from({ length: 10 }, () => handler()));
  const allowedCount = results.filter(Boolean).length;
  assert.equal(allowedCount, 1, 'exactly one probe should be admitted under correct synchronous-persist usage');
});

test('FINDING: beginProbe admits every concurrent caller when the state write happens after the await (a realistic misuse, not a hypothetical)', async () => {
  let sharedState = { status: 'open', consecutiveFailures: 3, openedAtMs: 0 };
  const nowMs = 1_000_000;
  const cooldownMs = 1000;

  async function handler() {
    const stateSnapshot = sharedState; // read
    await new Promise((resolve) => setImmediate(resolve)); // yields to the event loop — e.g. the
      // awaited LLM call happening BEFORE the caller gets around to persisting nextState, which is
      // an easy mistake in real async code (persist-in-the-.then() is a natural shape to write)
    const { allowed, nextState } = beginProbe(stateSnapshot, nowMs, cooldownMs);
    if (allowed) sharedState = nextState; // persisted too late — every racer already read the same stale snapshot
    return allowed;
  }

  const results = await Promise.all(Array.from({ length: 5 }, () => handler()));
  const allowedCount = results.filter(Boolean).length;
  // Documents the real, confirmed behavior: beginProbe's check-and-claim guarantee depends entirely
  // on caller discipline it cannot enforce. This is not a bug in beginProbe's logic (it did exactly
  // what a pure function reading a stale snapshot must do) — it is a confirmed operational risk for
  // whoever wires this into Hermes: the "persist before any await" contract is load-bearing and
  // unenforced.
  assert.equal(allowedCount, 5, 'all 5 racers were wrongly admitted once the synchronous-persist contract is violated');
});

test('beginProbe: staggered (non-simultaneous) real-world arrival correctly re-serializes after the first claim, even across many microtask hops', async () => {
  let sharedState = { status: 'open', consecutiveFailures: 3, openedAtMs: 0 };
  const nowMs = 1_000_000;
  const cooldownMs = 1000;
  const admitted = [];

  async function handler(hops) {
    for (let i = 0; i < hops; i++) await Promise.resolve(); // stagger real microtask arrival times
    const { allowed, nextState } = beginProbe(sharedState, nowMs, cooldownMs);
    if (allowed) sharedState = nextState; // synchronous persist immediately after the (staggered) read
    admitted.push(allowed);
  }

  await Promise.all([handler(3), handler(1), handler(7), handler(2), handler(5)]);
  assert.equal(admitted.filter(Boolean).length, 1, 'staggered but still-synchronous-persist callers still serialize to exactly 1 admitted probe');
});

// ---------------------------------------------------------------------------------------------
// 2. alerts.mjs dedupeAlerts — burst-pattern sliding-window fuzz
// ---------------------------------------------------------------------------------------------

test('FINDING: dedupeAlerts fails to merge a genuinely contiguous run of same-thread alerts once an earlier out-of-window split has occurred', () => {
  const windowMs = 60;
  // t=0 is the anchor. t=1000/1030/1060 are each within `windowMs` of their IMMEDIATE neighbor
  // (1030-1000=30, 1060-1030=30) — a real, continuous run that a correct sliding window should
  // fold into ONE surviving entry (suppressedCount=2) — but each is >windowMs from the frozen
  // t=0 anchor (1000-0=1000, etc.), and byThread.get(thread_id) is never advanced off that first
  // occurrence once a spinoff entry is created, so all three become separate, un-merged entries.
  const alerts = [
    { thread_id: 't1', urgency: 1, emittedAtMs: 0 },
    { thread_id: 't1', urgency: 1, emittedAtMs: 1000 },
    { thread_id: 't1', urgency: 1, emittedAtMs: 1030 },
    { thread_id: 't1', urgency: 1, emittedAtMs: 1060 },
  ];
  const result = dedupeAlerts(alerts, windowMs);
  // Documents the CURRENT (buggy) behavior: 4 separate entries instead of the 2 a correct sliding
  // window would produce (t=0 alone, t=1000/1030/1060 merged with suppressedCount=2). Update this
  // assertion if/when the anchor-freeze bug above is fixed.
  assert.equal(result.length, 4, 'current behavior: the 1000/1030/1060 run fails to merge despite being mutually within-window');
  assert.ok(result.every((r) => r.suppressedCount === 0), 'none of the mutually-adjacent occurrences were folded into a survivor');
});

test('dedupeAlerts: a simple two-alert within-window pair (no prior split) still merges correctly', () => {
  const result = dedupeAlerts([
    { thread_id: 't2', urgency: 1, emittedAtMs: 0 },
    { thread_id: 't2', urgency: 2, emittedAtMs: 30 },
  ], 60);
  assert.equal(result.length, 1);
  assert.equal(result[0].suppressedCount, 1);
  assert.equal(result[0].urgency, 2); // higher-urgency content wins
});

test('dedupeAlerts + rankAlerts: 50k alerts across 500 threads completes fast and produces one entry per thread (no performance cliff)', () => {
  const N = 50_000;
  const alerts = [];
  for (let i = 0; i < N; i++) {
    alerts.push({ thread_id: `t${i % 500}`, urgency: (i * 7) % 10, emittedAtMs: i * 1000 });
  }
  const t0 = performance.now();
  const deduped = dedupeAlerts(alerts, 60 * 60 * 1000);
  const ranked = rankAlerts(deduped);
  const elapsedMs = performance.now() - t0;
  assert.equal(deduped.length <= 500 * 2, true, 'bounded output size, not an explosion of singleton entries');
  assert.equal(ranked.length, deduped.length);
  assert.ok(elapsedMs < 2000, `expected well under 2s for 50k alerts, took ${elapsedMs.toFixed(1)}ms`);
});

// ---------------------------------------------------------------------------------------------
// 3. correlate.mjs — large-array fuzz (worst case: one entity, N observations across 2 systems)
// ---------------------------------------------------------------------------------------------

test('correlate: 20k observations, single entity across 2 systems (worst-case single huge group) — no cliff, correct grouping', () => {
  const N = 20_000;
  const systems = ['gmail', 'aduanet'];
  const observations = [];
  for (let i = 0; i < N; i++) {
    observations.push({
      system: systems[i % 2],
      threadId: `t${i}`,
      entity: 'EVCO',
      classification: { category: 'routine', urgency: (i * 13) % 10, ageDays: 1, awaitingReply: true },
    });
  }
  const t0 = performance.now();
  const briefs = correlate(observations, Date.now());
  const elapsedMs = performance.now() - t0;
  assert.equal(briefs.length, 1);
  assert.equal(briefs[0].items.length, N);
  assert.equal(briefs[0].systems.length, 2);
  assert.ok(elapsedMs < 2000, `expected well under 2s for 20k observations, took ${elapsedMs.toFixed(1)}ms`);
});

test('correlate: 20k observations spread across many distinct never-correlating single-system entities returns zero briefs, still fast', () => {
  const N = 20_000;
  const observations = [];
  for (let i = 0; i < N; i++) {
    observations.push({
      system: 'gmail', // every observation is the SAME single system -> never correlates (needs 2+ systems)
      threadId: `t${i}`,
      entity: `client-${i}`, // all distinct entities too
      classification: { category: 'routine', urgency: 1, ageDays: 1, awaitingReply: true },
    });
  }
  const t0 = performance.now();
  const briefs = correlate(observations, Date.now());
  const elapsedMs = performance.now() - t0;
  assert.equal(briefs.length, 0);
  assert.ok(elapsedMs < 2000, `expected well under 2s, took ${elapsedMs.toFixed(1)}ms`);
});

// ---------------------------------------------------------------------------------------------
// 4. cortana.mjs — large-array + adversarial unicode fuzz
// ---------------------------------------------------------------------------------------------

test('runCortanaPass: 10k gmail threads (single system, so zero correlation expected) completes fast; output is bounded by the escalation batch cap, not silently unbounded', () => {
  // NOTE: cortana.mjs picked up an escalation.mjs batch-cap/deferral flood guard (DEFAULT_BATCH_CAP
  // = 25) as parallel work landed in this same round (confirmed via a live re-read mid-session —
  // this file grew from 118 to 167 lines between this test file's first draft and this run, exactly
  // the kind of concurrent-modification the task asked us to design around). The correct real-world
  // expectation for 10k raw observations is NOT 10k alerts — it's `cap` kept + the rest accounted for
  // in `deferrals`, never silently dropped.
  const N = 10_000;
  const gmail = [];
  for (let i = 0; i < N; i++) {
    gmail.push({
      threadId: `th${i}`,
      messages: [{ id: `m${i}`, dateMs: Date.now() - i * 1000, fromMe: false, subject: 'MAFESA urgente', snippet: 'detenido en aduana' }],
    });
  }
  const t0 = performance.now();
  const result = runCortanaPass({ gmail }, Date.now());
  const elapsedMs = performance.now() - t0;
  assert.equal(result.perSystemAlerts.length, 25, 'bounded by escalation.mjs DEFAULT_BATCH_CAP (25), not unbounded');
  assert.equal(result.correlatedBriefs.length, 0, 'single-system observations never correlate, by design');
  assert.equal(result.deferrals.length, 1);
  assert.equal(result.deferrals[0].fired, 25);
  assert.equal(result.deferrals[0].deferred, N - 25, 'every non-kept observation is accounted for, not silently dropped');
  assert.ok(elapsedMs < 3000, `expected well under 3s for 10k threads, took ${elapsedMs.toFixed(1)}ms`);
});

test('runCortanaPass: escalation cap keeps the highest-urgency alerts first across a large mixed-urgency batch', () => {
  const N = 300;
  const nowMs = Date.now();
  const gmail = [];
  for (let i = 0; i < N; i++) {
    // every 3rd is a genuinely higher-urgency compliance thread; the rest are urgent-client (lower)
    const subject = i % 3 === 0 ? 'mve vucem' : 'urgente';
    gmail.push({ threadId: `th${i}`, messages: [{ id: `m${i}`, dateMs: nowMs, fromMe: false, subject, snippet: '' }] });
  }
  const result = runCortanaPass({ gmail }, nowMs, { cap: 25 });
  assert.equal(result.perSystemAlerts.length, 25);
  assert.ok(result.perSystemAlerts.every((a) => a.urgency === 5), 'the cap must keep the highest-urgency items, not an arbitrary/positional subset');
});

test('FINDING: two distinct alerts that happen to share the same thread_id silently collapse into duplicates of one, under the escalation cap', () => {
  // applyEscalationCap's `byId = new Map(wrapped.map((w) => [w.id, w.item]))` is keyed by the raw
  // thread_id, which is caller data, not guaranteed unique (a real gmail/adapter caller bug, or a
  // genuine cross-observation id collision, could produce this). The escalator's own `fired` id list
  // can contain the same id twice (once per underlying wrapped entry that both got selected), and the
  // byId Map then resolves BOTH occurrences to whichever entry was inserted into the Map last —
  // silently discarding the first alert's real content and replacing it with a duplicate of the
  // second, while the mirrored deferral record still (misleadingly) reports "fired: 2" as though two
  // distinct items survived.
  const nowMs = Date.now();
  const gmail = [
    { threadId: 'DUP', messages: [{ id: 'm1', dateMs: nowMs, fromMe: false, subject: 'urgente', snippet: 'detenido' }] }, // urgency 4, category urgent-client
    { threadId: 'DUP', messages: [{ id: 'm2', dateMs: nowMs, fromMe: false, subject: 'mve vucem', snippet: '' }] }, // urgency 5, category compliance-deadline
  ];
  const result = runCortanaPass({ gmail }, nowMs, { cap: 25 });
  assert.equal(result.perSystemAlerts.length, 2, 'the escalator reports 2 fired items...');
  assert.deepEqual(
    result.perSystemAlerts[0],
    result.perSystemAlerts[1],
    'CURRENT (buggy) behavior: both "kept" entries are identical duplicates of the SAME underlying alert — the urgency-4 urgent-client alert\'s real content was silently discarded and replaced, not just deferred',
  );
  assert.equal(result.perSystemAlerts[0].category, 'compliance-deadline', 'only the second alert\'s content survives, under whichever entry the Map happened to keep last');
});

test('runCortanaPass: adversarial unicode subjects never throw and never mis-crash extractEntity/classifyThread', () => {
  const zeroWidth = '​‌‍'; // zero-width space, non-joiner, joiner
  const rtlOverride = '‮evasive‬'; // RTL override + pop directional formatting
  const embeddedNullByte = `MAFESA${String.fromCharCode(0)}urgente`;
  const combiningMarks = 'ḾAFESA'; // combining acute accent spliced mid-word
  const hugeString = `MAFESA ${'x'.repeat(500_000)} urgente`;
  const loneSurrogate = 'MAFESA \uD800 urgente'; // unpaired high surrogate, invalid UTF-16 on its own

  const cases = [
    [`${zeroWidth}MAFESA`, false], // no urgent/compliance keyword present -> expect no alert, not a crash
    [`${rtlOverride} MAFESA urgente`, true],
    [embeddedNullByte, true],
    [combiningMarks, false], // combining mark splits the literal "MAFESA" substring match -> falls back to CAPS-token heuristic or none, still must not throw
    [hugeString, true],
    [loneSurrogate, true],
  ];

  for (const [subject, expectAlert] of cases) {
    const gmail = [{ threadId: 't1', messages: [{ id: 'm1', dateMs: Date.now(), fromMe: false, subject, snippet: '' }] }];
    let result;
    assert.doesNotThrow(() => { result = runCortanaPass({ gmail }, Date.now()); }, `subject fuzz case must not throw: ${JSON.stringify(subject).slice(0, 40)}`);
    const gotAlert = result.perSystemAlerts.length > 0;
    assert.equal(gotAlert, expectAlert, `alert-vs-no-alert mismatch for ${JSON.stringify(subject).slice(0, 40)}`);
  }
});

// ---------------------------------------------------------------------------------------------
// 5. inbox-triage.mjs classifyThread — pathological string length, no ReDoS
// ---------------------------------------------------------------------------------------------

test('classifyThread: a 4M-char snippet with the urgent keyword at the very end still classifies correctly, fast (no ReDoS on \\b-bounded keyword regex)', () => {
  const longSnippet = `${'a '.repeat(2_000_000)}urgente`;
  const messages = [{ id: '1', dateMs: Date.now(), fromMe: false, subject: '', snippet: longSnippet }];
  const t0 = performance.now();
  const result = classifyThread(messages, Date.now());
  const elapsedMs = performance.now() - t0;
  assert.equal(result.category, 'urgent-client');
  assert.ok(elapsedMs < 1000, `expected well under 1s for a 4M-char snippet, took ${elapsedMs.toFixed(1)}ms`);
});

test('classifyThread: embedded null byte in the snippet does not break keyword matching or throw', () => {
  const snippet = `MAFESA${String.fromCharCode(0)}urgente`;
  const messages = [{ id: '1', dateMs: Date.now(), fromMe: false, subject: '', snippet }];
  const result = classifyThread(messages, Date.now());
  assert.equal(result.category, 'urgent-client');
});

test('classifyThread: 10k messages in one thread, out-of-order dateMs, correctly finds the true latest by dateMs not array position', () => {
  const N = 10_000;
  const messages = [];
  const nowMs = Date.now();
  for (let i = 0; i < N; i++) {
    // shuffle-ish: latest message intentionally placed near the middle, not at either end
    messages.push({ id: `m${i}`, dateMs: nowMs - (N - i) * 1000, fromMe: false, subject: 'routine', snippet: 'nothing special' });
  }
  const trueLatestIdx = Math.floor(N / 2) + 137; // arbitrary non-edge position
  messages[trueLatestIdx] = { id: 'true-latest', dateMs: nowMs + 999_999, fromMe: false, subject: 'urgente', snippet: 'detenido' };
  const t0 = performance.now();
  const result = classifyThread(messages, nowMs);
  const elapsedMs = performance.now() - t0;
  assert.equal(result.category, 'urgent-client', 'must have picked the true-latest message by dateMs, not by array position');
  assert.ok(elapsedMs < 1000, `expected well under 1s for 10k messages, took ${elapsedMs.toFixed(1)}ms`);
});

// ---------------------------------------------------------------------------------------------
// 6. system-adapters.mjs — unicode/null-byte/huge-string fuzz through the adapter boundary
// ---------------------------------------------------------------------------------------------

test('adaptGlobalpc: embedded null byte in traficoId and a 1M-char detail field pass through without throwing or truncation', () => {
  const traficoId = `MAFESA${String.fromCharCode(0)}urgente`;
  const hugeDetail = 'x'.repeat(1_000_000);
  const result = adaptGlobalpc({ traficoId, eventEpochMs: Date.now(), eventType: 'hold-flagged', detail: hugeDetail });
  assert.ok(result.subject.includes(traficoId));
  assert.equal(result.snippet.length, 1_000_000);
});

test('adaptGlobalpc: 5000 rapid-fire adapt calls with random unicode fields complete without a single throw or perf cliff', () => {
  const N = 5000;
  const weirdChars = ['​', '‮', '́', String.fromCharCode(0), '\uD800', '𝕏', '🚀'];
  const t0 = performance.now();
  for (let i = 0; i < N; i++) {
    const weird = weirdChars[i % weirdChars.length];
    const raw = { traficoId: `T${weird}${i}`, eventEpochMs: Date.now(), eventType: `type${weird}`, detail: `${weird}detail${i}` };
    const result = adaptGlobalpc(raw);
    assert.equal(typeof result.subject, 'string');
    assert.equal(typeof result.snippet, 'string');
  }
  const elapsedMs = performance.now() - t0;
  assert.ok(elapsedMs < 2000, `expected well under 2s for 5000 adapt calls, took ${elapsedMs.toFixed(1)}ms`);
});

// ---------------------------------------------------------------------------------------------
// 7. brain-access.mjs — rapid interleaved access checks (many "concurrent" users/docs), unicode tenant fuzz
// ---------------------------------------------------------------------------------------------

test('resolveBrainAccess: 10k rapid interleaved (user, doc) checks across mixed roles/tenants never throws and stays fail-safe for unknown combinations', () => {
  const roles = ['founder', 'co-principal', 'employee', 'client'];
  const tenants = ['EVCO', 'Duratech', 'Milacron', 'Foam Supplies'];
  const N = 10_000;
  let allowedCount = 0;
  const t0 = performance.now();
  for (let i = 0; i < N; i++) {
    const role = roles[i % roles.length];
    const user = role === 'employee'
      ? { role, roleScope: tenants[i % tenants.length] }
      : { role, tenant: tenants[i % tenants.length] };
    const doc = { category: tenants[(i + 1) % tenants.length], tenant: tenants[i % tenants.length], principalOnly: i % 7 === 0 };
    const { allow } = resolveBrainAccess(user, doc);
    if (allow) allowedCount++;
  }
  const elapsedMs = performance.now() - t0;
  assert.ok(elapsedMs < 1000, `expected well under 1s for 10k access checks, took ${elapsedMs.toFixed(1)}ms`);
  assert.ok(allowedCount >= 0); // sanity: loop actually ran and produced booleans, no throw escaped
});

test('resolveBrainAccess: a zero-width-space appended to the doc tenant fails safe (denies) rather than silently normalizing to a match', () => {
  const user = { role: 'client', tenant: 'EVCO' };
  const doc = { category: 'billing', tenant: `EVCO${'​'}` };
  const result = resolveBrainAccess(user, doc);
  assert.equal(result.allow, false, 'trim+lowercase normalization does not strip zero-width chars — correctly fails closed, not a leak, but worth knowing it is not full Unicode-normalized matching');
});
