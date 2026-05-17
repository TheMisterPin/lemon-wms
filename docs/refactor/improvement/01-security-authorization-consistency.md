# Improvement: Security and Authorization Consistency

## Gap
API-level authorization checks are inconsistent by route.

## Improvement plan
- Centralize authorization policy declarations.
- Remove duplicated route-level authorization boilerplate.
- Add policy tests for representative critical endpoints.

## Outcome
Predictable and enforceable access control across all API surfaces.
