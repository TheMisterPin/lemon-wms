# Primitive: Dashboard Primitives

## Purpose

Shared dashboard UI building blocks extracted from the stock and location dashboard layouts.

## Source Components

- `src/components/dashboard/stock/dashboard-stock-page.tsx`
- `src/components/dashboard/warehouses/components/warehouse-stock-summary.tsx`
- `src/components/dashboard/zones/components/zone-bins-section.tsx`
- `src/components/dashboard/warehouses/components/warehouse-activity-summary.tsx`
- `src/components/dashboard/orders/dashboard-orders-overview-view.tsx`

## Target Path

```txt
src/components/primitives/dashboard
```

## Props DTO

```ts
type DashboardSectionProps = {
  title: ReactNode
  action?: ReactNode
  children: ReactNode
}

type DashboardDonutBreakdownRow = {
  id: string
  label: string
  value: number
  color: string
}

type DashboardStatusBreakdownRow = {
  id: string
  label: string
  available: number
  reserved: number
  blocked: number
}
```

## Styling Rules

- Match `/dashboard/stock` section spacing, chart card frame, and dashboard card proportions.
- Item/stock KPI cards stay plain: no category icon and no gradient/color emphasis.
- Location donuts show parent categories only.
- Zone/bin previews show 3 cards before the sheet.
- Activity previews show 4 rows before the sheet.

## Allowed Responsibilities

- Render dashboard shells, sections, KPI cards, chart panels, donut charts, stacked breakdowns, preview sheets, and dashboard table wrappers.
- Compose shadcn/ui and existing GenericTable/TableShell components.
- Own reusable UI-only state for preview sheets.

## Forbidden Responsibilities

- Fetching data.
- Calling mutations or API clients.
- Knowing API route paths.
- Encoding entity-specific business rules.

## Migration Usage

Before:

```tsx
<StockSection title="Stock breakdown">
  <StockChartPanel>{/* local chart */}</StockChartPanel>
</StockSection>
```

After:

```tsx
<DashboardSection title="Stock breakdown">
  <DashboardStatusBreakdown rows={rows} />
</DashboardSection>
```

## Open Questions

- Remaining dashboard raw tables in users, devices, item/category/health detail screens should migrate to `DashboardDataTable` in follow-up batches.

## Refactor Status

Status: in-progress
Old path: dashboard-local stock/location/order render helpers
New path: `src/components/primitives/dashboard/*`
Related files: stock page, warehouse stock summary, zone bins, warehouse activity, orders overview
Imports updated: yes for current batch
Typecheck status: `pnpm exec tsc --noEmit` passed
Notes: Initial extraction deliberately keeps behavior and data contracts unchanged.
