# Testing Patterns

**Analysis Date:** 2026-04-08

## Test Framework

**Runner:**
- Vitest 4.1.2
- Config file: `vitest.config.ts`
- Environment: `node` with setup file `src/__tests__/setup.ts`

**Assertion Library:**
- Vitest built-in `expect`
- Additional matchers via `@testing-library/jest-dom` for UI tests

**Run Commands:**
```bash
pnpm test                 # run all tests once
pnpm test:watch           # watch mode
pnpm test:coverage        # coverage run
```

## Test File Organization

**Location:**
- Centralized under `src/__tests__/`
- Mirrors runtime folders (e.g., `src/__tests__/app/api/auth/login.test.ts`)

**Naming:**
- `<subject>.test.ts` and `<subject>.test.tsx`

**Structure snapshot:**
```
src/__tests__/
  app/api/auth/*.test.ts
  lib/auth/*.test.ts
  lib/entities/**/*.test.ts
  components/**/*.test.tsx
  hooks/**/*.test.tsx
  middleware.test.ts
  setup.ts
```

## Test Structure

**Suite organization pattern:**
- `describe(...)` blocks by route/module
- `beforeEach` clears mocks (`vi.clearAllMocks()`)
- explicit request/data helpers inside test files
- assertions focus on HTTP status, payload shape, and side-effect calls

**Representative pattern source:**
- `src/__tests__/app/api/auth/login.test.ts`

## Mocking

**Framework:**
- Vitest `vi.mock`, `vi.fn`, `vi.mocked`

**Observed patterns:**
- Module mocking at top-of-file before imports (Prisma/session/auth helpers)
- Mocks for DB and side effects (`prisma.user.findUnique`, `userActivityEntry.create`)
- `vi.restoreAllMocks()` in global setup/cleanup

**What is commonly mocked:**
- Prisma client modules
- Auth/session helpers
- External boundaries and mutable global state

## Fixtures and Factories

**Patterns:**
- Local factory/helper functions in test file (`buildUser`, `makeRequest`)
- Lightweight inline fixtures over heavyweight shared fixture system

## Coverage

**Available:**
- `pnpm test:coverage` is configured

**Current expectation:**
- Coverage is generated on demand; no explicit threshold enforcement found in sampled config

## Test Types

**Unit tests:**
- Auth utilities, formatters, entities, hooks

**Integration-like API tests:**
- Route handler behavior with mocked persistence/auth boundaries

**E2E tests:**
- No Playwright/Cypress E2E suite detected in repository snapshot

## Common Patterns

**Async behavior:**
- `await` route handlers and async assertions
- Validate both success and failure branches

**Error-path testing:**
- Invalid payload, unknown user, bad credentials, forbidden role cases are explicitly covered in auth tests

---

*Testing analysis: 2026-04-08*
*Update when test patterns change*
