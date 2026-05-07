---
source: src/hooks/dashboard/locations/use-dashboard-warehouse.tsx
type: hook-responsibility
isCorrectCase: true
cross_link_generated: .docs/developer/refactors/components/hook/dashboard/warehouses/use-dashboard-warehouse.md
---

## Hook Responsibility

Current source: `src/hooks/dashboard/locations/use-dashboard-warehouse.tsx`
Target hook file: `src/hooks/dashboard/locations/use-dashboard-warehouse.tsx` (**Phase 22-03** — implemented; extension `.tsx` retained for JSX in provider)
Used by:
- src/app/(dashboard)/layout.tsx
- src/components/features/locations/pages/dashboard-bins-page.tsx
- src/components/features/locations/pages/dashboard-zones-page.tsx
Owns fetching: Yes - current source issues dashboard data requests.
Owns mutations: Yes - POST client mutations for createWarehouse, createZone, and createBin.
Owns loading state: Yes.
Owns error state: Yes.
Owns DTO transformation: Partial — **`src/lib/transformers/locations/dashboard-home.ts`** maps `/dashboard/home` wire lists (**Phase 22-05**); **`useMemo`** pipelines remain in-hook for options/table rows.
Exposes actions: Flat **`createWarehouse`**, **`createZone`**, **`createBin`**, **`refresh`** plus nested **`actions`** object with the same four (**Phase 22-06**, CFR-11/12 dual surface).

## Inputs

- URL warehouseId search param via useSearchParams when present.
- Child React tree provided to DashboardWarehouseProvider.

## Returned DTO

Current return/context shape is derived from the existing source, not a new contract. Phase 18 records the shape for later Phase 19/20 decisions without changing consumers.

## Actions

**Interim:** `createWarehouse`, `createZone`, `createBin`, `refresh` as separate context fields.

**Phase 22-06:** `actions: { createWarehouse, createZone, createBin, refresh }` — same function references as the flat fields (**CFR-11** dual surface).

## Provider / context decision

`DashboardWarehouseProvider` remains **compatibility scaffolding** mounted from `src/app/(dashboard)/layout.tsx` until usage searches prove all consumers can migrate off hidden context (D-20-08). Phase 22 may dual-export hook + thin provider during migration.

## Dependencies

- Generated component-hook doc: `.docs/developer/refactors/components/hook/dashboard/warehouses/use-dashboard-warehouse.md`
- Source dependencies: **`@/types/api/locations/dashboard-home`**, **`@/lib/transformers/locations/dashboard-home`**, `@/lib/api/extract-mutation-error`, @/components/configs/entities/bin/config, @/components/configs/entities/zone/config, @/components/shared/use-error-dialog, @/types/components/form/generic-form.types, next/navigation, @/lib/axios, @/lib/locations

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
- **`src/lib/transformers/locations/dashboard-home.ts`** maps `/dashboard/home` wire lists → **`Warehouse[]` / `ZoneApiRecord[]` / `BinApiRecord[]`** (**Phase 22-05**).
- `useMemo` pipelines from normalized lists to `ZoneTableRow`, `BinTableRow`, denormalized display names, and select options.

Validation logic:
- None in hook beyond trusting API validation responses surfaced as mutation errors.

Error handling logic:
- Imports **`extractMutationError`** from `@/lib/api/extract-mutation-error.ts` (Phase 22-02); `useErrorDialog.reportError` shows consistent titles/sources.

Reusable utility logic:
- *(none in-module — shared mutation parser lives in `src/lib/api/extract-mutation-error.ts`.)*

Types/interfaces declared inline:
- ~~`ZoneApiRecord`, `BinApiRecord`, `ApiPayload`, `DashboardHomePayload`~~ → **`src/types/api/locations/dashboard-home.ts`** (**Phase 22-04**).

### Logic Movement Plan

