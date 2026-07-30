# ADJUNTO-100 — RUBRIC DRAFT (12 dimensions)

<!-- RUBRIC-DRAFT v1 owner=P3-W2-02 wo=WO-06 -->

A **proposed** 12-dimension rubric for Adjunto, drafted from v1.4's G6 evidence so the founder **edits,
not authors** ([WO-06]). Each dimension carries a measurable check + honest denominator (the v1.4
"named gap" pattern: an unmet item scores 0 with its name). This draft auto-commits as the working
rubric absent a founder override; the founder may edit any dimension or upload the canonical
ADJUNTO-100-RUBRIC to replace it.

## Dimension 1 — Extraction fidelity
Production PDF/XLSX/image/EML/DOCX extraction + fail-closed on unsupported type. Check: extraction
tests incl. unsupported-type refusal.

## Dimension 2 — Classification accuracy (zero false greens)
Balanced human-labeled N=300 corpus; accuracy with zero false greens; count-pin + doctored-corpus
refusal. Check: `evaluate_corpus.py N=300` acc + FALSE-GREEN REFUSAL.

## Dimension 3 — Billing correctness
The full-price-swap law (see `ADJUNTO-BILLING-LAW.md`); every amount ∈ {0,499,999}; InvalidPrice on
anything else. Check: `pytest tests/test_billing_proration.py`.

## Dimension 4 — Tenant isolation
Cross-tenant read/write denied; a tenant sees only its own rows. Check: isolation battery (404/403 on
cross-tenant).

## Dimension 5 — Auth integrity
Uniform invalid-credentials + equal-cost login pad (no existence oracle); WebAuthn/passkey ceremony
(ST-1). Check: auth-oracle test + WebAuthn harness.

## Dimension 6 — Document lifecycle
Upload → vault → redeploy → identical readback. Check: vault roundtrip identity.

## Dimension 7 — Human handoff
Human-approved broker handoff + acknowledgment receipt; replayed handoff refused. Check: handoff
approval flow + replay refusal.

## Dimension 8 — Accessibility + mobile
375px operator journeys, ≥60px primary controls, spec-level a11y. Check: `spec_check.py` a11y/layout.

## Dimension 9 — Provenance / auditability
Every answer traceable to a receipt/law/ledger; content-addressed receipts verified at record + at
utterance. Check: receipt-store verify.

## Dimension 10 — Bilingual parity (ES/EN)
Metric questions answer identically in ES and EN; no dead keys; lang fallback never throws. Check:
i18n parity + alias tests.

## Dimension 11 — Honest-data discipline
`DATOS DEMO` / EN VIVO / POR ACTIVAR; empty ≠ zero; missing ≠ error; no fabricated numbers. Check:
honesty lint.

## Dimension 12 — Build health
Same-SHA typecheck + lint + tests + build + e2e green. Check: `run-battery.sh` 8/8.

## Scoring

100/100 = all 12 dimensions green at their measurable checks + dual audit (self + independent). Anything
less is quoted with named gaps (the v1.4 96.4 honesty template). Never self-declared.
