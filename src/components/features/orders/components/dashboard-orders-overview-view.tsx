'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/orders/dashboard-orders-overview-view.md
 */

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import {
  DashboardDonutBreakdown,
  DashboardKpiCard,
  DashboardKpiGrid,
  DashboardPageShell
} from '@/components/primitives/dashboard'
import { DashboardSection } from '@/components/primitives/dashboard/dashboard-section'
import {
  WarehouseOverviewShellSection,
  WarehouseOverviewStatusPill,
  warehouseOverviewRechartsTooltipProps,
  warehouseOverviewToneStyles,
  type WarehouseOverviewTone
} from '@/components/primitives/warehouse-overview-primitives'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useOrdersDashboard } from '@/hooks/dashboard/orders/use-orders-dashboard'
import type { OrderAttentionCard, OrderSummaryRow, WarehouseWorkloadRow } from '@/types/orders-dashboard.types'
import { formatTs, humanizeEnum } from '@/utils/components/formatters/enums'

const ORDERS_OVERVIEW_TYPES = ['SALES', 'PURCHASE', 'TRANSFER'] as const
type OverviewOrderType = (typeof ORDERS_OVERVIEW_TYPES)[number]

const TYPE_SLUG: Record<OverviewOrderType, string> = {
  SALES: 'sales',
  PURCHASE: 'purchase',
  TRANSFER: 'transfer'
}

const DONUT_COLORS = ['#22c55e', '#3b82f6', '#a855f7']

type OrderStackDatum = {
  label: string
  relUnassigned: number
  assigned: number
  active: number
  paused: number
  completed: number
  exception: number
  other: number
}

function statusTone(status: string): WarehouseOverviewTone {
  if (status === 'EXECUTING') {
    return 'success'
  }
  if (status === 'PAUSED' || status === 'RELEASED') {
    return 'warning'
  }
  if (status === 'EXECUTED_WITH_PROBLEMS') {
    return 'danger'
  }

  return 'neutral'
}

function bucketKeyForOrder(row: OrderSummaryRow): keyof Omit<OrderStackDatum, 'label'> {
  const s = row.status

  if (s === 'RELEASED') {
    return row.assignedUserName ? 'assigned' : 'relUnassigned'
  }
  if (s === 'EXECUTING') {
    return 'active'
  }
  if (s === 'PAUSED') {
    return 'paused'
  }
  if (s === 'EXECUTED' || s === 'SIGNED_OFF') {
    return 'completed'
  }
  if (s === 'EXECUTED_WITH_PROBLEMS') {
    return 'exception'
  }

  return 'other'
}

function emptyStackCounts(): Omit<OrderStackDatum, 'label'> {
  return {
    relUnassigned: 0,
    assigned: 0,
    active: 0,
    paused: 0,
    completed: 0,
    exception: 0,
    other: 0
  }
}

function aggregateTypeStack(orders: OrderSummaryRow[], type: OverviewOrderType): OrderStackDatum {
  const counts = emptyStackCounts()

  for (const row of orders) {
    if (row.type !== type) {
      continue
    }

    const key = bucketKeyForOrder(row)
    counts[key] += 1
  }

  return {
    label: humanizeEnum(type),
    ...counts
  }
}

function AttentionCard({ card }: { card: OrderAttentionCard }) {
  const toneMap: Record<string, WarehouseOverviewTone> = {
    danger: 'danger',
    warning: 'warning',
    neutral: 'neutral'
  }
  const tone = toneMap[card.tone] ?? 'neutral'
  const color = warehouseOverviewToneStyles[tone].icon

  return (
    <Link
      href={card.href}
      className="block rounded-xl border p-4 transition-opacity hover:opacity-80"
      style={{
        background: 'var(--wh-card-bg-soft)',
        borderColor: color
      }}
    >
      <p className="truncate text-sm font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
        {card.orderLabel}
      </p>
      <p className="mt-0.5 text-xs" style={{ color: 'var(--wh-text-muted)' }}>
        {humanizeEnum(card.type)} · {card.reason}
      </p>
    </Link>
  )
}

