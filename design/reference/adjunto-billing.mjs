// Adjunto billing law — full-price swap, never stack (canon [P3-W2-01], rule [WO-05], spec
// ADJUNTO-BILLING-LAW.md). Pure functions only: every export takes a ledger state in and returns a
// new ledger state out (or throws), never touches wall-clock time, disk, or any network — a drop-in
// candidate for the real Adjunto repo's billing.py port, not a live billing system.
//
// Plans (confirmed from the law doc + FREIGHT-OS-CANON [WO-05]/[P3-W2-01]): free $0, pro $4.99 (499
// cents), team $9.99 (999 cents). Upgrade is pro→team only — there is no free→team direct upgrade and
// no downgrade path at all (InvalidTransition), matching "No downgrade path (InvalidTransition)".

export const PLAN_PRICE = Object.freeze({ free: 0, pro: 499, team: 999 });
const ALLOWED_AMOUNTS = new Set([0, 499, 999]);

export class InvalidPriceError extends Error {
  constructor(amount) {
    super(`InvalidPrice: amount ${amount} is not in {0, 499, 999}`);
    this.name = 'InvalidPriceError';
    this.code = 'InvalidPrice';
    this.amount = amount;
  }
}

export class InvalidTransitionError extends Error {
  constructor(reason) {
    super(`InvalidTransition: ${reason}`);
    this.name = 'InvalidTransitionError';
    this.code = 'InvalidTransition';
  }
}

/** Fresh, empty ledger state. Pass the returned value into every subsequent call. */
export function createLedger() {
  return { rows: [], customers: {}, ops: {} };
}

function getCustomer(state, customerId) {
  return state.customers[customerId] ?? { status: 'none', net: 0 };
}

function withCustomer(state, customerId, customer) {
  return { ...state, customers: { ...state.customers, [customerId]: customer } };
}

function appendRow(state, row) {
  return { ...state, rows: [...state.rows, row] };
}

function nextId(state) {
  return state.rows.length + 1;
}

// Every mutating op is keyed by a caller-supplied idempotencyKey. Replaying the same key returns the
// exact rows the first call produced and leaves state untouched — this is what makes case 8 (the
// team-charge replay) hold even though upgrade() posts two rows (refund + charge) per call.
function runIdempotent(state, opKey, fn) {
  if (opKey) {
    const cached = state.ops[opKey];
    if (cached) return { state, rows: cached.rows };
  }
  const { state: nextState, rows } = fn(state);
  const finalState = opKey ? { ...nextState, ops: { ...nextState.ops, [opKey]: { rows } } } : nextState;
  return { state: finalState, rows };
}

/**
 * First-ever paid subscription for a customer. Always enters at the pro tier ($4.99) — there is no
 * direct subscribe-to-team, matching the doc's "no upgrade without a standing pro subscription".
 * @returns {{ state: object, rows: object[] }}
 */
export function subscribe(state, { customerId, idempotencyKey } = {}) {
  return runIdempotent(state, idempotencyKey && `subscribe:${customerId}:${idempotencyKey}`, (s) => {
    const customer = getCustomer(s, customerId);
    if (customer.status !== 'none') {
      throw new InvalidTransitionError(`customer ${customerId} already has an active plan (${customer.status})`);
    }
    const row = { id: nextId(s), customerId, type: 'charge', plan: 'pro', amount: PLAN_PRICE.pro };
    const updated = withCustomer(appendRow(s, row), customerId, { status: 'pro', net: PLAN_PRICE.pro });
    return { state: updated, rows: [row] };
  });
}

/**
 * Full-price swap: refund the outgoing plan at exact list price, charge the new plan at exact list
 * price. Only pro→team exists. Never a fractional/prorated amount, never a stacked charge.
 */
