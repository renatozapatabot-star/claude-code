// Bounded, oldest-first escalation with a mirrored deferral trail — zero loss, zero
// double-fire (ST-6). The cap delays lower-priority escalations by one tick (bounded delay
// WITH an audit trail) instead of an unbounded flood.
export const DEFAULT_BATCH_CAP = 25; // [WO-04] ratifiable default

export function createEscalator({ cap = DEFAULT_BATCH_CAP, onMirror = () => {} } = {}) {
  const n = Number(cap);
  if (!Number.isInteger(n) || n < 1 || n > 1000) throw new Error('invalid-batch-cap');

  // items: [{ id, dueMs }]. Fires oldest-due-first; deterministic tiebreak by id.
  function scan(items) {
    const overdue = items.filter(i => !i.fired)
      .sort((a, b) => a.dueMs - b.dueMs || String(a.id).localeCompare(String(b.id)));
    const fired = overdue.slice(0, n);
    const deferred = overdue.length - fired.length;
    for (const i of fired) i.fired = true;
    if (fired.length || deferred) onMirror({ kind: 'escalation-batch', fired: fired.length, deferred, cap: n });
    return { fired: fired.map(i => i.id), deferred };
  }
  return { scan, cap: n };
}
