---
source: src/components/dashboard/zones/components/zone-overview-dashboard-skeleton.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
ZoneOverviewDashboardSkeleton

Current file path:
`src/components/dashboard/zones/components/zone-overview-dashboard-skeleton.tsx`

Current responsibility:
Loading skeleton for zone overview page client.

Recommended destination:
TBD Phase 19 (feature-specific skeleton)

Refactor priority:
low–medium

## Classification

Classification: feature-component
Reason: Feature-specific zone overview skeleton; keep near locations feature component.
Target folder: `src/components/features/locations/components`
Target file name: `zone-overview-dashboard-skeleton.tsx`
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
- Contains repeated styling: yes
- Contains multiple components: no
- Still needed: yes

### Decision

Record the move decision as planned ownership only. Phase 19 does not move source files, create target folders, rewrite imports, delete docs, or alter behavior.

## Logic Mapping

Skeleton placeholders mirror zone overview layout; grouping stays until Phase 21.

### Logic Movement Plan

| Logic | Current location | Target location | Reason | Risk |
| --- | --- | --- | --- | --- |
| Primary artifact | Current dashboard/misc path | `src/components/features/...` or `src/types/dto/locations/...` per Classification | Phase 22 move (**feature** / **types**) | low |

### Notes

Classification rows remain authoritative — Phase 20 captures linkage only.

