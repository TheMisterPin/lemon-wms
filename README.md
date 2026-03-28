# Lemon WMS

Lemon WMS is a full-featured Warehouse Management System built with Next.js, TypeScript, Tailwind, and Prisma/PostgreSQL.

## Phase 0 status
This repository currently includes the Foundation phase:
- Core Prisma domain schema for WMS entities
- Custom JWT authentication (credential and badge+PIN flows)
- Role-aware middleware for Office (`/dashboard`) vs Floor (`/warehouse`)
- Initial app shells for `/login`, `/floor`, `/dashboard`, and `/warehouse`

## Development
```bash
npm run dev
npx prisma generate
npm run build
```