| Logic | Current location | Target location | Reason | Risk |
| --- | --- | --- | --- | --- |
| Raw `/dashboard/home` payload and API record types | ~~Inline~~ | **`src/types/api/locations/dashboard-home.ts`** | Isolate wire contract (**Phase 22-04**) | medium |
| Wire-list normalization into hook state shapes | ~~Inline in `loadData`~~ | **`src/lib/transformers/locations/dashboard-home.ts`** | Pure **`lib/transformers`** ownership (**Phase 22-05**) | medium |
| Fetch + refresh orchestration | Hook/provider module | `src/hooks/dashboard/locations/use-dashboard-warehouse.tsx` | Single async ownership (**CFR-09 hook**) — **Phase 22-03** ✅ | high |
| UI-ready rows, options, context data shape | `useMemo` in hook file | `src/types/dto/locations/` + remaining transformers | Future DTO files (**not** landed Phase 22) | high |
| Mutation calls + refresh coupling | Flat fields + **`actions`** | Hook-owned (**Phase 22-06** ✅) | D-20-09 grouped callbacks (**CFR-11/12**) | medium |
| Mutation error parsing helper | ~~Inline~~ → **`extractMutationError` imported** | `src/lib/api/extract-mutation-error.ts` | Shared **utility** (CFR-13); **Phase 22-02** consolidated warehouse + devices implementations | done |
| Provider shell / context typing | Same file today | Future `src/components/features/locations/providers/dashboard-warehouse-provider.tsx` | Compatibility until consumers migrate (D-20-08 **retained render**/feature wiring) | high |

### New Files Needed

| File | Purpose |
| --- | --- |
| `src/types/api/locations/dashboard-home.ts` | Dashboard home envelope **`ApiPayload`**, **`DashboardHomePayload`**, **`ZoneApiRecord`**, **`BinApiRecord`** (**Phase 22-04** ✅) |
| `src/types/dto/locations/*` | Table rows, options, KPI-ready shapes consumed by feature components |
| `src/lib/transformers/locations/dashboard-home.ts` | Normalize `/dashboard/home` wire lists (**Phase 22-05** ✅) |
| `src/lib/api/extract-mutation-error.ts` | Shared mutation error parsing (**Phase 22-02** ✅) |
| `src/hooks/dashboard/locations/use-dashboard-warehouse.tsx` | Hook + provider implementation (**Phase 22-03** ✅; `.tsx` for JSX) |

### Notes

- **CFR-13:** ~~Duplicate `extractMutationError`~~ **Resolved Phase 22-02** — shared `src/lib/api/extract-mutation-error.ts` used by warehouse hook and `src/components/dashboard/devices/use-dashboard-devices.tsx`.
- **Compatibility checklist:** Preserve URL `warehouseId` filtering semantics, mutation success refresh behavior, and error dialog metadata (`dashboard/warehouses/create`, `dashboard/zones/create`, `dashboard/bins/create`). Re-run consumer inventory from **Used by** before deleting compatibility provider exports.

## Classification

Classification: hook
Reason: Provider/hook/API payload/DTO/transformer/mutation cluster; split later while keeping compatibility provider.
Target folder: `src/hooks/dashboard/locations`
Target file name: `use-dashboard-warehouse.tsx`
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
| `useDashboardWarehouse` | `src/hooks/dashboard/locations/use-dashboard-warehouse.tsx` | `.docs/developer/refactors/components/dismounted/use-dashboard-warehouse.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `DashboardWarehouseContext` | `src/components/features/locations/providers/dashboard-warehouse-provider.tsx` | `.docs/developer/refactors/components/dismounted/dashboard-warehouse-context.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `ApiPayload` | `src/types/api/locations/dashboard-home.ts` | `.docs/developer/refactors/components/dismounted/api-payload.md` | Wire envelope helper (**Phase 22-04**) |
| `ZoneApiRecord` | `src/types/api/locations/dashboard-home.ts` | `.docs/developer/refactors/components/dismounted/zone-api-record.md` | Typed alongside **`DashboardHomePayload`** (**Phase 22-04**) |
| `BinApiRecord` | `src/types/api/locations/dashboard-home.ts` | `.docs/developer/refactors/components/dismounted/bin-api-record.md` | Typed alongside **`DashboardHomePayload`** (**Phase 22-04**) |
| `DashboardHomePayload` | `src/types/api/locations/dashboard-home.ts` | `.docs/developer/refactors/components/dismounted/dashboard-home-payload.md` | Inner **`data`** shape for **`GET /dashboard/home`** (**Phase 22-04**) |
| `extractMutationError` | `src/lib/api/extract-mutation-error.ts` | `.docs/developer/refactors/components/dismounted/extract-mutation-error.md` | **Phase 22-02** ✅ CFR-13 **utility** tier — not `lib/transformers`; shared by warehouse hook + devices hook. |