export function upgrade(state, { customerId, idempotencyKey } = {}) {
  return runIdempotent(state, idempotencyKey && `upgrade:${customerId}:${idempotencyKey}`, (s) => {
    const customer = getCustomer(s, customerId);
    if (customer.status !== 'pro') {
      throw new InvalidTransitionError(
        customer.status === 'none'
          ? `customer ${customerId} has no standing pro subscription to upgrade from`
          : `customer ${customerId} is already on the top tier (${customer.status})`,
      );
    }
    const refundRow = { id: nextId(s), customerId, type: 'refund', plan: 'pro', amount: -PLAN_PRICE.pro };
    const afterRefund = appendRow(s, refundRow);
    const chargeRow = { id: nextId(afterRefund), customerId, type: 'charge', plan: 'team', amount: PLAN_PRICE.team };
    const afterCharge = appendRow(afterRefund, chargeRow);
    const updated = withCustomer(afterCharge, customerId, { status: 'team', net: PLAN_PRICE.team });
    return { state: updated, rows: [refundRow, chargeRow] };
  });
}

/** Cancel refunds the standing current-plan charge in full and ends the subscription. */
export function cancel(state, { customerId, idempotencyKey } = {}) {
  return runIdempotent(state, idempotencyKey && `cancel:${customerId}:${idempotencyKey}`, (s) => {
    const customer = getCustomer(s, customerId);
    if (customer.status === 'none') {
      throw new InvalidTransitionError(`customer ${customerId} has no active subscription to cancel`);
    }
    const refundRow = { id: nextId(s), customerId, type: 'refund', plan: customer.status, amount: -customer.net };
    const updated = withCustomer(appendRow(s, refundRow), customerId, { status: 'none', net: 0 });
    return { state: updated, rows: [refundRow] };
  });
}

/**
 * Hand-crafted / manual refund tool (the doc's case 3 & 7 path — an out-of-band admin correction, not
 * part of the subscribe/upgrade/cancel state machine). Two guards, checked in order:
 *   1. amount must be a legal list-price amount at all ({0, 499, 999}), else InvalidPrice.
 *   2. amount must exactly equal the customer's current net, else InvalidTransition.
 * AMBIGUITY NOTE: the law doc gives only "exceeding net -> InvalidTransition" (case 7) and doesn't say
 * what happens to a legal-priced amount that is *less than* net but not zero (e.g. amount=499 against
 * a team customer's net=999). Allowing that would leave a net of 500, which is outside {0,499,999} and
 * breaks the doc's own amount-set invariant ("no fractional amount ever exists"). I resolved this by
 * requiring an exact match (or 0, a true no-op) rather than merely "not exceeding" — so every legal
 * refund can only take net to 0 or leave it unchanged, never to a non-canonical value. This is a
 * strictly narrower rule than the doc states explicitly, and I'm flagging it rather than guessing
 * silently.
 */
export function refund(state, { customerId, amount, idempotencyKey } = {}) {
  return runIdempotent(state, idempotencyKey && `refund:${customerId}:${idempotencyKey}`, (s) => {
    if (!ALLOWED_AMOUNTS.has(amount)) {
      throw new InvalidPriceError(amount);
    }
    if (amount === 0) return { state: s, rows: [] };
    const customer = getCustomer(s, customerId);
    if (amount > customer.net) {
      throw new InvalidTransitionError(`refund ${amount} exceeds customer ${customerId}'s net ${customer.net}`);
    }
    if (amount !== customer.net) {
      throw new InvalidTransitionError(
        `partial refund ${amount} of net ${customer.net} would leave a non-canonical net; only a full-net refund (or 0) is valid`,
      );
    }
    const refundRow = { id: nextId(s), customerId, type: 'refund', plan: customer.status, amount: -amount };
    const updated = withCustomer(appendRow(s, refundRow), customerId, { status: 'none', net: 0 });
    return { state: updated, rows: [refundRow] };
  });
}

/** Sum of a customer's ledger rows — used to verify net-paid tracks the standing charge exactly. */
export function ledgerNet(state, customerId) {
  return state.rows.filter((r) => r.customerId === customerId).reduce((sum, r) => sum + r.amount, 0);
}

/** The amount-set invariant itself, exposed so callers (and this repo's tests) can assert it directly. */
export function allAmountsCanonical(state) {
  return state.rows.every((r) => ALLOWED_AMOUNTS.has(Math.abs(r.amount)));
}
