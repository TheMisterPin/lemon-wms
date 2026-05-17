# Lemon WMS Operational Readiness Roadmap

## Objective
Turn Lemon WMS from a promising domain implementation into a production-grade operational SaaS customers can safely run warehouses on.

## Success criteria
- Consistent and enforceable security/authorization boundaries.
- Stable and documented API contracts for internal and external clients.
- Measured reliability with published SLOs and incident response playbooks.
- Tenant-safe operations and auditable governance.

## Workstreams

### A. Security and access governance
1. Create centralized route guard utilities for dashboard/warehouse API namespaces.
2. Enforce mandatory warehouse/device context where floor operations require it.
3. Add route-policy tests for representative critical endpoints.

### B. API contract stabilization
1. Standardize all routes on shared response helpers.
2. Define canonical error codes and semantic usage rules.
3. Publish API versioning/deprecation policy and changelog discipline.

### C. Reliability engineering
1. Introduce idempotency-key handling for order transitions and receipt handling.
2. Add concurrency and race-condition tests for floor execution flows.
3. Isolate heavy route orchestration into domain-layer read models.

### D. Observability and support tooling
1. Add request correlation IDs and structured logging fields.
2. Instrument key workflows with latency, error, and throughput metrics.
3. Build initial support views for audit trail navigation and recovery analysis.

### E. Commercial readiness
1. Define tenant/account lifecycle operations and boundaries.
2. Add governance controls (retention/export/audit visibility).
3. Prepare customer-facing reliability/security documentation.

## Milestones

### Milestone 1: Contract + auth hardening (Month 1)
- Deliver centralized guards and contract normalization.
- Complete security-focused endpoint test coverage for critical flows.

### Milestone 2: Reliability + observability (Month 2)
- Deliver idempotent critical mutations and route-level metrics.
- Publish SLOs and alert thresholds for core workflows.

### Milestone 3: Operations + commercialization (Month 3)
- Deliver support tooling, governance controls, and integration guardrails.
- Publish customer-grade operational readiness package.

## Risks
- Feature pressure may delay architectural hardening work.
- Inconsistent conventions across old/new route families may slow unification.
- Lack of observability baselines may hide regressions during rapid delivery.

## Mitigations
- Reserve explicit hardening capacity in each sprint.
- Add CI checks for route contract and guard usage conventions.
- Track milestone-level readiness metrics with visible ownership.
