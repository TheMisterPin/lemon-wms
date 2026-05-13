import type {
  StockDashboardCategoryRow,
  StockDashboardData,
  StockDashboardItemRow,
  StockDashboardSubcategoryGroup,
  StockDashboardSubcategoryRow,
} from '@/types/stock-dashboard.types'
import type {
  CategoryHealthRow,
  InventoryHealthAlert,
  InventoryHealthDashboardDTO,
  InventoryHealthIssueRow,
  InventoryHealthIssueSlice,
  WarehouseHealthRow,
} from '@/types/inventory-health-dashboard.types'
import { getStockDashboard } from '@/lib/entities/stock/get-stock-dashboard'
import { getInventoryHealthDashboardData } from '@/lib/pages/dashboard/get-inventory-health-dashboard-data'

import { builder } from '../schema'
import { DashboardHeaderType, DashboardKpiType } from './_base'

// ─── Stock Dashboard ──────────────────────────────────────────────────────────

const StockDashboardItemRowType = builder
  .objectRef<StockDashboardItemRow>('StockDashboardItemRow')
  .implement({
    fields: (t) => ({
      itemId: t.exposeString('itemId'),
      sku: t.exposeString('sku'),
      name: t.exposeString('name'),
      uom: t.exposeString('uom'),
      binsCount: t.exposeInt('binsCount'),
      totalAvailable: t.exposeFloat('totalAvailable'),
      totalReserved: t.exposeFloat('totalReserved'),
      totalBlocked: t.exposeFloat('totalBlocked'),
      totalOnHand: t.exposeFloat('totalOnHand'),
    }),
  })

const StockDashboardCategoryRowType = builder
  .objectRef<StockDashboardCategoryRow>('StockDashboardCategoryRow')
  .implement({
    fields: (t) => ({
      key: t.exposeString('key'),
      label: t.exposeString('label'),
      iconUrl: t.exposeString('iconUrl', { nullable: true }),
      totalAvailable: t.exposeFloat('totalAvailable'),
      totalReserved: t.exposeFloat('totalReserved'),
      totalBlocked: t.exposeFloat('totalBlocked'),
      totalOnHand: t.exposeFloat('totalOnHand'),
    }),
  })

const StockDashboardSubcategoryRowType = builder
  .objectRef<StockDashboardSubcategoryRow>('StockDashboardSubcategoryRow')
  .implement({
    fields: (t) => ({
      name: t.exposeString('name'),
      iconUrl: t.exposeString('iconUrl', { nullable: true }),
      onHand: t.exposeFloat('onHand'),
      available: t.exposeFloat('available'),
      reserved: t.exposeFloat('reserved'),
      blocked: t.exposeFloat('blocked'),
    }),
  })

const StockDashboardSubcategoryGroupType = builder
  .objectRef<StockDashboardSubcategoryGroup>('StockDashboardSubcategoryGroup')
  .implement({
    fields: (t) => ({
      parentKey: t.exposeString('parentKey'),
      parentLabel: t.exposeString('parentLabel'),
      parentIconUrl: t.exposeString('parentIconUrl', { nullable: true }),
      rows: t.field({
        type: [StockDashboardSubcategoryRowType],
        resolve: (g) => g.rows,
      }),
    }),
  })

const StockDashboardType = builder.objectRef<StockDashboardData>('StockDashboard').implement({
  fields: (t) => ({
    warehouseId: t.exposeString('warehouseId', { nullable: true }),
    distinctSkus: t.exposeInt('distinctSkus'),
    occupiedBins: t.exposeInt('occupiedBins'),
    totalOnHand: t.exposeFloat('totalOnHand'),
    totalAvailable: t.exposeFloat('totalAvailable'),
    totalReserved: t.exposeFloat('totalReserved'),
    totalBlocked: t.exposeFloat('totalBlocked'),
    categories: t.field({ type: [StockDashboardCategoryRowType], resolve: (d) => d.categories }),
    subcategoryGroups: t.field({
      type: [StockDashboardSubcategoryGroupType],
      resolve: (d) => d.subcategoryGroups,
    }),
    items: t.field({ type: [StockDashboardItemRowType], resolve: (d) => d.items }),
  }),
})

// ─── Inventory Health ─────────────────────────────────────────────────────────

