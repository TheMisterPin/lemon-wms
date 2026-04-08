# Lemon WMS Architecture Review: Risks, Inconsistencies, and Bottlenecks

This document captures architecture issues identified during repository analysis and prioritizes them by severity.

## 1) Executive summary

The current structure is directionally strong (clear dashboard/warehouse split and entity-oriented domain modules), but enforcement is inconsistent in API authorization and domain boundaries. The highest risks are authorization drift in route handlers, optional scoping in sensitive warehouse paths, and overlap between `entities` and legacy `services`.

## 2) Findings by severity

### Critical

1. **API authorization boundary inconsistency**
   - Evidence: API authz depends on per-route checks while middleware excludes `/api/*`; several handlers rely on authentication without explicit role namespace enforcement.
   - Impact: potential cross-surface access and policy drift.
   - Recommendation: enforce centralized guards (`requireOfficeApiAccess`, `requireFloorApiAccess`) for all dashboard/warehouse APIs.

2. **Optional warehouse scoping in operational routes**
   - Evidence: handlers where warehouse filtering is conditionally applied, allowing broader queries when warehouse context is absent.
   - Impact: cross-warehouse access risk for sensitive operations.
   - Recommendation: make warehouse/device context mandatory in warehouse operation endpoints.

### High

1. **Token/session security tradeoff**
   - Evidence: client-readable access token cookie pattern.
   - Impact: elevated token exposure risk under XSS.
   - Recommendation: prefer HttpOnly access/session model and server-managed refresh flow.

2. **Domain boundary erosion (`entities` vs `services`)**
   - Evidence: move-operation logic appears in both layers with cross-imports.
   - Impact: duplicated rules, unclear ownership, higher refactor cost.
   - Recommendation: finish migration to `src/lib/entities/**` and remove legacy service dependencies.

3. **Unauthenticated/weakly protected error ingestion**
   - Evidence: public-facing error ingestion path without strict protection and throttling.
   - Impact: log flooding, noisy telemetry, operational overhead.
   - Recommendation: require trusted caller context, rate limit, and payload size caps.

4. **Warehouse aggregation endpoint mixes concerns**
   - Evidence: single route combines auth/context, aggregation, and response shaping.
   - Impact: complexity and poor scalability.
   - Recommendation: move aggregation to dedicated entity/read-model use case.

### Medium

1. **Inconsistent response envelopes**
   - Evidence: shared response helpers coexist with ad-hoc auth response payloads.
   - Impact: frontend handling complexity and error inconsistency.
   - Recommendation: standardize one API response contract across all handlers.

2. **Partial observability strategy**
   - Evidence: mixed `console` logging, partial persistence path, and stub logging endpoint.
   - Impact: weaker incident diagnostics.
   - Recommendation: define one structured logging pattern and phase out ad-hoc logs.

3. **Coverage gaps in API route tests**
   - Evidence: stronger auth tests, thinner dashboard/warehouse route authorization tests.
   - Impact: security regressions may ship unnoticed.
   - Recommendation: add route-level authorization/contract tests for representative critical endpoints.

4. **Environment/config drift risk**
   - Evidence: permissive defaults and fixed development origin assumptions.
   - Impact: non-portable behavior and hidden misconfiguration.
   - Recommendation: fail-fast config checks and environment-driven runtime settings.

### Low

1. **Debug/stub behavior in runtime paths**
   - Evidence: debugging payload behavior and placeholder ops endpoints.
   - Impact: accidental dependency on non-production behavior.
   - Recommendation: remove or hard-gate debug paths to development mode only.

2. **Documentation drift**
   - Evidence: referenced docs structure not fully aligned with current tree.
   - Impact: onboarding friction and confusion.
   - Recommendation: make `docs/` canonical and keep README links synchronized.

## 3) Bottlenecks (performance/scalability)

1. **Query-heavy warehouse home aggregation**
   - Multiple dependent reads in one handler increase latency under load.
2. **Unbounded or broad retrieval patterns**
   - Lists without tight windowing and broad search filters can degrade at scale.
3. **Potential connection pressure at scale**
   - Database pool/runtime behavior may need explicit tuning with higher concurrency.

## 4) Maintainability inconsistencies

1. Role policies are not consistently centralized.
2. API response and error contracts are not uniformly applied.
3. Business logic is split across intended and legacy layers.
4. Logging and operational diagnostics patterns are uneven.
5. Runtime debug behavior is still mixed with production code paths.

## 5) Quick wins (1-2 days)

1. Add and apply centralized API namespace guards for all dashboard/warehouse routes.
2. Enforce mandatory warehouse context on warehouse operational endpoints.
3. Remove or gate debug behavior in runtime API routes.
4. Normalize auth route responses to the shared response helper contract.
5. Add targeted authorization tests for 4-6 high-risk routes.

## 6) Longer-term structural improvements

1. Complete migration from `services` to `entities` for domain logic.
2. Introduce route-level architecture fitness checks in CI (authz and import-boundary rules).
3. Refactor warehouse aggregation into dedicated read models/use cases with bounded queries.
4. Implement structured observability with correlation IDs and standardized server logging.
