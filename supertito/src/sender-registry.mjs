// Spoof-resistant sender allowlist enforced BEFORE any answer/capture (ST-3 / X3).
// Byte-exact match only — no casefold/normalization, so Cyrillic/confusable/case/empty/null
// all fail. Denial is oracle-free (identical for question- and commitment-shaped messages).
export const CANON_ROSTER = Object.freeze(['renato-iv', 'renato-iii', 'supertito-bot']);

// Real chat/user ids are swapped in at go-live ([WO-03]); the twin rehearses with roster ids.
export function createSenderRegistry({ senderIds = {
  'renato-iv': ['renato-iv'],
  'renato-iii': ['renato-iii'],
  'supertito-bot': ['supertito-bot'],
}, onDeny = () => {} } = {}) {
  // Flatten to a Set of authorized ids (byte-exact).
  const authorized = new Map();
  for (const member of CANON_ROSTER) for (const id of (senderIds[member] || [])) authorized.set(id, member);

  function authorize(senderId) {
    if (typeof senderId !== 'string' || senderId.length === 0) { onDeny({ sender: String(senderId), reason: 'bad-sender' }); return { ok: false, reason: 'denied' }; }
    const member = authorized.get(senderId); // Map.get is byte-exact
    if (!member) { onDeny({ sender: senderId, reason: 'unregistered' }); return { ok: false, reason: 'denied' }; }
    return { ok: true, member };
  }
  return { authorize };
}
