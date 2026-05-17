# Hardening: Purchase Order Lifecycle and Floor Execution

## Point from assessment
Purchase-order lifecycle and floor execution flow are modeled and implemented.

## Why this matters
The PO lifecycle is a business-critical path where correctness and consistency directly impact warehouse throughput.

## Hardening actions
- Add idempotency keys for start/pause/resume/complete transitions.
- Add concurrency tests for race conditions across floor users.
- Introduce invariant checks for status transitions and assignment consistency.

## Deliverables
- Idempotent transition handlers.
- Transition stress-test suite.
- Lifecycle invariant checklist enforced in CI.
