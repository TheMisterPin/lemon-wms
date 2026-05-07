---
source: src/components/dashboard/devices/use-dashboard-devices.tsx
type: hook
isCorrectCase: true
---

## Inventory (Phase 18–20)

**`DashboardDevicesProvider` / `useDashboardDevices`** — dashboard-scope devices context: loads devices + warehouse/zone option lists via `dashboardApiClient`, exposes authorize/deauthorize mutations, loading/error, and `refresh`.

### Fetch / mutations

- GET flows assemble `DeviceTableRow[]`, `SelectOption[]` lists (see source effect).
- Mutations: authorize/deauthorize endpoints via POST — detail paths in source.

### Mutation error parsing

- **`extractMutationError`** imported from `@/lib/api/extract-mutation-error` (**Phase 22-02**); parses Axios `ApiResponse` bodies into `MutationError`, shared with warehouse hook.

## Hook Responsibility (CFR-11 snapshot)

Current source: `src/components/dashboard/devices/use-dashboard-devices.tsx`  
Target hook file: `src/hooks/dashboard/devices/use-dashboard-devices.ts` — **Phase 22 placeholder** (no folder in Phase 20).  
Used by: consumers under dashboard devices surfaces (run import search before moves).  
Owns fetching: Yes  
Owns mutations: Yes (`authorizeDevice`, `deauthorizeDevice`)  
Owns loading/error: Yes  
Owns DTO transformation: Yes — maps API records to table/options shapes inline today.

## Inputs

- Provider wraps arbitrary dashboard subtree (`children`).

## Returned DTO / context

- Context exposes devices rows, warehouse/zone options, loading/error, mutations, `refresh` — exact shape from source types (`DashboardDevicesContextValue`).

## Actions

**Interim:** flat `authorizeDevice`, `deauthorizeDevice`, `refresh`.  
**Target (Phase 22):** if callbacks proliferate, align with D-20-09 nested `actions` pattern — document parity with warehouse hook decisions.

## Dependencies

- `dashboardApiClient`, `extractMutationError` (`@/lib/api/extract-mutation-error`), `useErrorDialog`, entity config types, shared form/select types, Axios.

## Refactor Notes

- Devices provider is **out-of-scope** for first locations slice unless roadmap expands — mutation parser consolidated with warehouse (**Phase 22-02**, CFR-13).

## Logic Mapping

### Logic Found

Render logic:
- Provider shell only.

UI-only state:
- Loading/error strings + cached collections state.

Data fetching logic:
- Effect-driven loads for devices + supporting lists.

Mutation logic:
- Authorize/deauthorize POST handlers + refresh coupling.

Data transformation logic:
- Inline mapping API records → table rows/options.

Validation logic:
- Minimal client guards — rely on API messages.

Error handling logic:
- `extractMutationError` + `reportError` dialog integration.

Reusable utility logic:
- **`extractMutationError`** — **`src/lib/api/extract-mutation-error.ts`** (**Phase 22-02** ✅); shared with warehouse hook.

Types/interfaces declared inline:
- `ApiPayload`, `DeviceApiRecord`, `WarehouseApiRecord`, `ZoneApiRecord`, context interface — future **`types/api`** modules.

### Logic Movement Plan

| Logic | Current location | Target location | Reason | Risk |
| --- | --- | --- | --- | --- |
| Async + mutations | Provider module | Planned `src/hooks/dashboard/devices/...` | Hook ownership (**hook**) | medium |
| Inline API records | Same file | `src/types/api/devices/...` | Contract isolation (**types/api**) | medium |
| `extractMutationError` | `@/lib/api/extract-mutation-error` | **`src/lib/api/extract-mutation-error.ts`** | CFR-13 **utility** tier (not `lib/transformers`) — **Phase 22-02** ✅ |
| Context wiring | Provider component | Feature provider path Phase 22 | Compatibility migration | medium |

### Notes

**CFR-13:** Consolidated in **`src/lib/api/extract-mutation-error.ts`** (**Phase 22-02**) — warehouse canonical hook doc (`.docs/developer/refactors/hooks/dashboard/warehouses/use-dashboard-warehouse.md`) is the integration narrative.

## Classification

Classification: hook (provider cluster)  
Reason: Dashboard devices provider mixes fetch, mutations, and inline API typings — mutation errors use shared **`extractMutationError`** (**Phase 22-02**); further hook split when devices slice is scheduled.  
Target folder: `src/hooks/dashboard/devices` (proposed)  
Risk level: medium — inline API typings remain the next split signal after CFR-13 consolidation.

### Decision

Phase 20 documents logic movement only — no `src/**` edits.
