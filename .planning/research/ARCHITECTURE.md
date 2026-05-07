# Architecture Research: Component Folder Restructuring

**Project:** Lemon WMS  
**Milestone:** v1.2 Component Folder Restructuring  
**Researched:** 2026-05-07  
**Overall confidence:** HIGH for local architecture fit; MEDIUM for final folder names until the first slice proves import ergonomics.

## Executive Summary

The restructuring should integrate as a brownfield migration, not a parallel frontend rewrite. The existing app already has the right conceptual layers, but those layers are mixed inside legacy folders: route files import provider state, hooks define raw API payloads and DTO transforms, page clients fetch directly, and feature components consume hidden context. The target architecture should make those dependencies explicit by moving toward:

```txt
app route
-> hook
-> feature page component
-> feature component
-> primitive
-> shadcn/ui
```

The first slice should be the dashboard locations/warehouses path because it is explicitly named in the milestone, has high refactor value, and exposes the main current failure mode through `src/components/dashboard/warehouses/use-dashboard-warehouse.tsx`: API payload types, UI DTOs, fetching, mutations, transformations, provider state, and consumer hook access all live in one file. It also has multiple consumers (`DashboardBinsPageView`, `DashboardZonesPageView`, create warehouse/zone/bin forms, and dashboard layout), so it is large enough to validate the architecture without touching every domain.

Risk is minimized by creating empty target folders and type/transformer boundaries first, then splitting logic without moving visible components, then migrating one route/page at a time. The dashboard-wide provider should be treated as temporary compatibility infrastructure; new or moved pages should prefer route-level hook invocation and explicit prop passing. Remove the provider only after all consumers stop using context.

## Current Architecture Findings

### Current Strengths

- Next.js App Router already gives clear route entry points under `src/app/(dashboard)` and `src/app/(warehouse)`.
- The app already uses custom hooks with Axios rather than introducing React Query or another data layer.
- Many page-like components are already named as views (`DashboardBinsPageView`, `DashboardZonesPageView`, `DashboardLocationsPageView`) and can become feature page components with limited render changes.
- The refactor docs under `.docs/developer/refactors/` already provide the right workflow contract for inventory, classification, logic mapping, and status tracking.
- Existing `components/ui` is already mostly shadcn/base component territory and should remain the bottom UI layer.

### Current Structural Problems

- `src/components/dashboard/warehouses/use-dashboard-warehouse.tsx` mixes raw API shapes, fallback DTO shaping, table-row enrichment, select-option derivation, fetch lifecycle, mutation actions, error dialog reporting, provider context, and consumer hook access.
- `src/app/(dashboard)/layout.tsx` installs `DashboardWarehouseProvider` around every dashboard route, hiding locations-specific data dependencies from unrelated pages.
- Several dashboard page components consume `useDashboardWarehouse` directly, so the route does not show which data a page requires.
- `src/components/dashboard/warehouses/warehouse-dashboard-overview-page-client.tsx` fetches directly from Axios inside a page client instead of delegating to a hook.
- Target folders named in the rules and project plan (`components/features`, `components/primitives`, `src/hooks`, `src/lib/transformers`) do not exist yet, so the first implementation phase must establish them deliberately.
- Existing documentation for the main example hook is incomplete; the component-side doc exists only as metadata, and the hook doc path listed by discovery was not present.

## Target Layering

### Route Layer

**Target folder:** `src/app/**/page.tsx` and route layouts  
**Responsibility:** Framework entry point only.

Route files should:

- read route params and search params when needed
- call the page hook
- render the feature page component
- pass hook output explicitly as props

Route files should not:

- fetch with Axios
- perform DTO transformations
- own mutation workflows
- install broad providers for feature-specific state
- contain large JSX trees

Recommended shape:

