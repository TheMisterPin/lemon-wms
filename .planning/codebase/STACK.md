# Technology Stack

**Analysis Date:** 2026-04-08

## Languages

**Primary:**
- TypeScript 5.x - Main app code in `src/` and API handlers in `src/app/api/`

**Secondary:**
- JavaScript (ESM/CJS) - Workflow/tooling scripts in `.codex/get-shit-done/bin/` and `.claude/get-shit-done/bin/`
- SQL via Prisma schema DSL - Data model in `prisma/schema.prisma`

## Runtime

**Environment:**
- Node.js runtime (Next.js 16 server + Vitest runtime)
- Browser runtime for React 19 client components

**Package Manager:**
- pnpm 10.29.3 (declared in `package.json`)
- Lockfile: `pnpm-lock.yaml`

## Frameworks

**Core:**
- Next.js 16.2.1 - App Router UI and API routes (`src/app/`)
- React 19.2.3 - UI component layer
- Prisma 7.3.0 - ORM/data access (`src/lib/prisma.ts`, `src/generated/prisma`)

**Testing:**
- Vitest 4.1.2 - Unit/integration tests in `src/__tests__/`
- Testing Library (`@testing-library/react`, `@testing-library/jest-dom`) - component tests

**Build/Dev:**
- Tailwind CSS 4 - styling, with shadcn setup (`components.json`, `src/app/globals.css`)
- ESLint 9 + `eslint-config-next` - linting (`eslint.config.mjs`)
- tsx - script execution for seeding (`seed/*.ts`)

## Key Dependencies

**Critical:**
- `next` - full-stack routing/rendering
- `@prisma/client` + `@prisma/adapter-pg` + `pg` - PostgreSQL access path
- `jsonwebtoken` + `bcrypt` - auth token/signature and password hashing
- `axios` - client-side API transport (`src/lib/axios.ts`)
- `zustand` - auth/session client state (`src/lib/auth/store.ts`)
- `zod` + `react-hook-form` - validation + form control

**UI/Foundation:**
- `radix-ui` primitives and `lucide-react` iconography
- shadcn configuration via `components.json`

## Configuration

**Environment:**
- `.env` and `.env.example` present
- Key vars observed in code: `DATABASE_URL`, `JWT_SECRET`, `JWT_ACCESS_EXPIRY`, `JWT_REFRESH_EXPIRY`, `NODE_ENV`

**Build and Tooling Config:**
- `next.config.ts`
- `tsconfig.json`
- `postcss.config.mjs`
- `vitest.config.ts`
- `prisma.config.ts`
- `eslint.config.mjs`

## Platform Requirements

**Development:**
- Works on macOS/Linux/Windows with Node + pnpm
- Local Postgres expected (fallback DSN in `src/lib/prisma.ts` points at `postgresql://localhost:5432/wms_db`)

**Production:**
- Next.js deploy target (Node runtime; `.vercel/` and `vercel.json` exist)
- Postgres-compatible datasource for Prisma

---

*Stack analysis: 2026-04-08*
*Update after major dependency changes*