function WarehouseWorkloadCard({ row }: { row: WarehouseWorkloadRow }) {
  return (
    <Link
      href={row.href}
      className="block"
      style={{ textDecoration: 'none' }}
    >
      <div
        className="rounded-lg border p-4 transition hover:border-opacity-100"
        style={{
          borderColor: 'var(--wh-border)',
          background: 'var(--wh-card-bg)'
        }}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
              {row.warehouseName}
            </div>
            <div className="mt-1 text-xs" style={{ color: 'var(--wh-text-muted)' }}>
              Workload snapshot
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-bold tabular-nums" style={{ color: 'var(--wh-text-primary)' }}>
              {row.active + row.released}
            </div>
            <div className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>
              Active + released
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <div className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>
              Active
            </div>
            <div className="text-sm font-semibold tabular-nums" style={{ color: 'var(--wh-status-available, #22c55e)' }}>
              {row.active.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>
              Released
            </div>
            <div className="text-sm font-semibold tabular-nums" style={{ color: 'var(--wh-status-full, #eab308)' }}>
              {row.released.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>
              Completed today
            </div>
            <div className="text-sm font-semibold tabular-nums">{row.completedToday.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>
              Exceptions
            </div>
            <div
              className="text-sm font-semibold tabular-nums"
              style={{
                color: row.exceptions > 0 ? 'var(--wh-status-blocked)' : 'var(--wh-text-secondary)'
              }}
            >
              {row.exceptions.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function OrderTypeCard({ order }: { order: OrderSummaryRow }) {
  return (
    <Link href={order.href} className="block transition-opacity hover:opacity-90">
      <div
        className="rounded-lg border p-4"
        style={{
          borderColor: 'var(--wh-border)',
          background: 'var(--wh-card-bg)'
        }}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
              {order.orderLabel}
            </div>
            <div className="mt-1 text-xs" style={{ color: 'var(--wh-text-muted)' }}>
              {order.warehouseName}
            </div>
          </div>
          <WarehouseOverviewStatusPill tone={statusTone(order.status)}>
            {humanizeEnum(order.status)}
          </WarehouseOverviewStatusPill>
        </div>

        <div
          className="mb-2 flex h-2 overflow-hidden rounded-full"
          style={{ background: 'var(--wh-card-bg-soft)' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, order.progressPercent)}%`,
              background: 'var(--wh-status-available)'
            }}
          />
        </div>
        <div className="flex justify-between text-xs" style={{ color: 'var(--wh-text-muted)' }}>
          <span>Progress</span>
          <span className="tabular-nums">{order.progressPercent}%</span>
        </div>
      </div>
    </Link>
  )
}

function OrdersTabPanel({
  type,
  orders,
  onShowAll
}: {
  type: OverviewOrderType
  orders: OrderSummaryRow[]
  onShowAll: () => void
}) {
  const visible = orders.slice(0, 4)
  const hiddenCount = Math.max(0, orders.length - visible.length)

  if (orders.length === 0) {
    return (
      <p className="py-4 text-sm" style={{ color: 'var(--wh-text-muted)' }}>
        No {humanizeEnum(type).toLowerCase()} in the current dashboard sample.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {visible.map((order) => (
          <OrderTypeCard key={order.orderId} order={order} />
        ))}
      </div>
      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={onShowAll}
          className="w-full rounded-lg border p-3 text-sm font-medium transition-opacity hover:opacity-90"
          style={{
            background: 'var(--wh-card-bg-soft)',
            borderColor: 'var(--wh-border)',
            color: 'var(--wh-text-primary)'
          }}
        >
          See more ({hiddenCount})
        </button>
      ) : null}
    </div>
  )
}

export function DashboardOrdersOverviewView() {
  const { data, isLoading, error, refetch } = useOrdersDashboard()
  const [ordersSheetType, setOrdersSheetType] = useState<OverviewOrderType | null>(null)

  const focusSlices = useMemo(() => {
    if (!data) {
      return []
    }

    return data.orderTypeDistribution.filter((slice) =>
      ORDERS_OVERVIEW_TYPES.includes(slice.type as OverviewOrderType)
    )
  }, [data])

  const donutTotal = useMemo(
    () => focusSlices.reduce((sum, slice) => sum + slice.count, 0),
    [focusSlices]
  )

  const donutRows = useMemo(() => {
    return focusSlices.map((slice, index) => ({
      id: `${slice.type}-${index}`,
      label: humanizeEnum(slice.type),
      value: slice.count,
      color: DONUT_COLORS[index % DONUT_COLORS.length]
    }))
  }, [focusSlices])

  const stackRows = useMemo((): OrderStackDatum[] => {
    if (!data) {
      return []
    }

    return ORDERS_OVERVIEW_TYPES.map((type) => aggregateTypeStack(data.orders, type))
  }, [data])

  const ordersByOverviewType = useMemo(() => {
    if (!data) {
      return {
        SALES: [] as OrderSummaryRow[],
        PURCHASE: [] as OrderSummaryRow[],
        TRANSFER: [] as OrderSummaryRow[]
      }
    }

    const map = {
      SALES: [] as OrderSummaryRow[],
      PURCHASE: [] as OrderSummaryRow[],
      TRANSFER: [] as OrderSummaryRow[]
    }

    for (const row of data.orders) {
      if (row.type === 'SALES') {
        map.SALES.push(row)
      } else if (row.type === 'PURCHASE') {
        map.PURCHASE.push(row)
      } else if (row.type === 'TRANSFER') {
        map.TRANSFER.push(row)
      }
    }

    return map
  }, [data])

  const sheetOrders = ordersSheetType ? ordersByOverviewType[ordersSheetType] : []

  if (isLoading) {
    return (
      <main className="min-h-screen p-4 xl:p-6" style={{ background: 'var(--wh-page-bg)' }}>
        <div className="mx-auto max-w-7xl space-y-8">
          <Skeleton className="h-10 w-64 rounded-xl bg-wh-card-bg-soft" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl bg-wh-card-bg-soft" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Skeleton className="h-80 rounded-2xl bg-wh-card-bg-soft" />
            <Skeleton className="h-80 rounded-2xl bg-wh-card-bg-soft" />
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Skeleton className="h-64 rounded-2xl bg-wh-card-bg-soft" />
            <Skeleton className="h-64 rounded-2xl bg-wh-card-bg-soft" />
          </div>
        </div>
      </main>
    )
  }

  if (error || !data) {
    return (
      <DashboardPageShell error={error ?? 'Could not load orders dashboard.'} onRetry={() => void refetch()} />
    )
  }

  const subtitle = (
    <>
      {data.header.subtitle} ·{' '}
      <span style={{ color: 'var(--wh-text-secondary)' }}>
        {donutTotal.toLocaleString()} orders (sales · purchase · transfer) in view
      </span>
    </>
  )

  return (
    <DashboardPageShell
      title={data.header.title}
      subtitle={subtitle}
      className="space-y-8 xl:space-y-10"
    >
      <DashboardKpiGrid>
        {ORDERS_OVERVIEW_TYPES.map((type) => {
          const slice = focusSlices.find((s) => s.type === type)
          const total = slice?.count ?? 0
          const subset = ordersByOverviewType[type]
          const active = subset.filter((o) => o.status === 'EXECUTING').length
          const released = subset.filter((o) => o.status === 'RELEASED').length
          const completed = subset.filter(
            (o) => o.status === 'EXECUTED' || o.status === 'SIGNED_OFF'
          ).length

          return (
            <DashboardKpiCard
              key={type}
              href={`/dashboard/orders/${TYPE_SLUG[type]}`}
              label={`${humanizeEnum(type)} orders`}
              value={total.toLocaleString()}
              description="In dashboard sample"
              metrics={[
                { label: 'active', value: active.toLocaleString(), tone: 'available' },
                { label: 'released', value: released.toLocaleString(), tone: 'reserved' },
                { label: 'done', value: completed.toLocaleString(), tone: 'available' }
              ]}
            />
          )
        })}
      </DashboardKpiGrid>

      {data.attention.length > 0 ? (
        <WarehouseOverviewShellSection title="Needs Attention">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.attention.map((card) => (
              <AttentionCard key={card.orderId} card={card} />
            ))}
          </div>
        </WarehouseOverviewShellSection>
      ) : null}

      {focusSlices.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
          <DashboardSection title="Orders by type" action={`${donutTotal.toLocaleString()} orders total`}>
            <DashboardDonutBreakdown
              rows={donutRows}
              total={donutTotal}
              totalLabel="Orders in scope"
              valueLabel="orders"
            />
          </DashboardSection>

          <DashboardSection title="Status by order type" action="Stacked counts">
            <div
              className="rounded-2xl p-3 xl:p-4"
              style={{
                background: 'var(--wh-card-bg)',
                boxShadow: '0 8px 22px rgba(0,0,0,0.24)',
                border: '1px solid var(--wh-border)'
              }}
            >
              <div className="h-[300px] w-full min-w-0 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stackRows}
                    layout="vertical"
                    margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
                  >
                    <XAxis
                      type="number"
                      stroke="var(--wh-text-muted)"
                      tick={{ fill: 'var(--wh-text-muted)', fontSize: 11 }}
                      axisLine={{ stroke: 'var(--wh-border)' }}
                    />
                    <YAxis
                      dataKey="label"
                      type="category"
                      width={100}
                      stroke="var(--wh-text-muted)"
                      tick={{ fill: 'var(--wh-text-primary)', fontSize: 11 }}
                      axisLine={{ stroke: 'var(--wh-border)' }}
                    />
                    <Tooltip {...warehouseOverviewRechartsTooltipProps} />
                    <Legend
                      wrapperStyle={{ color: 'var(--wh-text-secondary)', fontSize: 11, paddingTop: 8 }}
                    />
                    <Bar dataKey="relUnassigned" name="Released (unassigned)" stackId="a" fill="#64748b" />
                    <Bar dataKey="assigned" name="Assigned" stackId="a" fill="#0284c7" />
                    <Bar dataKey="active" name="Active" stackId="a" fill="#22c55e" />
                    <Bar dataKey="paused" name="Paused" stackId="a" fill="#eab308" />
                    <Bar dataKey="completed" name="Completed" stackId="a" fill="#10b981" />
                    <Bar dataKey="exception" name="Exception" stackId="a" fill="#ef4444" />
                    <Bar dataKey="other" name="Other" stackId="a" fill="#6b7280" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </DashboardSection>
        </div>
      ) : (
        <DashboardSection title="Orders by type">
          <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
            No sales, purchase, or transfer orders in the current sample.
          </p>
        </DashboardSection>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
        <DashboardSection
          title="Warehouse workload"
          action={`${data.warehouseWorkload.length} warehouses`}
        >
          {data.warehouseWorkload.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
              No warehouse workload rows.
            </p>
          ) : (
            <div className="space-y-2">
              {data.warehouseWorkload.map((row) => (
                <WarehouseWorkloadCard key={row.warehouseId} row={row} />
              ))}
            </div>
          )}
        </DashboardSection>

        <DashboardSection title="Recent orders by type" action="Sample from dashboard API">
          <Tabs defaultValue="sales">
            <TabsList className="mb-4 w-full justify-start sm:w-auto" variant="line">
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="purchase">Purchase</TabsTrigger>
              <TabsTrigger value="transfer">Transfer</TabsTrigger>
            </TabsList>
            <TabsContent value="sales" className="mt-0">
              <OrdersTabPanel
                type="SALES"
                orders={ordersByOverviewType.SALES}
                onShowAll={() => setOrdersSheetType('SALES')}
              />
            </TabsContent>
            <TabsContent value="purchase" className="mt-0">
              <OrdersTabPanel
                type="PURCHASE"
                orders={ordersByOverviewType.PURCHASE}
                onShowAll={() => setOrdersSheetType('PURCHASE')}
              />
            </TabsContent>
            <TabsContent value="transfer" className="mt-0">
              <OrdersTabPanel
                type="TRANSFER"
                orders={ordersByOverviewType.TRANSFER}
                onShowAll={() => setOrdersSheetType('TRANSFER')}
              />
            </TabsContent>
          </Tabs>
        </DashboardSection>
      </div>

      <Sheet open={ordersSheetType !== null} onOpenChange={(open) => !open && setOrdersSheetType(null)}>
        <SheetContent className="flex w-full max-w-lg flex-col sm:max-w-xl">
          <SheetHeader className="text-left">
            <SheetTitle>
              {ordersSheetType ? `${humanizeEnum(ordersSheetType)} orders` : 'Orders'}
            </SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {sheetOrders.map((order) => (
              <Link
                key={order.orderId}
                href={order.href}
                className="block rounded-lg border p-3 text-sm transition-opacity hover:opacity-90"
                style={{
                  borderColor: 'var(--wh-border)',
                  background: 'var(--wh-card-bg-soft)'
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium" style={{ color: 'var(--wh-text-primary)' }}>
                      {order.orderLabel}
                    </div>
                    <div className="mt-1 text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                      {order.warehouseName}
                      {order.startedAt ? ` · started ${formatTs(order.startedAt)}` : ''}
                    </div>
                  </div>
                  <WarehouseOverviewStatusPill tone={statusTone(order.status)}>
                    {humanizeEnum(order.status)}
                  </WarehouseOverviewStatusPill>
                </div>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </DashboardPageShell>
  )
}
