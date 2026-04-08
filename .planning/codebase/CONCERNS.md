# Codebase Concerns

**Analysis Date:** 2026-04-08

## Tech Debt

**Mixed concerns in frontend auth transport (`src/lib/axios.ts`):**
- Issue: transport logic, token refresh orchestration, role-context header injection, and redirect behavior are tightly coupled in one file
- Why: convenience consolidation for shared/dashboard/warehouse clients
- Impact: small auth/session changes can regress multiple call paths
- Fix approach: split into request header builder, refresh coordinator, and per-surface client modules with focused tests

**Generated/planning/tooling content committed in same repo:**
- Issue: large `.codex/` and `.claude/` trees can overshadow app-level signal
- Why: workflows and agent assets are versioned in-project
- Impact: higher navigation noise and broader accidental edit surface
- Fix approach: enforce path-scoped work conventions and stronger code-owner boundaries

## Known Bugs / Defects

**Invalid entry in TypeScript include list (`tsconfig.json`):**
- Symptoms: malformed include array includes `src/_components/forms/create-box-formtsx` (likely typo and stale path)
- Trigger: TS tooling/config parsing and file discovery may behave unexpectedly
- Workaround: none reliable; should be fixed directly
- Root cause: manual edit typo or stale migration artifact

## Security Considerations

**JWT fallback secret behavior (`src/lib/auth/jwt.ts` + runtime env assumptions):**
- Risk: insecure defaults or missing secret handling can create weak token security in non-production setups
- Current mitigation: tests and env setup define `JWT_SECRET`, prod expected to set env vars
- Recommendations: hard-fail startup when `JWT_SECRET` is missing outside test mode

**Client-side token persistence (`src/lib/auth/store.ts`):**
- Risk: access token copied to `localStorage` increases XSS blast radius
- Current mitigation: refresh token stays cookie-based, middleware enforces auth boundaries
- Recommendations: reduce localStorage token lifetime or move to stricter httpOnly-only strategy where feasible

## Performance Bottlenecks

**Potential heavy schema/client footprint:**
- Problem: large Prisma schema and wide relational graph may cause expensive queries if includes/selects are not kept narrow
- Measurement: no benchmark data captured in this pass
- Cause: many interconnected models and operational tables
- Improvement path: add query profiling and indexes review per hot endpoints

## Fragile Areas

**Cross-surface auth routing (`middleware.ts`):**
- Why fragile: logic handles expired token decode, refresh-cookie gate, and role redirect in one path
- Common failures: redirect loops, wrong surface routing, accidental public access to protected pages
- Safe modification: add targeted middleware tests before behavior changes
- Test coverage: some middleware tests exist (`src/__tests__/middleware.test.ts`, auth middleware tests), but integration coverage can improve

**Move-operation domain (`src/lib/entities/move-operations/*`):**
- Why fragile: inventory movement has multi-step state semantics
- Common failures: quantity/status consistency and audit-trace drift
- Safe modification: keep use-case functions small and test each operation path
- Test coverage: dedicated tests exist, but add regression cases for edge statuses

## Dependencies at Risk

**Rapid major-version surface (Next 16, React 19, Prisma 7):**
- Risk: ecosystem churn and plugin/version incompatibilities
- Impact: build/test/runtime edge regressions on upgrades
- Migration plan: pin and upgrade intentionally with changelog review and smoke-test checklist

## Test Coverage Gaps

**End-to-end user workflows:**
- What's not tested: complete browser flow across login -> dashboard/warehouse -> operations
- Risk: integration regressions may pass unit tests
- Priority: High
- Difficulty: requires browser automation harness + stable seed data baseline

---

*Concerns audit: 2026-04-08*
*Update as issues are fixed or new ones discovered*
