---
source: src/components/dashboard/warehouses/use-dashboard-warehouse.tsx
type: hook-responsibility
isCorrectCase: true
cross_link_generated: .docs/developer/refactors/components/hook/dashboard/warehouses/use-dashboard-warehouse.md
---

## Hook Responsibility

Current source: `src/components/dashboard/warehouses/use-dashboard-warehouse.tsx`
Target hook file: `src/hooks/dashboard/locations/use-dashboard-warehouse.ts` (planned Phase 22 — folder not created in Phase 20)
Used by:
- src/app/(dashboard)/layout.tsx
- src/components/dashboard/bins/DashboardBinsPageView.tsx
- src/components/dashboard/features/bins/create-bin-form.tsx
- src/components/dashboard/features/warehouses/create-warehouse-form.tsx
- src/components/dashboard/features/zones/create-zone-form.tsx
- src/components/dashboard/zones/DashboardZonesPageView.tsx
Owns fetching: Yes - current source issues dashboard data requests.
Owns mutations: Yes - POST client mutations for createWarehouse, createZone, and createBin.
Owns loading state: Yes.
Owns error state: Yes.
Owns DTO transformation: Yes - maps or derives page-ready data in the current file.
Exposes actions: **Current:** flat callbacks `createWarehouse`, `createZone`, `createBin`, `refresh` on context. **Target (Phase 22, D-20-09):** nested `actions` object on hook/context value with the same four operations for consumers that accept grouped callbacks (CFR-12).

## Inputs

- URL warehouseId search param via useSearchParams when present.
- Child React tree provided to DashboardWarehouseProvider.

## Returned DTO

Current return/context shape is derived from the existing source, not a new contract. Phase 18 records the shape for later Phase 19/20 decisions without changing consumers.

## Actions

**Interim (current source):** `createWarehouse`, `createZone`, `createBin`, `refresh` as separate context fields.

**Target shape (Phase 22 documentation contract):** `actions: { createWarehouse, createZone, createBin, refresh }` alongside page-ready DTO fields — implement only when hook extraction lands; keep consumer behavior identical.

## Provider / context decision

`DashboardWarehouseProvider` remains **compatibility scaffolding** mounted from `src/app/(dashboard)/layout.tsx` until usage searches prove all consumers can migrate off hidden context (D-20-08). Phase 22 may dual-export hook + thin provider during migration.

## Dependencies

- Generated component-hook doc: `.docs/developer/refactors/components/hook/dashboard/warehouses/use-dashboard-warehouse.md`
- Source dependencies: @/components/configs/entities/bin/config, @/components/configs/entities/zone/config, @/components/shared/use-error-dialog, @/types/components/form/generic-form.types, @/types, @/types/responses/basic-response, next/navigation, @/lib/axios, @/lib/locations

## Refactor Notes

- Provider/context status: Current DashboardWarehouseProvider wraps dashboard routes and useDashboardWarehouse has a hidden provider dependency. D-02 and D-03 require documenting this before later removal or replacement.
- D-05/D-07/D-09 apply: frontmatter preserved, current responsibilities documented, no source movement or behavior change.
- Phase 19/20 follow-up: classify target ownership, decide whether callbacks should be grouped under actions, and move reusable DTO transformation only after the documentation baseline is accepted.

## Logic Mapping

### Logic Found

Render logic:
- Provider wraps children with context; minimal JSX besides error/loading consumers downstream.

UI-only state:
- No isolated UI-only state beyond loading/error strings exposed on context.

Data fetching logic:
- Client GET `/dashboard/home` via `dashboardApiClient`; effect depends on warehouse filter from URL search params and internal refresh key.

Mutation logic:
- POST create endpoints for warehouse, zone, bin; each triggers `refresh()` on success.

Data transformation logic:
- `useMemo` pipelines from raw API-shaped lists to `Warehouse`, `ZoneTableRow`, `BinTableRow`, denormalized display names, and select options.

Validation logic:
- None in hook beyond trusting API validation responses surfaced as mutation errors.

Error handling logic:
- `extractMutationError` maps Axios/`ApiResponse` failures to `MutationError`; `useErrorDialog.reportError` shows consistent titles/sources.

Reusable utility logic:
- `extractMutationError` — candidate for shared module (see movement plan).

Types/interfaces declared inline:
- `ZoneApiRecord`, `BinApiRecord`, `ApiPayload`, `DashboardHomePayload`, supporting row/option types tied to dashboard home payload.

### Logic Movement Plan