```tsx
'use client'

import { DashboardBinsPage } from '@/components/features/locations/pages/dashboard-bins-page'
import { useDashboardBinsPage } from '@/hooks/dashboard/locations/use-dashboard-bins-page'

export default function Page() {
  const page = useDashboardBinsPage()

  return <DashboardBinsPage {...page} />
}
```

### Hook Layer

**Target folder:** `src/hooks/[surface]/[domain]/`  
**Examples:**

- `src/hooks/dashboard/locations/use-dashboard-warehouse.ts`
- `src/hooks/dashboard/locations/use-dashboard-bins-page.ts`
- `src/hooks/dashboard/locations/use-dashboard-zones-page.ts`
- `src/hooks/dashboard/locations/use-dashboard-warehouse-overview.ts`

Hooks are the frontend data and state boundary. They may fetch, mutate, read search params, own loading/error/refetch state, derive page-ready DTOs, and expose actions. When a hook exposes more than two callbacks, group callbacks under `actions`.

Hooks should not contain raw API type declarations, large reusable transformations, JSX, or hidden provider contracts.

Recommended return shape for the warehouse split:

```ts
export type UseDashboardWarehouseResult = {
  warehouses: WarehouseSummaryDto[]
  zones: ZoneTableRowDto[]
  bins: BinTableRowDto[]
  warehouseOptions: SelectOptionDto[]
  zoneOptions: SelectOptionDto[]
  warehouseIdFilter: string | null
  isLoading: boolean
  error: string | null
  actions: {
    createWarehouse: (values: CreateWarehouseInput) => Promise<void>
    createZone: (values: CreateZoneInput) => Promise<void>
    createBin: (values: CreateBinInput) => Promise<void>
    refresh: () => void
  }
}
```

### Feature Page Layer

**Target folder:** `src/components/features/[domain]/pages/`  
**Examples:**

- `src/components/features/locations/pages/dashboard-bins-page.tsx`
- `src/components/features/locations/pages/dashboard-zones-page.tsx`
- `src/components/features/locations/pages/dashboard-locations-page.tsx`
- `src/components/features/locations/pages/dashboard-warehouse-overview-page.tsx`
- `src/components/features/locations/pages/dashboard-warehouse-stock-page.tsx`

Feature page components assemble feature components and handle page-level loading, error, empty, and data states. They receive hook output as props. They should not call hooks directly once the route layer is migrated, except during a temporary compatibility phase documented as such.

### Feature Component Layer

**Target folder:** `src/components/features/[domain]/components/`  
**Examples:**

- `src/components/features/locations/components/create-warehouse-form.tsx`
- `src/components/features/locations/components/create-zone-form.tsx`
- `src/components/features/locations/components/create-bin-form.tsx`
- `src/components/features/locations/components/bin-contents-modal.tsx`
- `src/components/features/locations/components/warehouse-stock-summary.tsx`
- `src/components/features/locations/components/warehouse-zone-summary.tsx`
- `src/components/features/locations/components/warehouse-order-workload.tsx`

Feature components may know domain language and receive DTOs/callbacks, but must not fetch, mutate, call API clients, define API payload types, or import feature hooks. Forms should receive submit callbacks from page props or hook actions rather than reaching into context.

### Primitive Layer

**Target folder:** `src/components/primitives/`  
**Recommended subfolders:**

- `src/components/primitives/dashboard/`
- `src/components/primitives/forms/`
- `src/components/primitives/states/`
- `src/components/primitives/tables/` only if distinct from existing `src/components/tables`

Primitives should be introduced only for repeated project-wide UI patterns. For this milestone, likely candidates are:

- `DashboardPageShell`
- `DashboardSection`
- `DashboardErrorState`
- `DashboardLoadingState`
- `KpiCard`
- `KpiCardGrid`
- `ActionToolbar`

Do not promote warehouse-specific dark-card styling or business panels into primitives until the same structure appears across multiple domains. Keep feature-specific skeletons near their feature page or feature component.

### shadcn/UI Layer

