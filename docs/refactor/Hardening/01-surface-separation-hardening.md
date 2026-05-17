# Hardening: Office/Warehouse Surface Separation

## Point from assessment
Clear separation between office and warehouse user surfaces.

## Why this matters
Surface separation is foundational for both user experience and authorization boundaries in warehouse systems.

## Hardening actions
- Formalize namespace-level policy declarations for `/dashboard` and `/warehouse` APIs.
- Add route-policy contract tests that fail if wrong-role access is granted.
- Add periodic policy audit checklist for new routes.

## Deliverables
- Shared route guard utilities.
- CI tests for role-policy matrix.
- Documentation page mapping route families to required roles.
