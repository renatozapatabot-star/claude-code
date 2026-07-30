# DB-ATLAS — FREIGHT (OS) Supabase system of record

<!-- ATLAS-SPEC v1 owner=P5-W1-01 wo=WO-01 -->

**Status: template, not yet filled from the real database.** This atlas has no read access to the real
Supabase project yet ([WO-01] — the founder must grant a read-only role). Every table row below is the
*expected* shape inferred from the skills and pillar items that reference it in `FREIGHT-OS-CANON.md`,
not a confirmed live schema. [P5-W2-01] fills this from the real DB the moment [WO-01] lands; until
then every row reads **NOT VERIFIED**, never a guessed real value (§0.4 honesty law).

## §Audit checklist — expected tables

| Table | Referenced by (pillar item / skill) | RLS posture (expected) | Status |
|---|---|---|---|
| `entradas` | [P1-W1-01] intake | tenant-scoped (`company_id`) | NOT VERIFIED |
| `documents` (61 types) | [P1-W1-01] intake/validate | tenant-scoped | NOT VERIFIED |
| `traficos` | [P1-W1-01] classify/comply/cross/dispatch/warehouse | tenant-scoped | NOT VERIFIED |
| `pedimentos` | [P1-W1-01] classify; `cost-optimizer` | tenant-scoped | NOT VERIFIED |
| `fracciones` | [P1-W1-01] classify | reference table, no tenant column expected | NOT VERIFIED |
| `expedientes` | [P1-W1-01] USMCA cert stage | tenant-scoped | NOT VERIFIED |
| `clients` | [P1-W1-01] comply; onboarding | tenant-scoped (a client sees only itself) | NOT VERIFIED |
| `carriers` | [P1-W1-01] dispatch | shared reference, no tenant column expected | NOT VERIFIED |
| `inventory` | [P1-W1-01] warehouse | tenant-scoped | NOT VERIFIED |
| `locations` | [P1-W1-01] warehouse | shared reference, no tenant column expected | NOT VERIFIED |
| `accounting` | [P1-W1-01] invoice/audit; `financial-summary` | tenant-scoped | NOT VERIFIED |
| `quotes` | `rate-quote-generator` (P7) | tenant-scoped | NOT VERIFIED |

**Read-only-role checklist ([WO-01]):**

1. A Postgres role granted `SELECT` only — no `INSERT`/`UPDATE`/`DELETE`/`TRUNCATE` — on every table above.
2. Row-Level Security (RLS) confirmed **enabled** on every tenant-scoped table (not just present —
   enabled and enforced for the read-only role itself, not only for the app's service role).
3. No client-side service-role key anywhere in a browser-shipped bundle (v1.4 G7 — verified by
   grepping built frontend output for the service-role JWT prefix once real access lands).
4. Credential handed to this repo's operator lives outside git (env var / secret manager), never
   committed — this atlas records *that a rotation policy exists*, never the credential itself.

## §RLS posture — per-table proof (filled by [P5-W2-01])

Each table above gets one row here once read access lands: `PROVEN` (RLS confirmed enforced against
the read-only role, tested with a cross-tenant probe) or `GAP` (RLS missing, disabled, or bypassable) —
never left blank once tested. No row here is ever set from inference; only from a real, logged probe.

| Table | RLS status | Probe date | Evidence |
|---|---|---|---|
| *(all rows NOT VERIFIED until [WO-01] lands — see checklist above)* | — | — | — |

## §Backups

**Status: NOT VERIFIED — real RPO/RTO unknown until [WO-01] lands.** [WO-11] requires this section
filled with real Recovery Point/Time Objectives once read access exists. Placeholder structure so
[P5-W2-02]'s restore rehearsal has somewhere real to log its result:

- **RPO (Recovery Point Objective):** NOT VERIFIED — depends on the real project's backup cadence
  (Supabase point-in-time recovery window, if enabled).
- **RTO (Recovery Time Objective):** NOT VERIFIED — depends on a rehearsed restore, not a guess.

## §Restore — rehearsal runbook ([P5-W2-02] prep, [WO-11])

Step-by-step rehearsal to run the moment a restore target exists (a staging clone, never the
production project itself):

1. **Snapshot identity proof, before:** record row counts (`SELECT count(*)` per table above) and a
   checksum of one deterministic column set (e.g. `md5(string_agg(id::text, ',' ORDER BY id))` per
   table) on the source.
2. **Trigger the restore** (Supabase PITR or a logical dump/restore) into a disposable target — never
   the live project.
3. **Snapshot identity proof, after:** re-run the same row-count + checksum queries against the
   restored target.
4. **Compare:** row counts and checksums must match exactly, table for table. Any mismatch is a
   real defect, not an acceptable variance — log it, do not average it away.
5. **Log the rehearsal** here (date, source/target identifiers redacted of PII, pass/fail per table)
   — this is the "restore rehearsed once" evidence [WO-11]'s acceptance requires.

| Rehearsal date | Result | Notes |
|---|---|---|
| *(none yet — requires [WO-01] read access first)* | — | — |

## §Redaction rule

This atlas records **structure, never PII**. Row counts, column names, RLS posture, and backup
timestamps are fine to log here; no customer name, RFC/tax id, shipment value, or document content
is ever written into this file. Any anomaly example logged elsewhere (e.g. §5.4) is DATOS DEMO or
explicitly redacted, per the same rule the rest of this canon follows.