**Target folder:** `src/components/ui/`  
**Responsibility:** Base shadcn/ui components only.

No feature components, domain-specific wrappers, API calls, or business rules should be added here.

### API Type Layer

**Target folder:** `src/types/api/[domain]/`  
**Examples:**

- `src/types/api/locations/dashboard-home.types.ts`
- `src/types/api/locations/warehouse-overview.types.ts`

Raw API response types currently embedded in hooks should move here. These types should represent transport payloads, not component-ready data.

### DTO Type Layer

**Target folder:** `src/types/dto/[domain]/`  
**Examples:**

- `src/types/dto/locations/dashboard-warehouse.dto.ts`
- `src/types/dto/locations/dashboard-home.dto.ts`
- `src/types/dto/locations/warehouse-overview.dto.ts`

DTOs should represent the shape the UI consumes: table rows, select options, KPI rows, display records, chart data, and page models. Avoid importing raw API types into components once DTOs exist.

### Transformer Layer

**Target folder:** `src/lib/transformers/[domain]/`  
**Examples:**

- `src/lib/transformers/locations/dashboard-warehouse-transformers.ts`
- `src/lib/transformers/locations/dashboard-home-transformers.ts`
- `src/lib/transformers/locations/warehouse-overview-transformers.ts`

Transformers should handle non-trivial or reusable mapping:

- raw dashboard home payload to warehouse/zone/bin DTOs
- warehouse and zone lookup maps
- select options
- table rows with display names
- normalized nullable numbers
- KPI, chart, and card DTO preparation

Keep simple one-off view conditionals in components; move data normalization and reusable mapping out.

## Recommended Folder Additions

Create these folders before moving files:

```txt
src/components/features/
src/components/features/locations/
src/components/features/locations/pages/
src/components/features/locations/components/
src/components/primitives/
src/components/primitives/dashboard/
src/components/primitives/forms/
src/components/primitives/states/
src/hooks/
src/hooks/dashboard/
src/hooks/dashboard/locations/
src/types/api/
src/types/api/locations/
src/types/dto/
src/types/dto/locations/
src/lib/transformers/
src/lib/transformers/locations/
```

Do not add barrels at first. Direct imports keep moves easier to audit. Add barrels only after the first slice stabilizes and import ergonomics are clearly poor.

## Data Flow

### Target Fetch Flow

```txt
app/(dashboard)/dashboard/locations/bins/page.tsx
-> useDashboardBinsPage()
-> dashboardApiClient
-> src/types/api/locations/*
-> src/lib/transformers/locations/*
-> DTO result
-> DashboardBinsPage
-> CreateBinForm / BinContentsModal / PageWithGrid
-> primitives / tables
-> shadcn/ui
```

### Target Mutation Flow

```txt
Feature form submit
-> page callback prop
-> hook actions.createBin/createZone/createWarehouse
-> dashboardApiClient mutation
-> error parsing/reporting in hook
-> refresh/refetch state
-> page receives updated DTOs
```

Mutation functions should keep the existing behavior for this milestone, including error dialog reporting and refresh semantics. A later phase can standardize mutation result shapes if required, but this milestone should not change mutation semantics.

### Provider Migration Flow

Use the current `DashboardWarehouseProvider` as compatibility scaffolding only:

1. Extract types and transformers while the provider remains in place.
2. Move the hook implementation to `src/hooks/dashboard/locations/use-dashboard-warehouse.ts`.
3. Keep a temporary re-export at the old path if necessary to reduce import churn during a single phase.
4. Migrate each consumer from context access to route-level hook props.
5. Remove provider from `src/app/(dashboard)/layout.tsx` after no consumers require it.
6. Delete or replace the old hook file only after docs and imports agree.

## First Vertical Slice Recommendation

### Choose Dashboard Locations: Bins + Zones + Create Forms

Start with the list pages and forms that currently depend on `useDashboardWarehouse`:

