# Lemon WMS

**Lemon WMS** is a modern warehouse management platform built for teams that need fast inventory visibility, reliable execution on the floor, and secure control in the office.

> From receiving to putaway, cycle counts, and outbound prep, Lemon WMS is being shaped as a production-grade system for real operational workflows.

---

## Product Vision

Lemon WMS is designed around a simple principle: **warehouse software should reduce friction, not create it**.

The platform combines:
- A clean, role-aware web experience for office and floor users.
- Strong domain modeling for inventory, location hierarchy, and user permissions.
- API-first architecture that supports automation and future integrations.

---

## Current Product Capabilities

### Access & Security
- Credential-based login plus badge + PIN authentication flows.
- JWT session handling.
- Role-aware middleware and route segmentation.

### Warehouse Domain Coverage
- Warehouses
- Zones
- Bins
- Items
- Users and role assignments

### App Surfaces
- Office dashboard surface (`/dashboard`)
- Warehouse execution surface (`/warehouse`)
- Floor flow (`/floor`)
- Authentication experience (`/login`)

### Platform Foundations
- Prisma schema for core WMS entities and relationships.
- PostgreSQL-backed persistence.
- Typed API routes under `src/app/api` for key domain resources.

---

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js Route Handlers, Prisma ORM
- **Database:** PostgreSQL
- **UI:** Radix-based component patterns + custom UI library
- **Testing:** Vitest + Testing Library

---

## Getting Started

### 1) Install dependencies
```bash
pnpm install
```

### 2) Configure environment
Create a `.env` file with your database and auth settings (for example `DATABASE_URL`, JWT-related secrets, and any app-specific variables required by your setup).

### 3) Generate Prisma client
```bash
pnpm prisma generate
```

### 4) Run database migrations
```bash
pnpm prisma migrate dev
```

### 5) Start the app
```bash
pnpm dev
```

Open: `http://localhost:3000`

---

## Developer Commands

```bash
pnpm dev             # Start local development server
pnpm build           # Build production app
pnpm start           # Run production build
pnpm lint            # Run ESLint
pnpm test            # Run test suite once
pnpm test:watch      # Run tests in watch mode
pnpm test:coverage   # Run tests with coverage
pnpm seed:users      # Seed sample users
pnpm seed:warehouses # Seed sample warehouses
```

---

## Repository Structure

Current structure (today):

```text
src/
  app/                # App router pages + API route handlers
  components/         # UI and domain-facing components
  utils/              # Utility modules and feature helpers
  types/              # Shared typing/model declarations
  __tests__/          # Unit/integration tests
prisma/               # Prisma schema and migration assets
seed/                 # Seed scripts for bootstrapping data
docs/                # Architecture and developer documentation
```

Planned structure proposal:

- See `docs/folder-structure-proposal.md` for a feature-first folder layout and phased migration plan.

---

## Roadmap Focus

Near-term areas of investment include:
- Richer inbound and outbound operational flows.
- Stronger reporting and KPI visibility.
- Expanded auditing, traceability, and event logging.
- Integration readiness for ERP and shipping systems.

---

## Status

Lemon WMS is actively evolving from foundation work into a full product. Contributions and feedback are welcome as the platform matures.
