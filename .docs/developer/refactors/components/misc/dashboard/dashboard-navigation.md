---
source: src/components/dashboard/dashboard-navigation.ts
type: misc
isCorrectCase: true
---

## Refactor Status

Status: in-progress
Old path: `src/components/dashboard/dashboard-navigation.ts`
New path: unchanged
Related files: dashboard sidebar route metadata
Imports updated: yes
Typecheck status: `pnpm exec tsc --noEmit` passed
Notes: Table-only sidebar destinations are hidden: Locations > Zones, Locations > Bins, Catalog > Items, and Orders > Purchase Orders. Routes remain available for deep links.
