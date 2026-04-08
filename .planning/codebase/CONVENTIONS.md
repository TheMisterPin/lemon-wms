# Coding Conventions

**Analysis Date:** 2026-04-08

## Naming Patterns

**Files:**
- Predominantly kebab-case for TypeScript modules (e.g., `create-warehouse.ts`, `get-zones.ts`)
- API route handlers always use `route.ts` under a route directory
- Tests use `.test.ts` / `.test.tsx` suffix in `src/__tests__/`

**Functions:**
- camelCase for functions and variables
- Action-oriented names in entity layer (`create*`, `get*`, `update*`, `delete*`)
- Handler names follow Next convention (`GET`, `POST`, `PUT`, `DELETE`)

**Types:**
- `type` aliases in PascalCase (`CredentialLoginParams`, `AccessTokenPayload`)
- Prisma enum values are UPPER_SNAKE_CASE in schema (e.g., `WAREHOUSE_MANAGER`)

## Code Style

**Formatting (from `eslint.config.mjs`):**
- 2-space indentation
- Single quotes
- No semicolons
- No trailing commas (`comma-dangle: never`)
- Strong spacing rules (`object-curly-spacing`, `arrow-spacing`, `key-spacing`)

**Linting:**
- ESLint 9 with Next core-web-vitals + TypeScript config
- `unused-imports` plugin actively removes/import-checks dead imports
- `import/order` enforced with `@/*` treated as internal alias
- `no-console` warns (allows `console.warn`/`console.error`)

## Import Organization

**Order (enforced):**
1. Built-in
2. External
3. Internal (`@/*`)
4. Parent/sibling
5. Index/object/type groups

**Path Aliases:**
- `@/*` maps to `src/*` via `tsconfig.json`

## Error Handling

**Patterns:**
- Route handlers validate input using Zod before domain calls
- Domain failures may throw `DomainError` (`src/lib/errors.ts`)
- Route handlers catch and map to HTTP JSON responses
- Unknown errors logged and converted to generic 5xx responses

**Response Helpers:**
- Reuse helpers in `src/lib/api/response.ts` (`ok`, `fail`, `unauthorized`, etc.) where adopted

## Logging

**Current practice:**
- Boundary logging with `console.error(...)` in API routes
- Limited/no centralized logger abstraction in sampled paths

## Comments

**Observed style:**
- Sparse comments, usually explaining non-obvious auth/session flow
- `TODO` present in at least one runtime path (`src/lib/axios.ts`)
- Focus is mostly "why" comments when included

## Function Design

**Patterns:**
- Small focused entity functions in `src/lib/entities/`
- Guard clauses early in route handlers and auth helpers
- Async/await style preferred over promise chains in domain/API code

## Module Design

**Exports:**
- Mostly named exports in domain modules
- Default exports for singleton-like instances (`src/lib/prisma.ts`) and some component modules
- `index.ts` barrels used selectively in domain folders

**Layering rule in practice:**
- Keep route handlers thin and delegate business logic to `src/lib/entities/<domain>/`
- Avoid embedding large Prisma logic directly in route files

---

*Convention analysis: 2026-04-08*
*Update when patterns change*
