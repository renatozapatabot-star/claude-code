# ADJUNTO — BILLING LAW (full-price swap, never stack)

<!-- BILLING-SPEC v1 owner=P3-W2-01 wo=WO-05 -->

The twin billing rule ([WO-05], from v1.4 RES-05), ready to drop into the real Adjunto repo on [WO-07].
**Rule:** an upgrade **ENDS** the outgoing plan period — `upgrade = refund(current plan price) +
charge(new plan price)`, both at **exact list price**, so the standing net for the current tier always
equals its list price. Cancel refunds the standing current-plan charge. **No proration; no stacking; no
fractional amount ever exists.** Every ledger amount ∈ **{0, 499, 999}**. No downgrade path
(InvalidTransition). This kills the subscribe→upgrade→cancel arbitrage class.

## The amount-set invariant

After **every** operation, in a randomized 200-op sequence (seeded): every ledger row amount ∈
{0, 499, 999} ∧ every customer's net paid == the sum of standing charges ∧ no standing charge exists
without a matching non-canceled subscription state.

## The 8 test cases (concrete inputs → expected)

1. **subscribe→upgrade nets standing 999** — ledger rows +499, −499, +999; net 999.
2. **subscribe→upgrade→cancel nets 0** — full refund of the standing 999; net 0; **never** a 499-paid
   team stint (the v1.4 B5 arbitrage repro: 1 cycle + 3 cycles with distinct customer ids over a
   shared Stripe twin; per-cycle net ∈ {0, 999}).
3. **hand-crafted 500 refund → InvalidPrice** — any amount ∉ {0,499,999} is rejected.
4. **upgrade from free → InvalidTransition** — no upgrade without a standing pro subscription.
5. **double upgrade → InvalidTransition** — already on the top tier.
6. **cancel from canceled → InvalidTransition.**
7. **refund exceeding net → InvalidTransition.**
8. **idempotent replay** — a replayed team-charge idempotency key returns the original row, never
   double-posts (the v1.4 G6-O1 law holds through the swap).

## Home

The rule lives in `billing.py`'s header when ported; the 8 cases become
`tests/test_billing_proration.py` (failing-first). Acceptance in the real repo: `pytest -q tests/`
exit 0 incl. the arbitrage-net assertions.
