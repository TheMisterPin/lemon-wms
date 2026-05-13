import type {
  OrderAttentionCard,
  OrdersDashboardDTO,
  OrderStatusBreakdown,
  OrderSummaryRow,
  OrderTypeSlice,
  WarehouseWorkloadRow,
} from '@/types/orders-dashboard.types'
import { getOrdersDashboardData } from '@/lib/pages/dashboard/get-orders-dashboard-data'

import { builder } from '../schema'
import { DashboardHeaderType, DashboardKpiType } from './_base'

const OrderTypeSliceType = builder.objectRef<OrderTypeSlice>('OrderTypeSlice').implement({
  fields: (t) => ({
    type: t.exposeString('type'),
    count: t.exposeInt('count'),
    href: t.exposeString('href'),
  }),
})

const OrderStatusBreakdownType = builder
  .objectRef<OrderStatusBreakdown>('OrderStatusBreakdown')
  .implement({
    fields: (t) => ({
      label: t.exposeString('label'),
      released: t.exposeInt('released'),
      assigned: t.exposeInt('assigned'),
      active: t.exposeInt('active'),
      paused: t.exposeInt('paused'),
      completed: t.exposeInt('completed'),
      exception: t.exposeInt('exception'),
    }),
  })

const WarehouseWorkloadRowType = builder
  .objectRef<WarehouseWorkloadRow>('WarehouseWorkloadRow')
  .implement({
    fields: (t) => ({
      warehouseId: t.exposeString('warehouseId'),
      warehouseName: t.exposeString('warehouseName'),
      active: t.exposeInt('active'),
      released: t.exposeInt('released'),
      completedToday: t.exposeInt('completedToday'),
      exceptions: t.exposeInt('exceptions'),
      href: t.exposeString('href'),
    }),
  })

const OrderAttentionCardType = builder
  .objectRef<OrderAttentionCard>('OrderAttentionCard')
  .implement({
    fields: (t) => ({
      orderId: t.exposeString('orderId'),
      orderLabel: t.exposeString('orderLabel'),
      type: t.exposeString('type'),
      reason: t.exposeString('reason'),
      tone: t.exposeString('tone'),
      href: t.exposeString('href'),
    }),
  })

const OrderSummaryRowType = builder.objectRef<OrderSummaryRow>('OrderSummaryRow').implement({
  fields: (t) => ({
    orderId: t.exposeString('orderId'),
    orderLabel: t.exposeString('orderLabel'),
    type: t.exposeString('type'),
    warehouseId: t.exposeString('warehouseId'),
    warehouseName: t.exposeString('warehouseName'),
    status: t.exposeString('status'),
    progressPercent: t.exposeFloat('progressPercent'),
    assignedUserName: t.exposeString('assignedUserName', { nullable: true }),
    startedAt: t.exposeString('startedAt', { nullable: true }),
    lastActivityAt: t.exposeString('lastActivityAt', { nullable: true }),
    href: t.exposeString('href'),
  }),
})

const OrdersDashboardType = builder.objectRef<OrdersDashboardDTO>('OrdersDashboard').implement({
  fields: (t) => ({
    header: t.field({ type: DashboardHeaderType, resolve: (d) => d.header }),
    kpis: t.field({ type: [DashboardKpiType], resolve: (d) => d.kpis }),
    orderTypeDistribution: t.field({
      type: [OrderTypeSliceType],
      resolve: (d) => d.orderTypeDistribution,
    }),
    statusBreakdown: t.field({
      type: [OrderStatusBreakdownType],
      resolve: (d) => d.statusBreakdown,
    }),
    warehouseWorkload: t.field({
      type: [WarehouseWorkloadRowType],
      resolve: (d) => d.warehouseWorkload,
    }),
    attention: t.field({ type: [OrderAttentionCardType], resolve: (d) => d.attention }),
    orders: t.field({ type: [OrderSummaryRowType], resolve: (d) => d.orders }),
  }),
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _unused = [OrderTypeSliceType, OrderStatusBreakdownType, WarehouseWorkloadRowType, OrderAttentionCardType, OrderSummaryRowType]

builder.queryField('ordersDashboard', (t) =>
  t.field({
    type: OrdersDashboardType,
    resolve: (_root, _args, ctx) => getOrdersDashboardData(ctx.prisma),
  })
)
