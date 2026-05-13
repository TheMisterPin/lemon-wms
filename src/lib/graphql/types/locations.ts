import type { WarehouseOverviewDashboardData } from '@/types/warehouse-overview-dashboard.types'
import type {
  WarehouseActivityRow,
  WarehouseOrderTypeRow,
  WarehouseStockCategoryRow,
  WarehouseZoneSummaryRow,
} from '@/components/features/locations/warehouses/components/warehouse-overview-types'
import { getWarehouseOverviewDashboardData } from '@/lib/pages/dashboard/get-warehouse-overview-dashboard-data'

import { builder } from '../schema'

const WarehouseInfoType = builder
  .objectRef<WarehouseOverviewDashboardData['warehouse']>('WarehouseInfo')
  .implement({
    fields: (t) => ({
      id: t.exposeString('id'),
      name: t.exposeString('name'),
      code: t.exposeString('code'),
      lastActivityRelative: t.exposeString('lastActivityRelative', { nullable: true }),
    }),
  })

const WarehouseOverviewKpiType = builder
  .objectRef<{ label: string; value: string; helper: string; tone: string }>(
    'WarehouseOverviewKpi'
  )
  .implement({
    fields: (t) => ({
      label: t.exposeString('label'),
      value: t.exposeString('value'),
      helper: t.exposeString('helper'),
      tone: t.exposeString('tone'),
    }),
  })

const WarehouseOrderTypeRowType = builder
  .objectRef<WarehouseOrderTypeRow>('WarehouseOrderTypeRow')
  .implement({
    fields: (t) => ({
      type: t.exposeString('type'),
      released: t.exposeInt('released'),
      assigned: t.exposeInt('assigned'),
      active: t.exposeInt('active'),
      paused: t.exposeInt('paused'),
      completed: t.exposeInt('completed'),
      exceptions: t.exposeInt('exceptions'),
    }),
  })

const WarehouseStockCategoryRowType = builder
  .objectRef<WarehouseStockCategoryRow>('WarehouseStockCategoryRow')
  .implement({
    fields: (t) => ({
      label: t.exposeString('label'),
      totalOnHand: t.exposeFloat('totalOnHand'),
      available: t.exposeFloat('available'),
      reserved: t.exposeFloat('reserved'),
      blocked: t.exposeFloat('blocked'),
      color: t.exposeString('color'),
    }),
  })

const WarehouseZoneSummaryRowType = builder
  .objectRef<WarehouseZoneSummaryRow>('WarehouseZoneSummaryRow')
  .implement({
    fields: (t) => ({
      id: t.exposeString('id'),
      name: t.exposeString('name'),
      type: t.exposeString('type'),
      onHand: t.exposeFloat('onHand'),
      available: t.exposeFloat('available'),
      reserved: t.exposeFloat('reserved'),
      blocked: t.exposeFloat('blocked'),
      fill: t.exposeFloat('fill'),
    }),
  })

const WarehouseActivityRowType = builder
  .objectRef<WarehouseActivityRow>('WarehouseActivityRow')
  .implement({
    fields: (t) => ({
      id: t.exposeString('id'),
      time: t.exposeString('time'),
      user: t.exposeString('user'),
      action: t.exposeString('action'),
      entity: t.exposeString('entity'),
      status: t.exposeString('status'),
    }),
  })

const WarehouseOverviewDashboardType = builder
  .objectRef<WarehouseOverviewDashboardData>('WarehouseOverviewDashboard')
  .implement({
    fields: (t) => ({
      warehouse: t.field({ type: WarehouseInfoType, resolve: (d) => d.warehouse }),
      kpis: t.field({ type: [WarehouseOverviewKpiType], resolve: (d) => d.kpis }),
      orderTypes: t.field({ type: [WarehouseOrderTypeRowType], resolve: (d) => d.orderTypes }),
      stockCategories: t.field({
        type: [WarehouseStockCategoryRowType],
        resolve: (d) => d.stockCategories,
      }),
      zones: t.field({ type: [WarehouseZoneSummaryRowType], resolve: (d) => d.zones }),
      activity: t.field({ type: [WarehouseActivityRowType], resolve: (d) => d.activity }),
    }),
  })

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _unused = [WarehouseInfoType, WarehouseOverviewKpiType, WarehouseOrderTypeRowType, WarehouseStockCategoryRowType, WarehouseZoneSummaryRowType, WarehouseActivityRowType]

builder.queryField('warehouseOverviewDashboard', (t) =>
  t.field({
    type: WarehouseOverviewDashboardType,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_root, args, ctx) => getWarehouseOverviewDashboardData(ctx.prisma, args.id),
  })
)