- `src/components/dashboard/bins/DashboardBinsPageView.tsx`
- `src/components/dashboard/zones/DashboardZonesPageView.tsx`
- `src/components/dashboard/features/bins/create-bin-form.tsx`
- `src/components/dashboard/features/zones/create-zone-form.tsx`
- `src/components/dashboard/features/warehouses/create-warehouse-form.tsx`
- `src/components/dashboard/warehouses/use-dashboard-warehouse.tsx`
- `src/app/(dashboard)/layout.tsx`

This is the safest first slice because it validates the central layering problem without moving the more visually dense warehouse overview pages first. It also avoids changing API contracts, route contracts, table configs, or visual design.

### Why Not Start With Warehouse Overview Pages

The warehouse overview and stock pages have more nested visual components and inline styling patterns. They are useful for later primitive extraction, but they are not the cleanest first slice because they combine data fetching cleanup with a larger visual component move. Start with dependency visibility first; extract visual primitives after the data/hook pattern is proven.

## Dependency Order

### Phase A: Documentation and Inventory

1. Update `.docs/developer/refactors/components/hook/dashboard/warehouses/use-dashboard-warehouse.md` with full classification and logic mapping.
2. Create or update the missing hook doc under `.docs/developer/refactors/hooks/dashboard/warehouses/use-dashboard-warehouse.md`.
3. Update docs for every first-slice consumer before moving code.
4. Record old path, target path, split/deletion decision, risk, and typecheck status.

**Risk reduced:** prevents agents from moving files without traceability.

### Phase B: Add Target Folders and Shared Type Boundaries

1. Add target folders.
2. Move raw API payload types from the hook into `src/types/api/locations/dashboard-home.types.ts`.
3. Add UI DTO types in `src/types/dto/locations/dashboard-warehouse.dto.ts`.
4. Keep imports direct; avoid barrels.

**Risk reduced:** no runtime behavior changes yet.

### Phase C: Extract Transformers

1. Move mapping from dashboard home payload to warehouse, zone, and bin DTOs into `src/lib/transformers/locations/dashboard-warehouse-transformers.ts`.
2. Include lookup map/select-option helpers only if used by multiple hook/page variants.
3. Add focused tests only if transformer logic is non-trivial enough to regress silently.

**Risk reduced:** fetch/mutation lifecycle remains in place while mapping becomes reusable and reviewable.

### Phase D: Move Hook and Keep Compatibility

1. Move the hook implementation to `src/hooks/dashboard/locations/use-dashboard-warehouse.ts`.
2. Leave a temporary old-path re-export from `src/components/dashboard/warehouses/use-dashboard-warehouse.tsx` if needed for incremental import migration.
3. Preserve the provider until direct consumers are migrated.
4. Change hook return callbacks to `actions` only when all first-slice consumers are updated in the same phase.

**Risk reduced:** import churn is controlled and behavior stays stable.

### Phase E: Migrate Page Consumers

1. Move `DashboardBinsPageView` to `src/components/features/locations/pages/dashboard-bins-page.tsx`.
2. Move `DashboardZonesPageView` to `src/components/features/locations/pages/dashboard-zones-page.tsx`.
3. Move create forms to `src/components/features/locations/components/`.
4. Change forms to receive action callbacks as props instead of calling `useDashboardWarehouse`.
5. Update route files to call hooks and pass page props explicitly.

**Risk reduced:** hidden context dependencies become visible at route/page boundaries.

### Phase F: Remove Provider Coupling

1. Use `rg` to confirm no remaining imports from the old provider/hook path.
2. Remove `DashboardWarehouseProvider` from `src/app/(dashboard)/layout.tsx`.
3. Delete the old compatibility file only when docs and imports agree.
4. Run lint/typecheck for touched files and record status in refactor docs.

**Risk reduced:** provider deletion happens last, after usage evidence.

### Phase G: Extract Primitives After the First Slice

Only after route/hook/page flow is stable:

