// Shared normalize-key helper — extracted from three independent hand-rolled copies of the same
// "case/whitespace shouldn't matter for a match key" fix (correlate.mjs's entity grouping,
// brain-access.mjs's tenant matching, cortana.mjs's extractEntity substring search), each landed in
// the v3.8 audit as a separate bugfix for the same underlying bug class. One helper means the next
// module that needs this doesn't get a fourth hand-rolled variant, and a future correction to the
// rule (e.g. Unicode normalization) is one edit instead of a grep-and-fix.
//
// Deliberately permissive on input type (`value ?? ''` before anything else) rather than requiring a
// string: brain-access.mjs's original copy already had to tolerate `doc.tenant` being absent
// (undefined) since `tenant` is an optional field; correlate.mjs's original copy did not, and would
// have thrown on an absent `entity`. Matching the more defensive of the two originals is a strict
// widening — every existing caller only ever passed a value the stricter version already accepted.

/**
 * @param {unknown} value
 * @returns {string} trimmed, lowercased string — safe on null/undefined/non-string input
 */
export function normalizeKey(value) {
  return String(value ?? '').trim().toLowerCase();
}
