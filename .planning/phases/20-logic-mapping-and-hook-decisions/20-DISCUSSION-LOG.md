# Phase 20: Logic mapping and hook decisions - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-05-07
**Phase:** 20-logic-mapping-and-hook-decisions
**Areas discussed:** Logic mapping defaults, dashboard warehouse provider split, hook action shape

---

## Logic Mapping Defaults

| Option | Description | Selected |
|--------|-------------|----------|
| Accept recommended defaults | Map render logic, UI state, fetching, mutations, transformations, validation, error handling, utilities, and inline types to future homes with reason/risk. | yes |
| Change defaults | Adjust mapping categories or fields. | |
| Discuss deeper | Ask more detailed mapping questions. | |

**User's choice:** Accept recommended defaults.
**Notes:** Phase 20 remains documentation-only.

---

## Dashboard Warehouse Provider Split

| Option | Description | Selected |
|--------|-------------|----------|
| Accept recommended split defaults | Plan API types, DTO types, transformers, shared mutation error parsing if reused, page-ready hook output, grouped actions, and provider compatibility. | yes |
| Change defaults | Adjust split ownership. | |
| Discuss deeper | Ask more detailed split questions. | |

**User's choice:** Accept recommended split defaults.
**Notes:** Provider remains compatibility scaffolding until usage searches prove consumers migrated.

---

## Hook Action Shape

| Option | Description | Selected |
|--------|-------------|----------|
| Accept recommended action shape | Hooks with more than two callbacks plan an `actions` object; code changes later. | yes |
| Keep flat callback shape | Target docs keep flat callbacks. | |
| Discuss deeper | Ask more detailed hook API questions. | |

**User's choice:** Accept recommended action shape.
**Notes:** Actual hook return changes are deferred to Phase 22.

---

## the agent's Discretion

- Choose batching and depth by risk.
- Keep low-risk render-only mappings concise.
- Add summary artifacts needed by Phase 21/22.

## Deferred Ideas

- Primitive approval, source movement, import rewiring, and final moved-file verification remain in later phases.