| Logic | Current location | Target location | Reason | Risk |
| --- | --- | --- | --- | --- |
| Raw `/dashboard/home` payload and API record types | Inline in `use-dashboard-warehouse.tsx` | `src/types/api/locations/` (shard filenames TBD Phase 22) | Isolate wire contract from hook implementation (D-20-04, CFR-10 **types/api**) | medium |
| UI-ready rows, options, context data shape | `useMemo` in hook file | `src/types/dto/locations/` + `src/lib/transformers/locations/` | Stable DTO boundary across hooks and feature components (D-20-05/06, CFR-10 **types/dto** / **transformer**) | high |
| Fetch + refresh orchestration | Hook/provider module | `src/hooks/dashboard/locations/use-dashboard-warehouse.ts` | Single async ownership (CFR-09 **hook**) | high |
| Mutation calls + refresh coupling | Flat context actions | Hook-owned **`actions`** namespace (Phase 22) | Satisfies D-20-09/D-20-10 when exposing multiple callbacks (CFR-11/12 **hook**) | medium |
| Mutation error parsing helper | Inline `extractMutationError` | `src/lib/api/extract-mutation-error.ts` | Shared **utility** tier — not transformer mapping (CFR-13); duplicates `extractMutationError` in `src/components/dashboard/devices/use-dashboard-devices.tsx` | medium |
| Provider shell / context typing | Same file today | Future `src/components/features/locations/providers/dashboard-warehouse-provider.tsx` | Compatibility until consumers migrate (D-20-08 **retained render**/feature wiring) | high |

### New Files Needed

| File | Purpose |
| --- | --- |
| `src/types/api/locations/*` | Dashboard home payload + API records |
| `src/types/dto/locations/*` | Table rows, options, KPI-ready shapes consumed by feature components |
| `src/lib/transformers/locations/*` | Normalize API lists → DTOs |
| `src/lib/api/extract-mutation-error.ts` | Shared mutation error parsing |
| `src/hooks/dashboard/locations/use-dashboard-warehouse.ts` | Hook implementation extracted from current component path |

### Notes

- **CFR-13 evidence:** Duplicate `extractMutationError` in `src/components/dashboard/devices/use-dashboard-devices.tsx` — consolidate with warehouse hook during Phase 22 utility extraction.
- **Compatibility checklist:** Preserve URL `warehouseId` filtering semantics, mutation success refresh behavior, and error dialog metadata (`dashboard/warehouses/create`, `dashboard/zones/create`, `dashboard/bins/create`). Re-run consumer inventory from **Used by** before deleting compatibility provider exports.

## Classification

Classification: hook
Reason: Provider/hook/API payload/DTO/transformer/mutation cluster; split later while keeping compatibility provider.
Target folder: `src/hooks/dashboard/locations`
Target file name: `use-dashboard-warehouse.ts`
Keep / Move / Split / Delete: split
Risk level: high

### Evaluation

- Duplicates shadcn/ui: no
- Project-wide reusable: no
- Domain-specific: yes
- Fetches data: yes
- Mutates data: yes
- Contains reusable transformation logic: no
- Defines types inline: yes
- Contains repeated styling: yes
- Contains multiple components: yes
- Still needed: yes

### Decision

Record the split decision as planned ownership only. Phase 19 does not move source files, create target folders, rewrite imports, delete docs, or alter behavior.

## Dismounted Components

| Component | New code path | New documentation path | Reason |
|---|---|---|---|
| `DashboardWarehouseProvider` | `src/components/features/locations/providers/dashboard-warehouse-provider.tsx` | `.docs/developer/refactors/components/dismounted/dashboard-warehouse-provider.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `useDashboardWarehouse` | `src/hooks/dashboard/locations/use-dashboard-warehouse.ts` | `.docs/developer/refactors/components/dismounted/use-dashboard-warehouse.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `DashboardWarehouseContext` | `src/components/features/locations/providers/dashboard-warehouse-provider.tsx` | `.docs/developer/refactors/components/dismounted/dashboard-warehouse-context.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `ApiPayload` | `src/types/api/locations/dashboard-warehouse.ts` | `.docs/developer/refactors/components/dismounted/api-payload.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `ZoneApiRecord` | `src/types/api/locations/dashboard-warehouse.ts` | `.docs/developer/refactors/components/dismounted/zone-api-record.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `BinApiRecord` | `src/types/api/locations/dashboard-warehouse.ts` | `.docs/developer/refactors/components/dismounted/bin-api-record.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `DashboardHomePayload` | `src/types/api/locations/dashboard-warehouse.ts` | `.docs/developer/refactors/components/dismounted/dashboard-home-payload.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `extractMutationError` | `src/lib/api/extract-mutation-error.ts` | `.docs/developer/refactors/components/dismounted/extract-mutation-error.md` | Phase 20 (CFR-13): shared **utility** tier — not `lib/transformers`; consolidate with devices hook duplicate. |
