# Phase 20 — Logic mapping summary

**Milestone:** v1.2 Component folder restructuring  
**Scope:** Documentation only. Phase 20 updates refactor markdown under `.docs/developer/refactors/**` (and optional `.planning/**` tracking). It does **not** edit `src/**`, create `src/components/features/**`, `src/hooks/**`, new `src/types/**`, or `src/lib/transformers/**` trees — Phase 22 owns folder creation and code moves.

**Template:** `.cursor/rules/refactor-documentation-workflow.mdc` (`## Logic Mapping`, Hook Documentation Template).

## Logic Mapping

This file is the **phase-level** charter for Logic Mapping depth and CFR-10 targets. Each component and hook refactor doc adds its own `## Logic Mapping` section using the templates referenced above.

---

## Depth rule (full vs concise)

Use `_classification-summary.md` rows to choose depth:

| Use **full** `## Logic Mapping` (with `### Logic Found`, `### Logic Movement Plan`, `### New Files Needed`, `### Notes`) | Use **concise** Logic Mapping |
| --- | --- |
| Action is **split** or **split or keep grouped** | Action is **move** or **keep** with single-component, low/medium risk |
| Risk is **high** | No split / no multi-component churn |
| Multi-component is **yes** | Helpers are trivial or purely presentational |

**Full** sections must enumerate CFR-09 categories under **Logic Found** and map each meaningful item in **Logic Movement Plan** with **Reason** and **Risk** (D-20-03).

**Concise** sections: short bullets under **Logic Found** plus a compact movement table (or “retained in render” statement) — enough for Phase 22 without re-auditing the whole file.

---

## CFR-10 target kinds (movement table)

| Kind | Meaning | Warehouse slice examples (planned paths only) |
| --- | --- | --- |
| **hook** | Fetching, mutations, loading/error/refetch, page-ready state | `src/hooks/dashboard/locations/use-dashboard-warehouse.ts` |
| **transformer** | API payload → UI DTO mapping / normalization (not mutation-error parsing) | `src/lib/transformers/locations/*` |
| **types/api** | Raw response/request shapes from routes | `src/types/api/locations/*` |
| **types/dto** | UI-ready records passed across hooks and feature components | `src/types/dto/locations/*` |
| **utility** | Shared non-DTO helpers (e.g. Axios error parsing shared across hooks) | `src/lib/api/extract-mutation-error.ts` (Phase 22) |
| **retained render** | Stays in component — presentational JSX, local UI state | Inline `useState` for sheets/toggles |
| **deferred** | Phase 21 primitives or later slices — document explicitly | Primitive extraction candidates |

---

## Phase 21 primitive register

Canonical **approve / defer / reject** decisions (CFR-14–CFR-17): `.docs/developer/refactors/_primitive-extraction-plan.md`. Phase 22 uses this register after Logic Mapping when promoting UI to `src/components/primitives`.

---

## Hook docs (CFR-11, CFR-12)

Canonical hook docs under `.docs/developer/refactors/hooks/` must record:

- Target hook file, consumers, inputs, returned DTO shape (page-ready, not raw API)
- **Actions:** when more than two callbacks exist today, **target** nested `actions` object for Phase 22 (D-20-09/D-20-10); flat callbacks may remain in code until implementation
- Provider/context compatibility narrative where applicable (D-20-08)

Generated docs under `.docs/developer/refactors/components/hook/` must stay consistent with canonical hook docs (pointer or duplicated essentials).

---

## Mutation error parsing (CFR-13)

Duplicate **`extractMutationError`** implementations exist (e.g. `src/components/dashboard/warehouses/use-dashboard-warehouse.tsx` and `src/components/dashboard/devices/use-dashboard-devices.tsx`). Phase 22 should consolidate to a shared **`src/lib/api/extract-mutation-error.ts`** (utility tier — **not** under `lib/transformers`). Movement tables must say **utility**, not transformer.

---

## Verification gates

After every Phase 20 doc task or wave:

```bash
git diff --name-only -- 'src/**'
git status --porcelain -- src
```

Both must be empty. Spot-check Logic Mapping coverage:

```bash
rg '^## Logic Mapping' .docs/developer/refactors
```

Optional baseline (only if the directory does not yet exist on the branch — do **not** create it):

```bash
test ! -d src/components/features/locations && echo 'baseline: locations feature folder absent'
```

---

## Phase 20 completion checklist

- [x] `_logic-mapping-summary.md` created and referenced by executors.
- [x] Warehouse hook cluster documents `src/lib/api/extract-mutation-error.ts` utility path (CFR-13).
- [x] Devices hook doc cross-references warehouse mutation-error consolidation.
- [x] Refactor docs touched only under `.docs/developer/refactors/**` and `.planning/ROADMAP.md` (plan 20-09).
- [x] Gate: `git diff --name-only -- 'src/**'` empty; `git status --porcelain -- src` empty.
- [x] Gate: `rg '^## Logic Mapping' .docs/developer/refactors --glob '*.md'` returns non-zero hit count.

---

## Layout / provider integration

`DashboardWarehouseProvider` mount in `src/app/(dashboard)/layout.tsx` is summarized in `.docs/developer/refactors/components/_refactor-map.md`. Detailed provider responsibilities and split plan live in the warehouse hook Logic Mapping — **do not** duplicate large tables in the refactor map (cross-link only).
