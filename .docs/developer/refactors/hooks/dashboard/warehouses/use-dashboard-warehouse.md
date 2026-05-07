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
Owns mutations: Yes - POST client mutation, createWarehouse, createZone, createBin, delete.
Owns loading state: Yes.
Owns error state: Yes.
Owns DTO transformation: Yes - maps or derives page-ready data in the current file.
Exposes actions: POST client mutation, createWarehouse, createZone, createBin, delete, refresh

## Inputs

- URL warehouseId search param via useSearchParams when present.
- Child React tree provided to DashboardWarehouseProvider.

## Returned DTO

Current return/context shape is derived from the existing source, not a new contract. Phase 18 records the shape for later Phase 19/20 decisions without changing consumers.

## Actions

- POST client mutation
- createWarehouse
- createZone
- createBin
- delete
- refresh

## Dependencies

- Generated component-hook doc: `.docs/developer/refactors/components/hook/dashboard/warehouses/use-dashboard-warehouse.md`
- Source dependencies: @/components/configs/entities/bin/config, @/components/configs/entities/zone/config, @/components/shared/use-error-dialog, @/types/components/form/generic-form.types, @/types, @/types/responses/basic-response, next/navigation, @/lib/axios, @/lib/locations

## Refactor Notes

- Provider/context status: Current DashboardWarehouseProvider wraps dashboard routes and useDashboardWarehouse has a hidden provider dependency. D-02 and D-03 require documenting this before later removal or replacement.
- D-05/D-07/D-09 apply: frontmatter preserved, current responsibilities documented, no source movement or behavior change.
- Phase 19/20 follow-up: classify target ownership, decide whether callbacks should be grouped under actions, and move reusable DTO transformation only after the documentation baseline is accepted.
