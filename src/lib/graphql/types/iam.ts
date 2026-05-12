import type {
  DeviceRow,
  DevicesDashboardDTO,
  DeviceStatusTab,
  TrolleySummaryRow,
} from '@/types/devices-dashboard.types'
import type {
  UsersDashboardDTO,
  UserSummaryRow,
  WarehouseUserSummaryRow,
} from '@/types/users-dashboard.types'
import { getDevicesDashboardData } from '@/lib/pages/dashboard/get-devices-dashboard-data'
import { getUsersDashboardData } from '@/lib/pages/dashboard/get-users-dashboard-data'

import { builder } from '../schema'
import { DashboardHeaderType, DashboardKpiType } from './shared'

// ─── Devices ─────────────────────────────────────────────────────────────────

const DeviceStatusTabType = builder
  .objectRef<DeviceStatusTab>('DeviceStatusTab')
  .implement({
    fields: (t) => ({
      key: t.exposeString('key'),
      label: t.exposeString('label'),
      count: t.exposeInt('count'),
    }),
  })

const DeviceRowType = builder.objectRef<DeviceRow>('DeviceRow').implement({
  fields: (t) => ({
    deviceId: t.exposeString('deviceId'),
    code: t.exposeString('code'),
    label: t.exposeString('label'),
    warehouseId: t.exposeString('warehouseId', { nullable: true }),
    warehouseName: t.exposeString('warehouseName', { nullable: true }),
    userId: t.exposeString('userId', { nullable: true }),
    userName: t.exposeString('userName', { nullable: true }),
    onlineStatus: t.exposeString('onlineStatus'),
    authorizationStatus: t.exposeString('authorizationStatus'),
    lastSeenAt: t.exposeString('lastSeenAt', { nullable: true }),
    currentOrderLabel: t.exposeString('currentOrderLabel', { nullable: true }),
    href: t.exposeString('href'),
  }),
})

const TrolleySummaryRowType = builder
  .objectRef<TrolleySummaryRow>('TrolleySummaryRow')
  .implement({
    fields: (t) => ({
      trolleyId: t.exposeString('trolleyId'),
      code: t.exposeString('code'),
      deviceCode: t.exposeString('deviceCode', { nullable: true }),
      userName: t.exposeString('userName', { nullable: true }),
      warehouseName: t.exposeString('warehouseName'),
      itemCount: t.exposeInt('itemCount'),
      linkedOrdersCount: t.exposeInt('linkedOrdersCount'),
      href: t.exposeString('href'),
    }),
  })

const DevicesDashboardType = builder
  .objectRef<DevicesDashboardDTO>('DevicesDashboard')
  .implement({
    fields: (t) => ({
      header: t.field({ type: DashboardHeaderType, resolve: (d) => d.header }),
      kpis: t.field({ type: [DashboardKpiType], resolve: (d) => d.kpis }),
      tabs: t.field({ type: [DeviceStatusTabType], resolve: (d) => d.tabs }),
      devices: t.field({ type: [DeviceRowType], resolve: (d) => d.devices }),
      trolleys: t.field({ type: [TrolleySummaryRowType], resolve: (d) => d.trolleys }),
    }),
  })

// ─── Users ───────────────────────────────────────────────────────────────────

const WarehouseUserSummaryRowType = builder
  .objectRef<WarehouseUserSummaryRow>('WarehouseUserSummaryRow')
  .implement({
    fields: (t) => ({
      warehouseId: t.exposeString('warehouseId'),
      warehouseName: t.exposeString('warehouseName'),
      activeUsers: t.exposeInt('activeUsers'),
      idleUsers: t.exposeInt('idleUsers'),
      totalUsers: t.exposeInt('totalUsers'),
      activeOrders: t.exposeInt('activeOrders'),
      averageOrdersPerUser: t.exposeFloat('averageOrdersPerUser'),
      href: t.exposeString('href'),
    }),
  })

const UserSummaryRowType = builder.objectRef<UserSummaryRow>('UserSummaryRow').implement({
  fields: (t) => ({
    userId: t.exposeString('userId'),
    name: t.exposeString('name'),
    role: t.exposeString('role'),
    warehouseId: t.exposeString('warehouseId', { nullable: true }),
    warehouseName: t.exposeString('warehouseName', { nullable: true }),
    status: t.exposeString('status'),
    activeOrderLabel: t.exposeString('activeOrderLabel', { nullable: true }),
    deviceCode: t.exposeString('deviceCode', { nullable: true }),
    lastActivityAt: t.exposeString('lastActivityAt', { nullable: true }),
    href: t.exposeString('href'),
  }),
})

const UsersDashboardType = builder.objectRef<UsersDashboardDTO>('UsersDashboard').implement({
  fields: (t) => ({
    header: t.field({ type: DashboardHeaderType, resolve: (d) => d.header }),
    kpis: t.field({ type: [DashboardKpiType], resolve: (d) => d.kpis }),
    warehouseSummaries: t.field({
      type: [WarehouseUserSummaryRowType],
      resolve: (d) => d.warehouseSummaries,
    }),
    users: t.field({ type: [UserSummaryRowType], resolve: (d) => d.users }),
  }),
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _unused = [DeviceStatusTabType, DeviceRowType, TrolleySummaryRowType, WarehouseUserSummaryRowType, UserSummaryRowType]

// ─── Query fields ─────────────────────────────────────────────────────────────

builder.queryField('devicesDashboard', (t) =>
  t.field({
    type: DevicesDashboardType,
    resolve: (_root, _args, ctx) => getDevicesDashboardData(ctx.prisma),
  })
)

builder.queryField('usersDashboard', (t) =>
  t.field({
    type: UsersDashboardType,
    args: {
      warehouseId: t.arg.string({ required: false }),
    },
    resolve: (_root, args, ctx) =>
      getUsersDashboardData(ctx.prisma, args.warehouseId ?? undefined),
  })
)
