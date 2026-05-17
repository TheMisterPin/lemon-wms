# Improvement: Reliability and Correctness Under Load

## Gap
Heavy route-level orchestration and limited idempotency/retry strategy.

## Improvement plan
- Refactor heavy handlers into domain read models/use-cases.
- Add idempotency keys on critical mutations.
- Add concurrency and retry-path tests.

## Outcome
Safer high-throughput operations and predictable floor execution behavior.
