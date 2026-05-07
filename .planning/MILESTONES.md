# Milestones

## v1.0 — Purchase orders (first vertical slice)

**Status:** Completed (through prior roadmap phases 1–10).

Office and warehouse purchase-order flows, APIs, tests, documentation, and seed data for demo POs.

## v1.1 — GenericTable V2

**Status:** Paused / superseded by v1.2 planning.

Breaking overhaul of `GenericTable`: new column type system, focused cell components, `src/lib/utils/table/` helpers, slim orchestrator, migrate all consumers. Factbox / `display-field.types.ts` unchanged.

Paused before completion when the broader component architecture restructuring milestone became the active priority.

## v1.2 — Component Folder Restructuring

**Status:** Active.

Documentation-driven restructure of frontend component ownership: inventory existing components/hooks, classify target locations, map logic out of render components, plan primitives and feature/page folders, then execute a first warehouse/location/stock vertical slice without changing UI behavior or API contracts.