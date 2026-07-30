/**
 * SEV-1 regression test — cross-tenant read denial for `scopedQuery`.
 * Serves canon [WO-16] / [P4-W1-00].
 *
 * ============================================================================
 * STATUS — READ BEFORE TRUSTING ANY "PASS" CLAIM ABOUT THIS FILE
 * ============================================================================
 * This file has NOT been executed with the real `vitest` runner. It cannot
 * run inside claude-code (this repo) — it imports from
 * '../lib/supabase/scoped-query', a module that only exists inside
 * evco-portal's own src tree, and it needs evco-portal's installed `vitest`
 * + `@supabase/supabase-js` to even parse. It is a staged, ready-to-drop-in
 * spec, not a `vitest` result.
 *
 * What HAS been verified (2026-07-30, this session): the now-complete
 * evco-cross-tenant-fix.patch — which touches scoped-query.ts AND every
 * real call site (src/app/api/agent/ask/route.ts,
 * src/__tests__/data-integrity-v2.test.ts, and five src/app/v2/*/page.tsx
 * files that were calling scopedQuery directly, with no companyId, and no
 * session read at all) — was applied to a disposable scratch copy of the
 * real files and typechecked clean with `tsc --noEmit` (zero errors,
 * against hand-written ambient stubs for @supabase/supabase-js, next/server,
 * next/headers, vitest, and the unrelated format/component modules — no
 * node_modules exist under evco-portal in this environment). That confirms
 * the patch compiles; it does NOT confirm this vitest suite's assertions
 * pass, because vitest itself was never run.
 *
 * To actually run this suite for real:
 *   1. Apply evidence/evco-cross-tenant-fix.patch inside evco-portal
 *      (git apply evco-cross-tenant-fix.patch from the evco-portal repo root).
 *   2. Copy this file to evco-portal/src/__tests__/evco-cross-tenant.test.ts.
 *   3. `npx vitest run src/__tests__/evco-cross-tenant.test.ts` inside evco-portal.
 * Nobody has done step 3 as of this writing. Do not report this suite as
 * green until someone actually has.
 *
 * ============================================================================
 * FIXTURE DATA DISCLOSURE
 * ============================================================================
 * Every row below is SIM/fixture data invented for this test (prefixed
 * `SIM-`). It does not touch, query, or resemble a live evco-portal
 * Supabase project — it exercises the real `resolveTenantColumn` /
 * `scopedQuery` / `scopedQueryNoDate` logic (imported unmodified from the
 * patched source) against an in-memory fake client shaped like the real
 * PostgrestFilterBuilder surface those functions call: `.select()`, `.eq()`,
 * `.gte()`, `.lt()`, `.limit()`, `.maybeSingle()`.
 * ============================================================================
 */

import { describe, it, expect, beforeEach } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  resolveTenantColumn,
  scopedQuery,
  scopedQueryNoDate,
} from '../lib/supabase/scoped-query'

// ── SIM fixture data ────────────────────────────────────────────────────

const SIM_COMPANIES = [
  { company_id: 'evco', clave_cliente: '9254', globalpc_clave: null },
  { company_id: 'mafesa', clave_cliente: '8831', globalpc_clave: null },
]

// SIM only — the ~$5.86M figure echoes the canon finding's order of
// magnitude for flavor; it is not a real dollar amount from any real
// shipment or invoice.
const SIM_TRAFICOS = [
  { id: 'SIM-t1', company_id: 'evco', fecha_cruce: '2026-06-01', valor: 100000 },
  { id: 'SIM-t2', company_id: 'evco', fecha_cruce: '2026-06-02', valor: 200000 },
  { id: 'SIM-t3', company_id: 'mafesa', fecha_cruce: '2026-06-03', valor: 5860000 },
  { id: 'SIM-t4', company_id: 'mafesa', fecha_cruce: '2026-06-04', valor: 75000 },
]

const SIM_TABLES: Record<string, Array<Record<string, unknown>>> = {
  companies: SIM_COMPANIES,
  traficos: SIM_TRAFICOS,
}

// ── Fake Supabase client — just enough surface for scoped-query.ts ─────

type Row = Record<string, unknown>
type Filter = (row: Row) => boolean

