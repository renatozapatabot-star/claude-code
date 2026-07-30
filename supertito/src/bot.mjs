// SuperTito facade — the channel-agnostic bot. Sender auth is enforced BEFORE any
// answer/capture (oracle-free). Facts require verified provenance at utterance. Channel
// is Clawdia today / Telegram (@supertitobot) when the founder wires the token ([WO-03]).
import { createSenderRegistry } from './sender-registry.mjs';
import { normLang, t, matchMetric } from './i18n.mjs';

export function createBot({ receipts, facts = [], onMirror = () => {}, senderIds } = {}) {
  const registry = createSenderRegistry({ senderIds, onDeny: (d) => onMirror({ kind: 'sender-denied', ...d }) });

  // fact: { metric, value, source_receipt, tenant?, asOf }
  function ask({ senderId, question, lang = 'en' }) {
    const auth = registry.authorize(senderId);
    const L = normLang(lang);
    if (!auth.ok) return { kind: 'denied', text: t(L, 'denied_sender') }; // no facts, no capture, no oracle
    for (const f of facts) {
      if (!matchMetric(question, f.metric, L)) continue;
      // Provenance re-verify at utterance — never utter an unverifiable value.
      if (f.source_receipt && receipts && !receipts.verify(f.source_receipt).ok)
        return { kind: 'unverifiable-provenance', text: t(L, 'provenance_unverifiable'), metric: f.metric };
      const tag = f.tenant ? ` [${f.tenant}]` : '';
      return { kind: 'fact', metric: f.metric, value: f.value, text: `${f.metric}${tag}: ${f.value} (as of ${f.asOf})` };
    }
    return { kind: 'not-measured', text: t(L, 'not_measured') };
  }
  return { ask, authorize: registry.authorize };
}
