import type {
  CategoryHealthRow,
  InventoryHealthAlert,
  InventoryHealthDashboardDTO,
  InventoryHealthIssueRow,
  InventoryHealthIssueSlice,
  WarehouseHealthRow,
} from '@/types/inventory-health-dashboard.types'
import { getInventoryHealthDashboardData } from '@/lib/pages/dashboard/get-inventory-health-dashboard-data'

import { builder } from '../schema'
import { DashboardHeaderType, DashboardKpiType } from './shared'

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
const _unused = [InventoryHealthIssueSliceType, CategoryHealthRowType, WarehouseHealthRowType, InventoryHealthAlertType, InventoryHealthIssueRowType]

builder.queryField('inventoryHealthDashboard', (t) =>
  t.field({
    type: InventoryHealthDashboardType,
    resolve: (_root, _args, ctx) => getInventoryHealthDashboardData(ctx.prisma),
  })
)
