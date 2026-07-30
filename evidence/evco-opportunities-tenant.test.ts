/**
 * Tenant-scoping regression test — `loadOpportunities` fail-closed on missing companyId.
 * Serves canon [WO-16] / [P4-W1-00] (the opportunities.ts gap logged as "related, separate,
 * not yet fixed" alongside the main scoped-query.ts SEV-1 fix).
 *
 * ============================================================================
 * STATUS — READ BEFORE TRUSTING ANY "PASS" CLAIM ABOUT THIS FILE
 * ============================================================================
 * This file has NOT been executed with the real `vitest` runner. It cannot run inside
 * claude-code (this repo) — it imports from '../lib/trade/opportunities', a module that only
 * exists inside evco-portal's own src tree, and needs evco-portal's installed `vitest` +
 * `@supabase/supabase-js` to even parse. It is a staged, ready-to-drop-in spec, not a `vitest`
 * result.
 *
 * What HAS been verified (2026-07-30, this session): evidence/evco-opportunities-tenant-fix.patch
 * was applied to and reverted cleanly against a disposable scratch copy of the real
 * src/lib/trade/opportunities.ts (`git apply --check` from evco-portal's own repo root, then
 * applied + reverted, leaving evco-portal untouched — no write access confirmed yet per WO-16).
 * `tsc` was NOT run against it (no node_modules under evco-portal in this environment, same
 * limitation the sibling evco-cross-tenant.test.ts already discloses) — the patch's type
 * change (companyId: string, was string | undefined) is a narrowing of an already-optional
 * parameter that the one real call site (client-summary.ts's loadClientTradeSummary, and its
 * own test at src/lib/trade/__tests__/client-summary.test.ts) already always supplies as a
 * required, non-empty string, so it should typecheck, but this has not been machine-verified.
 * Do not report this suite as green until someone has actually run it with real `vitest`.
 *
 * To actually run this suite for real:
 *   1. Apply evidence/evco-opportunities-tenant-fix.patch inside evco-portal
 *      (git apply evco-opportunities-tenant-fix.patch from the evco-portal repo root).
 *   2. Copy this file to evco-portal/src/lib/trade/__tests__/evco-opportunities-tenant.test.ts.
 *   3. `npx vitest run src/lib/trade/__tests__/evco-opportunities-tenant.test.ts` inside evco-portal.
 *
 * ============================================================================
 * FIXTURE DATA DISCLOSURE
 * ============================================================================
 * Every row below is SIM/fixture data invented for this test (prefixed `SIM-`). It does not
 * touch, query, or resemble a live evco-portal Supabase project — it exercises the real
 * `loadOpportunities` logic (imported unmodified from the patched source) against an in-memory
 * fake client shaped like the real PostgrestFilterBuilder surface that function calls:
 * `.select()`, `.eq()`, `.order()`, `.limit()`.
 * ============================================================================
 */

import { describe, it, expect, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { loadOpportunities } from '../opportunities'

// ── SIM fixture data: two tenants' traficos in one table, as a real cross-tenant Supabase
// table would actually look — this is exactly the shape a missing tenant filter would leak. ──
const SIM_ALL_TRAFICOS = [
  { company_id: 'SIM-evco', aduana: 'Laredo', proveedor: 'SIM-Acme', valor_aduana: 1000, fecha_llegada: '2026-07-01' },
  { company_id: 'SIM-evco', aduana: 'Laredo', proveedor: 'SIM-Acme', valor_aduana: 1200, fecha_llegada: '2026-07-05' },
  { company_id: 'SIM-mafesa', aduana: 'Nuevo Laredo', proveedor: 'SIM-Zeta', valor_aduana: 5000, fecha_llegada: '2026-07-10' },
]

function fakeSupabase(rowsByTenant: Record<string, typeof SIM_ALL_TRAFICOS>): SupabaseClient {
  const from = vi.fn(() => {
    let eqCompanyId: string | undefined
    const builder: any = {
      select: vi.fn(() => builder),
      eq: vi.fn((col: string, val: string) => { if (col === 'company_id') eqCompanyId = val; return builder }),
      order: vi.fn(() => builder),
      limit: vi.fn(async () => {
        // No .eq('company_id', ...) call at all == the pre-fix leak path (unfiltered, every
        // tenant's rows). This fake models that faithfully so the test can prove the FIXED
        // function never reaches it with an empty/missing companyId.
        const data = eqCompanyId ? (rowsByTenant[eqCompanyId] ?? []) : SIM_ALL_TRAFICOS
        return { data, error: null }
      }),
    }
    return builder
  })
  return { from } as unknown as SupabaseClient
}

describe('loadOpportunities — tenant-scoping fail-closed (opportunities.ts fix)', () => {
  it('a valid companyId only ever sees that tenant\'s own rows', async () => {
    const sb = fakeSupabase({ 'SIM-evco': SIM_ALL_TRAFICOS.filter(r => r.company_id === 'SIM-evco') })
    const result = await loadOpportunities(sb, 'SIM-evco')
    expect(result.totalShipments).toBe(2)
  })

  it('an empty-string companyId returns the honest-empty set WITHOUT ever querying Supabase', async () => {
    const from = vi.fn()
    const sb = { from } as unknown as SupabaseClient
    const result = await loadOpportunities(sb, '')
    expect(result).toEqual({ totalShipments: 0, topLanes: [], topSuppliers: [], notes: [] })
    expect(from).not.toHaveBeenCalled() // proves the fail-closed guard runs BEFORE any query —
    // the pre-fix version would have called `.from('traficos').select('*')` with no `.eq()` at
    // all here, returning every tenant's rows instead of refusing.
  })

  it('REGRESSION (would have failed pre-fix): a missing companyId must never fall through to an unfiltered cross-tenant read', async () => {
    // This models exactly what the OLD `if (companyId) q = q.eq(...)` logic did: with no
    // companyId, the fake's .eq() is never called, so `eqCompanyId` stays undefined and the
    // fake's own pre-fix-faithful `.limit()` returns SIM_ALL_TRAFICOS (all tenants) — the old
    // bug's exact leak shape. The regression this test pins is that `loadOpportunities` itself
    // must short-circuit before ever reaching that call.
    const sb = fakeSupabase({})
    const result = await loadOpportunities(sb, undefined as unknown as string)
    expect(result.totalShipments).toBe(0) // NOT 3 (SIM_ALL_TRAFICOS.length) — a pre-fix version
    // calling the fake directly (bypassing the guard) would see all 3 rows across both tenants.
  })
})
