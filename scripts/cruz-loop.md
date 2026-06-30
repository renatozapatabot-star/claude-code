# CRUZ — 100/100 Recursive Design Quality Loop

You are running the CRUZ website design quality loop, full effort, full autonomy.
This file is the canonical directive a scheduled session executes (daily 06:01).
**Self-recursive:** read the state, pick ONE smallest high-leverage move, ship it, prove it,
log it, and leave the next move queued for the following run.

## Mission
Make CRUZ materially closer to the best-looking, most trusted cross-border trade OS on Earth —
in the **white + red canon** (`DESIGN.md`), with the real CRUZ substance (trust loop, roles,
persistent copilot, honest-data, bilingual ES/EN).

## Before you build (every run)
1. `git fetch origin && git checkout claude/cruz-brand-design-r9k8ns && git pull`.
2. Read `DESIGN.md` (the canon) and the last 3 entries of `DESIGN_LOG.md`.
3. Skim `design/reference/` for substance/copy you have not ported yet (navy/cyan = substance, NOT palette).
4. `npm run check` and `node scripts/verify.mjs` to see the current verified state + screenshots.

## The loop (one slice per run, max effort)
1. **Audit** the current surface and design system first.
2. **Pick the smallest high-leverage visual/UX improvement.** Prefer fewer, stronger moves.
3. State: user · action · confusion deleted · kill condition.
4. Add/adjust focused checks if layout/behavior risk exists.
5. **Implement only the smallest coherent slice.**
6. **Verify in a real browser** (`node scripts/verify.mjs`) at desktop **and 375px**; read the shots.
7. Check overflow, overlap, spacing, contrast, loading/empty states, interaction polish.
8. Run touched-file checks (`npm run check`).
9. **Document** in `DESIGN_LOG.md`: surface · user+action · issue · change · verification · commands · proven-vs-subjective · next move.
10. Commit (`git commit`) and `git push -u origin claude/cruz-brand-design-r9k8ns`.

## Boundaries (do not cross)
- Spanish UI / English code. Existing CRUZ substance first; do not invent a new design language.
- No generic cards, purple gradients, marketing hero, decorative filler.
- The trust loop is sacred: CRUZ proposes → human GOes → 5s undo → logged. Never auto-file/pay/email.
- Honest data: `DATOS DEMO`, EN VIVO / POR ACTIVAR, "Pendiente de sincronización." Never fabricate.
- Preserve auth/tenant/compliance invariants. Do not touch a production DB.

## Cadence (every pass — the 100/100 loop)
**Plan → Execute → Verify → Feedback → Output.**
- **Plan:** state the slice (user · action · confusion deleted · kill condition) before touching code.
- **Execute:** smallest coherent slice, max effort, white+red canon, real CRUZ substance.
- **Verify:** real browser at desktop + 375px; read the screenshots; check overflow/contrast/empty states.
- **Feedback:** end every pass by asking the founder what to do next (plan the next slice with them).
- **Output:** append to `DESIGN_LOG.md`, commit, push.

For big sweeps ("complete the whole front end", "ultracode"), fan out parallel agents to mine
`design/reference/` per surface and return specs, then integrate coherently in one hand (cohesion is a
score axis) and verify the whole. Deep-research best-in-class operational UI when a surface is novel.

## Stop condition
Stop only when the current slice is verified, documented, and pushed — and either no safe visual
improvement remains in this surface, or the next move requires founder judgment (then ask the founder
what's next, and queue any open calls in `DESIGN_LOG.md` under "Needs founder").
