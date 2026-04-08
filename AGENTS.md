<!-- GSD:project-start source:PROJECT.md -->
## Project

**Lemon WMS — Orders domain (purchase orders first)**

Extend the existing Lemon WMS Next.js app with an **orders** capability, starting with **purchase orders**: office users create orders to suppliers from the dashboard; warehouse staff execute and pause/resume them on the floor. The app already has dashboard vs warehouse surfaces, Prisma/PostgreSQL, JWT auth, and `PurchaseOrder` / `PurchaseOrderLine` / `BusinessParty` / `Item` models—this work wires APIs, domain logic, and UI around those models.

**Core Value:** Office users can **create, release, and track** supplier purchase orders; warehouse users can **see operational orders by status, start execution, and pause**—with a single shared data model and clear status transitions.

### Constraints

- **Tech stack:** Next.js 16 App Router, Prisma 7, PostgreSQL, existing Axios + Zustand auth — no new data-fetching framework.  
- **API layout:** New routes live under `src/app/api/dashboard/` and `src/app/api/warehouse/` per existing conventions.  
- **Compatibility:** Must not break existing dashboard/warehouse flows outside orders.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.x - Main app code in `src/` and API handlers in `src/app/api/`
- JavaScript (ESM/CJS) - Workflow/tooling scripts in `.codex/get-shit-done/bin/` and `.claude/get-shit-done/bin/`
- SQL via Prisma schema DSL - Data model in `prisma/schema.prisma`
## Runtime
- Node.js runtime (Next.js 16 server + Vitest runtime)
- Browser runtime for React 19 client components
- pnpm 10.29.3 (declared in `package.json`)
- Lockfile: `pnpm-lock.yaml`
## Frameworks
- Next.js 16.2.1 - App Router UI and API routes (`src/app/`)
- React 19.2.3 - UI component layer
- Prisma 7.3.0 - ORM/data access (`src/lib/prisma.ts`, `src/generated/prisma`)
- Vitest 4.1.2 - Unit/integration tests in `src/__tests__/`
- Testing Library (`@testing-library/react`, `@testing-library/jest-dom`) - component tests
- Tailwind CSS 4 - styling, with shadcn setup (`components.json`, `src/app/globals.css`)
- ESLint 9 + `eslint-config-next` - linting (`eslint.config.mjs`)
- tsx - script execution for seeding (`seed/*.ts`)
## Key Dependencies
- `next` - full-stack routing/rendering
- `@prisma/client` + `@prisma/adapter-pg` + `pg` - PostgreSQL access path
- `jsonwebtoken` + `bcrypt` - auth token/signature and password hashing
- `axios` - client-side API transport (`src/lib/axios.ts`)
- `zustand` - auth/session client state (`src/lib/auth/store.ts`)
- `zod` + `react-hook-form` - validation + form control
- `radix-ui` primitives and `lucide-react` iconography
- shadcn configuration via `components.json`
## Configuration
- `.env` and `.env.example` present
- Key vars observed in code: `DATABASE_URL`, `JWT_SECRET`, `JWT_ACCESS_EXPIRY`, `JWT_REFRESH_EXPIRY`, `NODE_ENV`
- `next.config.ts`
- `tsconfig.json`
- `postcss.config.mjs`
- `vitest.config.ts`
- `prisma.config.ts`
- `eslint.config.mjs`
## Platform Requirements
- Works on macOS/Linux/Windows with Node + pnpm
- Local Postgres expected (fallback DSN in `src/lib/prisma.ts` points at `postgresql://localhost:5432/wms_db`)
- Next.js deploy target (Node runtime; `.vercel/` and `vercel.json` exist)
- Postgres-compatible datasource for Prisma
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Predominantly kebab-case for TypeScript modules (e.g., `create-warehouse.ts`, `get-zones.ts`)
- API route handlers always use `route.ts` under a route directory
- Tests use `.test.ts` / `.test.tsx` suffix in `src/__tests__/`
- camelCase for functions and variables
- Action-oriented names in entity layer (`create`*, `get*`, `update*`, `delete*`)
- Handler names follow Next convention (`GET`, `POST`, `PUT`, `DELETE`)
- `type` aliases in PascalCase (`CredentialLoginParams`, `AccessTokenPayload`)
- Prisma enum values are UPPER_SNAKE_CASE in schema (e.g., `WAREHOUSE_MANAGER`)
## Code Style
- 2-space indentation
- Single quotes
- No semicolons
- No trailing commas (`comma-dangle: never`)
- Strong spacing rules (`object-curly-spacing`, `arrow-spacing`, `key-spacing`)
- ESLint 9 with Next core-web-vitals + TypeScript config
- `unused-imports` plugin actively removes/import-checks dead imports
- `import/order` enforced with `@/`* treated as internal alias
- `no-console` warns (allows `console.warn`/`console.error`)
## Import Organization
- `@/`* maps to `src/*` via `tsconfig.json`
## Error Handling
- Route handlers validate input using Zod before domain calls
- Domain failures may throw `DomainError` (`src/lib/errors.ts`)
- Route handlers catch and map to HTTP JSON responses
- Unknown errors logged and converted to generic 5xx responses
- Reuse helpers in `src/lib/api/response.ts` (`ok`, `fail`, `unauthorized`, etc.) where adopted
## Logging
- Boundary logging with `console.error(...)` in API routes
- Limited/no centralized logger abstraction in sampled paths
## Comments
- Sparse comments, usually explaining non-obvious auth/session flow
- `TODO` present in at least one runtime path (`src/lib/axios.ts`)
- Focus is mostly "why" comments when included
## Function Design
- Small focused entity functions in `src/lib/entities/`
- Guard clauses early in route handlers and auth helpers
- Async/await style preferred over promise chains in domain/API code
## Module Design
- Mostly named exports in domain modules
- Default exports for singleton-like instances (`src/lib/prisma.ts`) and some component modules
- `index.ts` barrels used selectively in domain folders
- Keep route handlers thin and delegate business logic to `src/lib/entities/<domain>/`
- Avoid embedding large Prisma logic directly in route files
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- App Router pages and API routes in one repo (`src/app/`)
- Role-aware UI and route access (`middleware.ts`)
- Thin route handlers delegating to domain entities (`src/lib/entities/*`)
- Shared Prisma data layer and generated client (`src/lib/prisma.ts`, `src/generated/prisma`)
## Layers
- Purpose: Render office and floor experiences
- Contains: pages/layouts/components in `src/app/` and `src/components/`
- Depends on: API clients, hooks, shared types
- Used by: end users via browser
- Purpose: Parse requests, validate payloads, enforce auth/role, shape responses
- Contains: route handlers under `src/app/api/**/route.ts`
- Depends on: auth middleware helpers, schemas, entities, response helpers
- Used by: frontend clients and potential internal clients
- Purpose: Implement business use-cases and data operations by domain
- Contains: `src/lib/entities/auth`, `warehouses`, `zones`, `bins`, `items`, `move-operations`, etc.
- Depends on: Prisma client types and shared domain utilities
- Used by: API route handlers
- Purpose: Persistence and cross-cutting technical services
- Contains: Prisma bootstrap (`src/lib/prisma.ts`), auth/session infra (`src/lib/auth/*`), converters/schemas/helpers
- Depends on: external libs (Prisma, pg, JWT, bcrypt)
- Used by: domain + API layers
## Data Flow
- Server state persisted in PostgreSQL
- Client auth/session state in Zustand + browser storage (`src/lib/auth/store.ts`)
## Key Abstractions
- Purpose: Domain-level use cases and data logic
- Examples: `src/lib/entities/auth/credential-login.ts`, `src/lib/entities/move-operations/use-cases/*`
- Pattern: Small focused modules, generally named by action (`create-*`, `get-*`, `update-*`, `delete-*`)
- Purpose: Standardize identity and role checks
- Examples: `AccessTokenPayload`, `isOfficeRole`, `isFloorRole`
- Pattern: Shared auth helper module + middleware enforcement
- Purpose: Keep API response shape consistent
- Examples: `ok`, `created`, `fail`, `unauthorized`, `validationFail` in `src/lib/api/response.ts`
- Pattern: thin wrapper around `NextResponse`
## Entry Points
- Location: `src/app/layout.tsx` and route-specific pages under `src/app/(dashboard)` and `src/app/(warehouse)`
- Triggers: browser route access
- Responsibilities: render UI surfaces, mount provider shells
- Location: `src/app/api/**/route.ts`
- Triggers: HTTP requests to `/api/*`
- Responsibilities: auth, validation, call domain logic, return JSON
- Location: `middleware.ts`
- Triggers: all incoming non-static requests
- Responsibilities: auth resolution, role-based redirect/routing rules
## Error Handling
- `DomainError` used for expected domain failures (`src/lib/errors.ts`)
- Route-level `try/catch` with explicit fallback response
- Console logging on unexpected failures before returning generic error
## Cross-Cutting Concerns
- Primarily `console.error` in route handlers
- Zod schemas at API boundary (`src/lib/schemas/*`)
- JWT verification + role checks in shared auth middleware
- Token refresh flow through `/api/auth/refresh` and client interceptors
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

