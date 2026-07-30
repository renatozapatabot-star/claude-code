// Second-brain access matrix — enforcement code for SECOND-BRAIN.md's "access matrix" and honesty
// rule (canon WO-14/P8-W1-01: "everything within the computer / the second brain lives under
// FREIGHT"). SECOND-BRAIN.md was prose-only until this file; this is the first time the matrix
// (founder/co-principal full, employee role-scoped, client tenant-scoped) is a real, testable
// decision instead of a document. Pure functions only — this module never queries, ingests, or
// mutates the real `aguila-brain` vault (that's [P8-W2-01], still POR ACTIVAR), and has no
// send/dispatch/reply export (§0.4-8, Cortana law, ecosystem-wide, no exception).

/**
 * @typedef {Object} BrainUser
 * @property {'founder'|'co-principal'|'employee'|'client'} role
 * @property {string} [roleScope] - employee's role area (e.g. 'broker','ops','warehouse',
 *   'accounting','dispatch'); matched against doc.category. Required for an employee to see
 *   anything role-scoped — a missing roleScope means the employee's identity carries no grant,
 *   not that they see everything.
 * @property {string} [tenant] - client's own tenant (e.g. 'EVCO','Duratech','Milacron','Foam
 *   Supplies'); matched against doc.tenant. Same "missing = no grant" logic as roleScope.
 */

/**
 * @typedef {Object} BrainDoc
 * @property {string} id - stable doc identifier; the thing an answer cites as its source.
 * @property {string} category - role-scope key for employees (e.g. 'broker','accounting') OR the
 *   sentinel 'internal-notes', which SECOND-BRAIND.md singles out as never client-visible
 *   regardless of tenant match.
 * @property {string} [tenant] - the tenant this doc belongs to; absent means the doc is not
 *   tenant-owned material (broker-internal, canon, cross-tenant ops) and can never satisfy a
 *   client's tenant scope.
 * @property {boolean} [principalOnly] - true if only founder/co-principal may ever see this doc,
 *   independent of any role match.
 * @property {string} [snippet] - short indexed excerpt; the actual cited text in an answer.
 */

const PRINCIPAL_ROLES = new Set(['founder', 'co-principal']);
const KNOWN_ROLES = new Set(['founder', 'co-principal', 'employee', 'client']);

function requireNonEmptyString(value, label) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

/**
 * Enforces SECOND-BRAIN.md's access matrix for exactly one (user, doc) pair. Pure — no lookup, no
 * side effect. Deliberately data-driven (string equality on roleScope/tenant) rather than a role
 * enum switch, because the matrix itself is data (the set of role scopes and tenants grows without
 * this function changing) — see FREIGHT-OS-CANON.md's CRUZ v1.4 G7 tenant law this mirrors.
 *
 * @param {BrainUser} user
 * @param {BrainDoc} doc
 * @returns {{ allow: boolean, reason: string }}
 */
export function resolveBrainAccess(user, doc) {
  if (!user || typeof user !== 'object') throw new TypeError('resolveBrainAccess: user required');
  if (!doc || typeof doc !== 'object') throw new TypeError('resolveBrainAccess: doc required');
  requireNonEmptyString(user.role, 'user.role');
  requireNonEmptyString(doc.category, 'doc.category');
  if (!KNOWN_ROLES.has(user.role)) {
    throw new TypeError(`resolveBrainAccess: unknown user.role '${user.role}'`);
  }

  if (PRINCIPAL_ROLES.has(user.role)) {
    return { allow: true, reason: `${user.role} — full access, no scope restriction` };
  }

  if (user.role === 'employee') {
    if (doc.principalOnly) {
      return { allow: false, reason: 'principal-only document — employees excluded regardless of role scope' };
    }
    if (!user.roleScope) {
      return { allow: false, reason: 'employee has no roleScope assigned — no grant, not full access' };
    }
    if (doc.category !== user.roleScope) {
      return {
        allow: false,
        reason: `role-scope mismatch — employee scoped to '${user.roleScope}', doc is '${doc.category}'`,
      };
    }
    return { allow: true, reason: `role-scope match on '${user.roleScope}'` };
  }

  // user.role === 'client'
  if (doc.category === 'internal-notes') {
    return { allow: false, reason: "internal-notes category — never client-visible, regardless of tenant" };
  }
  if (!user.tenant || doc.tenant !== user.tenant) {
    return { allow: false, reason: 'tenant mismatch — cross-tenant access denied' };
  }
  return { allow: true, reason: `tenant match on '${user.tenant}'` };
}

/**
 * Honesty-rule enforcement for SECOND-BRAIN.md: "every answer cites its source; no source →
 * 'not in the brain yet,' never a fabricated answer." Filters matchedDocs through
 * resolveBrainAccess first — a doc the searcher's index found but this user isn't allowed to see
 * is, from this user's point of view, indistinguishable from a doc that was never found at all.
 *
 * @param {string} query
 * @param {BrainDoc[]} matchedDocs - whatever an (external, not-yet-built [P8-W2-01]) index search
 *   returned for `query`, before access filtering.
 * @param {BrainUser} user
 * @returns {{ answer: string, cited: string[] }}
 */
export function answerFromBrain(query, matchedDocs, user) {
  requireNonEmptyString(query, 'query');
  if (!Array.isArray(matchedDocs)) throw new TypeError('answerFromBrain: matchedDocs must be an array');

  const allowed = matchedDocs.filter((doc) => resolveBrainAccess(user, doc).allow);

  if (allowed.length === 0) {
    return { answer: 'not in the brain yet', cited: [] };
  }

  const cited = allowed.map((doc) => requireNonEmptyString(doc.id, 'doc.id'));
  const answer = allowed
    .map((doc) => `[${doc.id}] ${doc.snippet ?? '(no snippet indexed)'}`)
    .join('\n');

  return { answer, cited };
}
