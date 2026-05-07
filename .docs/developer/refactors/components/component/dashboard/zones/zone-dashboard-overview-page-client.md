---
source: src/components/dashboard/zones/zone-dashboard-overview-page-client.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
ZoneDashboardOverviewPageClient

Current file path:
`src/components/dashboard/zones/zone-dashboard-overview-page-client.tsx`

Current responsibility:
Fetches zone overview DTO via **GET** `/dashboard/zones/{zoneId}/overview`; loading uses `ZoneOverviewDashboardSkeleton`; success renders `DashboardZoneOverviewView`.

Dependencies:
  - Components: `ZoneOverviewDashboardSkeleton`, `DashboardZoneOverviewView` (from `zone-overview-dashboard`)
  - Hooks: `useState`, `useEffect`, `useCallback`, `useRouter`
  - Types: `ApiResponse`, `ZoneOverviewDashboardData`
  - Utils: `dashboardApiClient`, `next/link`

Props:
`{ zoneId: string }`

Internal state:
`data`, `isLoading`, `error`

API calls:
GET zone overview endpoint

Mutation calls:
(none)

Main UI blocks:
standard page-client loading/error/success branches

Declared child components inside the file:
(none)

Recommended destination:
TBD Phase 19

Refactor priority:
medium

## Classification

Classification: feature-page
Reason: Client wrapper for zone overview page.
Target folder: `src/components/features/locations/pages`
Target file name: `zone-dashboard-overview-page-client.tsx`
Keep / Move / Split / Delete: move
Risk level: low

### Evaluation

- Duplicates shadcn/ui: no
- Project-wide reusable: no
- Domain-specific: yes
- Fetches data: no
- Mutates data: no
- Contains reusable transformation logic: no
- Defines types inline: no
- Contains repeated styling: no
- Contains multiple components: no
- Still needed: yes

### Decision

Record the move decision as planned ownership only. Phase 19 does not move source files, create target folders, rewrite imports, delete docs, or alter behavior.

## Logic Mapping

Thin client composing zone overview dashboard; fetching stays outside shell.

### Logic Movement Plan

| Logic | Current location | Target location | Reason | Risk |
| --- | --- | --- | --- | --- |
| Primary artifact | Current dashboard/misc path | `src/components/features/...` or `src/types/dto/locations/...` per Classification | Phase 22 move (**feature** / **types**) | low |

### Notes

Classification rows remain authoritative — Phase 20 captures linkage only.

