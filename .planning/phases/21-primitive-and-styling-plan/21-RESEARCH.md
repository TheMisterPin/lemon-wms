---
phase: 21-primitive-and-styling-plan
status: complete
created: 2026-05-07
---

# Phase 21 — Research notes

## Sources consulted

- `.planning/ROADMAP.md` Phase 21 + `.planning/REQUIREMENTS.md` CFR-14–CFR-17
- `.cursor/rules/styling-and-primitives.mdc`
- Phase 19–20 refactor trail: primitive classifications, `warehouse-overview-primitives.md`, skeleton `split or keep grouped` rows, stock chart/skeleton duplication

## Findings

1. **Evidence-first:** Primitive approval requires **named repeated patterns** — Phase 20 Logic Mapping tables already point to Phase 21 for `warehouse-overview-primitives` and skeleton grouping decisions.
2. **Token coupling:** Dashboard locations surfaces heavily use `--wh-*` CSS variables — primitives extracted from those files should **document token dependence**; migrating tokens is **not** Phase 21 scope (CFR-16).
3. **Skeleton policy:** Many skeletons are **feature-scoped**; `_primitive-extraction-plan.md` should separate **“generic shimmer/KPI tile”** (rare) vs **feature skeleton clusters** (default stay-near-feature per CFR-17).
4. **Hook boundary:** Any candidate importing `dashboardApiClient` or feature hooks is **automatically disqualified** from primitive approval (CFR-15) — stays documented as rejection or defer-to-hook.

## Open questions (for planner waves)

- Exact count of **independent** KPI card shells vs one parameterized primitive — resolved per-file during planning with consumer list evidence.
- Whether `StatCard`-like rows in `overview-cards.md` and stock dashboards justify **one** shared primitive vs two variants — document trade-off in extraction plan.