class FakeQueryBuilder implements PromiseLike<{ data: Row[] | Row | null; error: null; count?: number }> {
  private filters: Filter[] = []
  private limitN: number | null = null
  private single = false
  private headCount = false

  constructor(private rows: Row[]) {}

  select(_cols: string, opts?: { count?: 'exact'; head?: boolean }) {
    if (opts?.head && opts.count === 'exact') this.headCount = true
    return this
  }

  eq(col: string, val: unknown) {
    this.filters.push((r) => String(r[col]) === String(val))
    return this
  }

  gte(col: string, val: unknown) {
    this.filters.push((r) => r[col] !== undefined && String(r[col]) >= String(val))
    return this
  }

  lt(col: string, val: unknown) {
    this.filters.push((r) => r[col] !== undefined && String(r[col]) < String(val))
    return this
  }

  limit(n: number) {
    this.limitN = n
    return this
  }

  maybeSingle() {
    this.single = true
    return this
  }

  private matched(): Row[] {
    return this.rows.filter((r) => this.filters.every((f) => f(r)))
  }

  then<TResult1 = unknown, TResult2 = never>(
    onfulfilled?: ((value: { data: Row[] | Row | null; error: null; count?: number }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    const matched = this.matched()
    let result: { data: Row[] | Row | null; error: null; count?: number }
    if (this.headCount) {
      result = { data: null, error: null, count: matched.length }
    } else if (this.single) {
      result = { data: matched[0] ?? null, error: null }
    } else {
      result = { data: this.limitN != null ? matched.slice(0, this.limitN) : matched, error: null }
    }
    return Promise.resolve(onfulfilled ? onfulfilled(result) : (result as unknown as TResult1))
      .then(undefined, onrejected ?? undefined) as PromiseLike<TResult1 | TResult2>
  }
}

class FakeSupabaseClient {
  from(table: string) {
    return new FakeQueryBuilder(SIM_TABLES[table] ?? [])
  }
}

function fakeClient(): SupabaseClient {
  return new FakeSupabaseClient() as unknown as SupabaseClient
}

// ── Tests ────────────────────────────────────────────────────────────────

describe('SEV-1 fix — scopedQuery derives tenant strictly from session.companyId', () => {
  let client: SupabaseClient
  beforeEach(() => {
    client = fakeClient()
  })

  it('EVCO session sees only EVCO traficos — MAFESA rows are denied', async () => {
    const q = await scopedQuery(client, 'traficos', 'fecha_cruce', 'evco')
    const { data, error } = (await q.builder.limit(10)) as { data: Row[]; error: null }
    expect(error).toBeFalsy()
    expect(data.length).toBeGreaterThan(0)
    for (const row of data) {
      expect(row.company_id).toBe('evco')
    }
    const ids = data.map((r) => r.id)
    expect(ids).not.toContain('SIM-t3') // MAFESA's row
    expect(ids).not.toContain('SIM-t4') // MAFESA's row
  })

  it('MAFESA session sees only MAFESA traficos — EVCO rows are denied (the reverse case)', async () => {
    const q = await scopedQuery(client, 'traficos', 'fecha_cruce', 'mafesa')
    const { data, error } = (await q.builder.limit(10)) as { data: Row[]; error: null }
    expect(error).toBeFalsy()
    expect(data.length).toBeGreaterThan(0)
    for (const row of data) {
      expect(row.company_id).toBe('mafesa')
    }
    const ids = data.map((r) => r.id)
    expect(ids).not.toContain('SIM-t1') // EVCO's row
    expect(ids).not.toContain('SIM-t2') // EVCO's row
  })

  it('resolveTenantColumn for "mafesa" never resolves to EVCO\'s column/value', async () => {
    const tenant = await resolveTenantColumn(client, 'traficos', 'mafesa')
    expect(tenant).not.toBeNull()
    expect(tenant?.value).not.toBe('evco')
    expect(tenant?.value).not.toBe('9254') // EVCO's legacy clave
    expect(tenant?.value).toBe('mafesa')
  })

  it('resolveTenantColumn for "evco" never resolves to MAFESA\'s column/value', async () => {
    const tenant = await resolveTenantColumn(client, 'traficos', 'evco')
    expect(tenant).not.toBeNull()
    expect(tenant?.value).not.toBe('mafesa')
    expect(tenant?.value).not.toBe('8831') // MAFESA's legacy clave
    expect(tenant?.value).toBe('evco')
  })

  it('missing companyId is denied outright — never defaults to any tenant', async () => {
    const q = await scopedQuery(client, 'traficos', 'fecha_cruce', '')
    expect(q.tenant).toBeNull()
    const { data, error } = (await q.builder.limit(10)) as { data: Row[]; error: null }
    expect(error).toBeFalsy()
    expect(data.length).toBe(0)
  })

  it('an unknown companyId (no companies row) is denied, not defaulted to EVCO', async () => {
    const q = await scopedQuery(client, 'traficos', 'fecha_cruce', 'not-a-real-tenant')
    expect(q.tenant).toBeNull()
    const { data } = (await q.builder.limit(10)) as { data: Row[]; error: null }
    expect(data.length).toBe(0)
  })

  it('scopedQueryNoDate applies the same per-tenant denial', async () => {
    const evcoQ = await scopedQueryNoDate(client, 'traficos', 'evco')
    const { data: evcoData } = (await evcoQ.builder) as unknown as { data: Row[] }
    for (const row of evcoData) expect(row.company_id).toBe('evco')

    const mafesaQ = await scopedQueryNoDate(client, 'traficos', 'mafesa')
    const { data: mafesaData } = (await mafesaQ.builder) as unknown as { data: Row[] }
    for (const row of mafesaData) expect(row.company_id).toBe('mafesa')
  })

  it('resolution cache is keyed per-tenant, not per-table alone (no cross-tenant cache poisoning)', async () => {
    // Resolve EVCO first, then MAFESA, against the SAME table. If the cache
    // were keyed by table alone (the pre-fix shape), the second call could
    // return the first tenant's cached column/value.
    const evcoTenant = await resolveTenantColumn(client, 'traficos', 'evco')
    const mafesaTenant = await resolveTenantColumn(client, 'traficos', 'mafesa')
    expect(evcoTenant?.value).toBe('evco')
    expect(mafesaTenant?.value).toBe('mafesa')
    expect(evcoTenant?.value).not.toBe(mafesaTenant?.value)
  })
})

describe('vulnerability reproduction — what the REMOVED hardcoded candidate list did', () => {
  // This block does NOT import the real removed code (it no longer exists
  // post-fix). It re-states, inline, the exact shape of the vulnerable
  // EVCO_CANDIDATES sniffing logic that was in scoped-query.ts before the
  // WO-16/P4-W1-00 fix, purely to make the contrast concrete: the OLD
  // logic ignored its `companyId` argument entirely (it didn't even take
  // one), so ANY session — MAFESA included — matched EVCO's hardcoded
  // candidates and got EVCO's rows back.
  const OLD_EVCO_CANDIDATES = [
    { column: 'company_id', value: 'evco' },
    { column: 'company_id', value: '9254' },
  ]

  async function OLD_vulnerableResolveTenantColumn(client: SupabaseClient, table: string) {
    for (const cand of OLD_EVCO_CANDIDATES) {
      const { count } = (await (client as unknown as FakeSupabaseClient)
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq(cand.column, cand.value)) as unknown as { count: number }
      if (typeof count === 'number' && count > 0) return cand
    }
    return null
  }

  it('demonstrates the SEV-1: a MAFESA session got EVCO-shaped tenant binding under the OLD code', async () => {
    const client = fakeClient()
    // Old function signature took no companyId — this call site represents
    // a MAFESA session hitting the same code path an EVCO session would.
    const resolved = await OLD_vulnerableResolveTenantColumn(client, 'traficos')
    // The bug: resolved to EVCO's binding regardless of which tenant was
    // actually asking.
    expect(resolved?.value).toBe('evco')
  })

  it('the FIXED resolveTenantColumn does not reproduce that behavior for a mafesa session', async () => {
    const client = fakeClient()
    const resolved = await resolveTenantColumn(client, 'traficos', 'mafesa')
    expect(resolved?.value).not.toBe('evco')
    expect(resolved?.value).toBe('mafesa')
  })
})
