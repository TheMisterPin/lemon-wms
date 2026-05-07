---
source: src/components/dashboard/warehouses/use-dashboard-warehouse.tsx
type: hook-responsibility
isCorrectCase: true
cross_link_generated: .docs/developer/refactors/components/hook/dashboard/warehouses/use-dashboard-warehouse.md
---

## Hook Responsibility

Current source: `src/components/dashboard/warehouses/use-dashboard-warehouse.tsx`
Target hook file: TBD Phase 19/20 - no target source folder created in Phase 18.
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
Exposes actions: createWarehouse, createZone, createBin, refresh

## Inputs

- URL warehouseId search param via useSearchParams when present.
- Child React tree provided to DashboardWarehouseProvider.

## Returned DTO

Current return/context shape is derived from the existing source, not a new contract. Phase 18 records the shape for later Phase 19/20 decisions without changing consumers.

## Actions

- createWarehouse
- createZone
- createBin
- refresh

## Dependencies

- Generated component-hook doc: `.docs/developer/refactors/components/hook/dashboard/warehouses/use-dashboard-warehouse.md`
- Source dependencies: @/components/configs/entities/bin/config, @/components/configs/entities/zone/config, @/components/shared/use-error-dialog, @/types/components/form/generic-form.types, @/types, @/types/responses/basic-response, next/navigation, @/lib/axios, @/lib/locations

## Refactor Notes

- Provider/context status: Current DashboardWarehouseProvider wraps dashboard routes and useDashboardWarehouse has a hidden provider dependency. D-02 and D-03 require documenting this before later removal or replacement.
- D-05/D-07/D-09 apply: frontmatter preserved, current responsibilities documented, no source movement or behavior change.
- Phase 19/20 follow-up: classify target ownership, decide whether callbacks should be grouped under actions, and move reusable DTO transformation only after the documentation baseline is accepted.

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
| `extractMutationError` | `src/lib/transformers/locations/mutation-error.ts` | `.docs/developer/refactors/components/dismounted/extract-mutation-error.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