| Skill | Description | Path |
|-------|-------------|------|
| shadcn | Manages shadcn components and projects — adding, searching, fixing, debugging, styling, and composing UI. Provides project context, component docs, and usage examples. Applies when working with shadcn/ui, component registries, presets, --preset codes, or any project with a components.json file. Also triggers for "shadcn init", "create an app with --preset", or "switch to --preset". | `.claude/skills/shadcn/SKILL.md` |
| ui-ux-pro-max | "UI/UX design intelligence. 67 styles, 96 palettes, 57 font pairings, 25 charts, 13 stacks (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui). Actions: plan, build, create, design, implement, review, fix, improve, optimize, enhance, refactor, check UI/UX code. Projects: website, landing page, dashboard, admin panel, e-commerce, SaaS, portfolio, blog, mobile app, .html, .tsx, .vue, .svelte. Elements: button, modal, navbar, sidebar, card, table, form, chart. Styles: glassmorphism, claymorphism, minimalism, brutalism, neumorphism, bento grid, dark mode, responsive, skeuomorphism, flat design. Topics: color palette, accessibility, animation, layout, typography, font pairing, spacing, hover, shadow, gradient. Integrations: shadcn/ui MCP for component search and examples." | `.claude/skills/ui-ux-pro-max/SKILL.md` |
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
