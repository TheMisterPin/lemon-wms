---
phase: 21-primitive-and-styling-plan
status: locked
created: 2026-05-07
---

# Phase 21 — UI design contract (minimal)

## Purpose

Phase 21 plans **documentation** for primitive extraction — **no visual redesign**. This stub satisfies the planning workflow UI gate for a roadmap phase marked **UI hint: yes**.

## Hard constraints

- **Preserve current visuals** end-to-end (CFR-16 / REQUIREMENTS out-of-scope: modernization).
- Dashboard office surfaces remain **shadcn/ui–based** with existing Lemon matte dashboard tokens (`--wh-*` where used today).
- Primitives **compose** shadcn primitives; they **do not** introduce new color palettes, radii, or typography scales unless matching existing extracted classes verbatim.

## Primitive UX expectations

- **Structural parity:** Extracted primitives reproduce today's layout, spacing, hover/disabled states, and typography classes derived from current components.
- **States:** Loading/error/empty primitives **look identical** to current inline implementations when migrated in Phase 22+.

## Out of scope

- Floor terminal aesthetic changes.
- New illustrations, icon sets, or motion.