1. Identify repeated dashboard loading/error shells.
2. Extract a `DashboardErrorState` or `DashboardPageShell` if two or more moved pages share the pattern.
3. Keep table components in `src/components/tables` unless the GenericTable milestone resumes and explicitly reorganizes them.

**Risk reduced:** primitive extraction follows evidence rather than guessing.

## Requirements Implications

The current roadmap and requirements still describe v1.1 GenericTable V2, while `.planning/PROJECT.md` marks v1.2 Component Folder Restructuring as active. Roadmap creation for v1.2 should add explicit requirements for:

- Inventory coverage for all moved components, hooks, providers, and page views.
- Folder creation and ownership rules for `components/features`, `components/primitives`, `src/hooks`, `src/types/api`, `src/types/dto`, and `src/lib/transformers`.
- First vertical slice completion for dashboard locations/warehouses/bins/zones.
- No visual, API, validation, mutation, or business-rule changes during moves.
- Provider removal criteria based on import/consumer evidence.
- Refactor doc status updates as a completion gate.
- Verification through lint/typecheck and manual smoke tests for `/dashboard/locations/warehouses`, `/dashboard/locations/zones`, `/dashboard/locations/bins`, and any route touched by layout/provider changes.

Recommended v1.2 requirement IDs:

| Requirement | Description |
|---|---|
| CFR-01 | Complete inventory/classification docs before each code move. |
| CFR-02 | Create target folders and document responsibilities. |
| CFR-03 | Move API payload types out of components/hooks into `src/types/api`. |
| CFR-04 | Move UI DTO types into `src/types/dto`. |
| CFR-05 | Move reusable/non-trivial transformations into `src/lib/transformers`. |
| CFR-06 | Move hooks into `src/hooks/[surface]/[domain]` and expose page-ready results. |
| CFR-07 | Move first locations slice pages/components into `components/features/locations`. |
| CFR-08 | Remove dashboard warehouse provider only after all consumers are migrated. |
| CFR-09 | Preserve behavior, visual output, API contracts, validation, and mutation semantics. |
| CFR-10 | Verify code and docs agree before phase completion. |

## Pitfalls and Mitigations

| Pitfall | Why It Matters | Mitigation |
|---|---|---|
| Moving folders before splitting responsibilities | Imports change but architecture remains tangled | Extract API types and transformers before component moves |
| Keeping provider context indefinitely | Route/page dependencies stay hidden | Treat provider as temporary compatibility scaffolding with removal criteria |
| Creating primitives too early | Generic wrappers hide domain logic | Extract primitives only after repeated patterns appear in moved pages |
| Moving overview pages first | Visual complexity distracts from data-flow cleanup | Start with bins/zones/create forms |
| Rewriting UI while moving files | Review becomes impossible and risk increases | Preserve markup/classes except import/prop wiring |
| Updating code without docs | Future phases lose source of truth | Make doc status updates part of done criteria |
| Touching GenericTable during restructuring | v1.1 work is paused and table behavior is broad | Leave table internals/configs alone unless import-only changes are required |

## Source Notes

- `.planning/PROJECT.md` identifies v1.2 as component folder restructuring and names `use-dashboard-warehouse.tsx` as the example responsibility split.
- `.planning/ROADMAP.md` and `.planning/REQUIREMENTS.md` still reflect v1.1 GenericTable V2, so v1.2 roadmap/requirements need to be generated or updated from this research.
- `.cursor/rules/component-architecture.mdc` defines the target layer direction and folder responsibilities.
- `.cursor/rules/refactor-documentation-workflow.mdc` makes refactor documentation a phase completion gate.
- `src/components/dashboard/warehouses/use-dashboard-warehouse.tsx` confirms the mixed responsibilities and current provider shape.
- Local source search confirms no existing `src/components/features`, `src/components/primitives`, `src/hooks`, or `src/lib/transformers` folders.
