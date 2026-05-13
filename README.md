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
- Warehouses, zones, and bins.
- Items and catalog management.
- Users, roles, and device assignments.
- Purchase order lifecycle: DRAFT → RELEASED → EXECUTING → EXECUTED.

### Purchase Order Execution (floor API)
The floor side has a fully wired purchase order execution flow:
1. A floor worker logs in with badge + PIN on an authorized device (token carries `warehouseId` + `zoneId`).
2. Worker picks a RELEASED order from the warehouse pool; starting it creates an `OrderAssignment` and transitions the PO to EXECUTING.
3. The receipt document is fetched; each line is declared (quantity + disposition) which writes an `OrderExecutionActivity` and — when a destination bin is provided — a `BinOperationEntry`, `ItemLedgerEntry`, and `BinStockItem` upsert.
4. Completing the receipt finalizes all statuses and writes a closing `UserActivityEntry`.

Every action produces an immutable 5-layer audit trail: `UserActivityEntry → OrderAssignment → OrderExecutionActivity → BinOperationEntry → ItemLedgerEntry`.

See `docs/developer/purchase-order-execution.md` for a full walkthrough.

### Demo Mode & Simulation
When `IS_DEMO=true` is set, the dashboard sidebar shows a **Simulation** panel above the dark-mode toggle. Clicking "Purchase Order" opens a modal that:
- Lets you pick any active floor worker, any RELEASED purchase order, and an empty destination bin.
- Executes the full floor API sequence with live step feedback.
- On completion, displays four log-viewer sheets: Activities, Bin Operations, Item Ledger, and Bin Contents.

This is useful for demoing the system without needing a physical floor device.

### App Surfaces
- Office dashboard surface (`/dashboard`)
- Warehouse execution surface (`/warehouse`)
- Floor flow (`/floor`)
- Authentication experience (`/login`)

### Platform Foundations
- Prisma schema for core WMS entities and relationships.
- PostgreSQL-backed persistence.
- Typed API routes under `src/app/api` for key domain resources.
- Demo-mode simulation endpoints under `/api/simulation/` (gated by `IS_DEMO`).

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

### Seeded demo access

After running `pnpm seed:all` (or `docker compose up --build`), you can sign in with these seeded credentials:

- **Office login:** [`/login`](http://localhost:3000/login)
  - Email: `owner@lemon-wms.local`
  - Password: `owner1234`
- **Warehouse/floor login:** [`/floor`](http://localhost:3000/floor)
  - Device name/code: `DEMO`
  - Badge number: `USR-0000`
  - PIN: `1234`


### Option B) Run with Docker Compose (app + PostgreSQL + seed)
```bash
docker compose up --build
```

This compose stack will:
- Start a blank PostgreSQL 16 container (`wms_db`)
- Run Prisma schema sync (`prisma db push`)
- Seed the database (`pnpm seed:all`)
- Start Next.js on `http://localhost:3000`

To reset the database back to blank and reseed on next startup:
```bash
docker compose down -v
docker compose up --build
```


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

# Database
pnpm seed:all        # Seed users, warehouses, and stock (full bootstrap)
pnpm seed:users      # Seed sample users only
pnpm seed:warehouses # Seed sample warehouses + zones + bins only
pnpm seed:stock      # Seed purchase orders and receipt data only

# Simulation (requires a running dev server + seeded DB)
pnpm simulate        # Run the full purchase order simulation via real API endpoints
```

To run the simulation in demo mode with the UI panel:
```bash
IS_DEMO=true pnpm dev   # Enables the Simulation section in the dashboard sidebar
```

---

## Repository Structure

```text
src/
  app/                # App router pages + API route handlers
    api/simulation/   # Demo-mode simulation endpoints (IS_DEMO=true only)
  components/         # UI and domain-facing components
    features/simulation/  # Simulation modal, runner, and log-viewer sheets
  utils/              # Utility modules and feature helpers
  types/              # Shared typing/model declarations
  __tests__/          # Unit/integration tests
prisma/               # Prisma schema and migration assets
seed/                 # Seed scripts for bootstrapping data
simulation/           # CLI simulation script (pnpm simulate)
docs/                 # Architecture and developer documentation
  developer/          # Workflow walkthroughs for developers
```

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
