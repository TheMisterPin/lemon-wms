# Codebase Structure

**Analysis Date:** 2026-04-08

## Directory Layout

```
lemon-wms/
├── src/                    # Application source
│   ├── app/                # Next.js App Router pages/layouts/API routes
│   ├── components/         # UI components (dashboard, warehouse, shared, ui)
│   ├── lib/                # Core logic (auth, entities, schemas, api helpers)
│   ├── hooks/              # React hooks
│   ├── generated/          # Prisma generated client output
│   └── __tests__/          # Test suites and setup
├── prisma/                 # Prisma schema and migrations
├── seed/                   # Data seeding scripts
├── public/                 # Static assets
├── .codex/                 # GSD/Codex workflows, templates, skills
├── .claude/                # Claude-oriented workflows/skills/docs
├── .cursor/                # Cursor rules and config
├── middleware.ts           # Global request middleware
├── package.json            # Scripts/dependencies
├── tsconfig.json           # TypeScript config
└── vitest.config.ts        # Test runner config
```

## Directory Purposes

**`src/app/`:**
- Purpose: Routing surface for pages and APIs
- Contains: route groups `(dashboard)`, `(warehouse)`, `(auth)`, plus `api/*` handlers
- Key files: `src/app/layout.tsx`, `src/app/api/auth/login/route.ts`
- Subdirectories: dashboard/floor page trees and REST-style route folders

**`src/lib/entities/`:**
- Purpose: Domain-focused business logic modules
- Contains: domain folders (`auth`, `warehouses`, `zones`, `bins`, `items`, `move-operations`, etc.)
- Key files: `src/lib/entities/auth/credential-login.ts`, `src/lib/entities/warehouses/get-warehouses.ts`
- Subdirectories: action-style files and use-case folders

**`src/components/`:**
- Purpose: reusable UI implementation
- Contains: `dashboard`, `warehouse`, `shared`, `ui` primitives, forms/tables
- Naming: mixed kebab-case and PascalCase files, with feature grouping by folder

**`src/__tests__/`:**
- Purpose: unit/integration tests
- Contains: mirrored feature/api/auth test suites plus `setup.ts`
- Key files: `src/__tests__/setup.ts`, `src/__tests__/app/api/auth/login.test.ts`

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: root app shell
- `middleware.ts`: global auth/routing enforcement
- `src/app/api/**/route.ts`: backend entrypoints

**Configuration:**
- `package.json`: scripts and dependency graph
- `eslint.config.mjs`: lint rules
- `tsconfig.json`: TS compilation rules + path alias
- `prisma.config.ts`: Prisma datasource config
- `next.config.ts`: Next runtime config

**Core Logic:**
- `src/lib/entities/`: domain operations
- `src/lib/auth/`: token/session/auth helpers
- `src/lib/schemas/`: zod request schemas
- `prisma/schema.prisma`: data model source of truth

**Testing:**
- `src/__tests__/`: all discovered tests
- `vitest.config.ts`: test environment/setup

**Documentation/Planning:**
- `.codex/get-shit-done/`: templates/workflows
- `.planning/`: generated planning artifacts (created by GSD commands)

## Naming Conventions

**Files:**
- Common pattern: kebab-case for modules (`get-warehouses.ts`, `create-bin.ts`)
- Tests: `*.test.ts` / `*.test.tsx` under `src/__tests__/`
- Route files: fixed `route.ts` per API folder

**Directories:**
- Domain folders are plural nouns (`warehouses`, `zones`, `users`)
- Next route groups use parentheses (`(dashboard)`, `(warehouse)`, `(auth)`)

**Special Patterns:**
- `index.ts` used as barrel in some domains (`src/lib/entities/*/index.ts`)
- Generated code in `src/generated/prisma` should not be hand-edited

## Where to Add New Code

**New Domain Capability:**
- Entity logic: `src/lib/entities/<domain>/`
- Schema: `src/lib/schemas/<domain>.ts`
- API route: `src/app/api/dashboard/...` or `src/app/api/warehouse/...` based on surface
- Tests: `src/__tests__/...` matching route/domain path

**New UI feature:**
- Office UI: `src/components/dashboard/...` and relevant page under `src/app/(dashboard)/...`
- Floor UI: `src/components/warehouse/...` and relevant page under `src/app/(warehouse)/...`

## Special Directories

**`src/generated/prisma/`:**
- Purpose: generated Prisma client
- Source: `pnpm prisma generate` / postinstall
- Committed: yes in this repo snapshot, but treated as generated output

**`.next/`:**
- Purpose: Next build artifacts
- Source: `next dev`/`next build`
- Committed: no (ignored build output)

---

*Structure analysis: 2026-04-08*
*Update when directory structure changes*
