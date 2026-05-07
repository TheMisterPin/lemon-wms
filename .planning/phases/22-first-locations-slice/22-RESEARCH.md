---
phase: 22-first-locations-slice
status: snapshot
created: 2026-05-07
---

# Phase 22 — Research snapshot

## 22-01 (primitive move)

- **Consumers:** Twenty-one TSX modules imported from the old dashboard warehouses path; rewired to `@/components/primitives/warehouse-overview-primitives`.
- **Risk:** High touch count — mitigated by mechanical path replace + `git mv` preserving history.
- **`tsc --noEmit`:** Project has pre-existing type errors unrelated to this move; no new path resolution errors observed for the primitive module.

## Follow-on (not in 22-01)

- `use-dashboard-warehouse.tsx` split, `extractMutationError` extraction, `src/components/features/locations/**` page moves — per existing refactor map / Phase 20 Logic Mapping.