const InventoryHealthIssueSliceType = builder
  .objectRef<InventoryHealthIssueSlice>('InventoryHealthIssueSlice')
  .implement({
    fields: (t) => ({
      type: t.exposeString('type'),
      count: t.exposeInt('count'),
    }),
  })

const CategoryHealthRowType = builder
  .objectRef<CategoryHealthRow>('CategoryHealthRow')
  .implement({
    fields: (t) => ({
      categoryId: t.exposeString('categoryId'),
      categoryName: t.exposeString('categoryName'),
      lowStock: t.exposeInt('lowStock'),
      blocked: t.exposeInt('blocked'),
      expiring: t.exposeInt('expiring'),
      quarantine: t.exposeInt('quarantine'),
      href: t.exposeString('href'),
    }),
  })

const WarehouseHealthRowType = builder
  .objectRef<WarehouseHealthRow>('WarehouseHealthRow')
  .implement({
    fields: (t) => ({
      warehouseId: t.exposeString('warehouseId'),
      warehouseName: t.exposeString('warehouseName'),
      issueCount: t.exposeInt('issueCount'),
      criticalCount: t.exposeInt('criticalCount'),
      warningCount: t.exposeInt('warningCount'),
      href: t.exposeString('href'),
    }),
  })

const InventoryHealthAlertType = builder
  .objectRef<InventoryHealthAlert>('InventoryHealthAlert')
  .implement({
    fields: (t) => ({
      id: t.exposeString('id'),
      title: t.exposeString('title'),
      entityLabel: t.exposeString('entityLabel'),
      severity: t.exposeString('severity'),
      reason: t.exposeString('reason'),
      href: t.exposeString('href'),
    }),
  })

const InventoryHealthIssueRowType = builder
  .objectRef<InventoryHealthIssueRow>('InventoryHealthIssueRow')
  .implement({
    fields: (t) => ({
      issueId: t.exposeString('issueId'),
      type: t.exposeString('type'),
      entityLabel: t.exposeString('entityLabel'),
      warehouseName: t.exposeString('warehouseName'),
      severity: t.exposeString('severity'),
      quantity: t.exposeFloat('quantity', { nullable: true }),
      detectedAt: t.exposeString('detectedAt'),
      href: t.exposeString('href'),
    }),
  })

const InventoryHealthDashboardType = builder
  .objectRef<InventoryHealthDashboardDTO>('InventoryHealthDashboard')
  .implement({
    fields: (t) => ({
      header: t.field({ type: DashboardHeaderType, resolve: (d) => d.header }),
      kpis: t.field({ type: [DashboardKpiType], resolve: (d) => d.kpis }),
      issueDistribution: t.field({
        type: [InventoryHealthIssueSliceType],
        resolve: (d) => d.issueDistribution,
      }),
      categoryHealth: t.field({
        type: [CategoryHealthRowType],
        resolve: (d) => d.categoryHealth,
      }),
      warehouseHealth: t.field({
        type: [WarehouseHealthRowType],
        resolve: (d) => d.warehouseHealth,
      }),
      alerts: t.field({ type: [InventoryHealthAlertType], resolve: (d) => d.alerts }),
      issues: t.field({ type: [InventoryHealthIssueRowType], resolve: (d) => d.issues }),
    }),
  })

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _unused = [StockDashboardItemRowType, StockDashboardCategoryRowType, StockDashboardSubcategoryRowType, StockDashboardSubcategoryGroupType, InventoryHealthIssueSliceType, CategoryHealthRowType, WarehouseHealthRowType, InventoryHealthAlertType, InventoryHealthIssueRowType]

// ─── Query fields ─────────────────────────────────────────────────────────────

builder.queryField('stockDashboard', (t) =>
  t.field({
    type: StockDashboardType,
    args: {
      warehouseId: t.arg.string({ required: false }),
    },
    resolve: (_root, args, ctx) => getStockDashboard(ctx.prisma, args.warehouseId ?? null),
  })
)

builder.queryField('inventoryHealthDashboard', (t) =>
  t.field({
    type: InventoryHealthDashboardType,
    resolve: (_root, _args, ctx) => getInventoryHealthDashboardData(ctx.prisma),
  })
)
