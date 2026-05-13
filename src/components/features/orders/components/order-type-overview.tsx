'use client'

import { useId, useMemo, useState } from 'react'
import Link from 'next/link'
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { CreatePurchaseOrderModal } from '@/components/features/orders/components/create-purchase-order-modal'
import {
  DashboardDonutBreakdown,
  DashboardPageShell,
  DashboardSection
} from '@/components/primitives/dashboard'
import {
  WarehouseOverviewStatusPill,
  warehouseOverviewRechartsTooltipProps,
  warehouseOverviewToneStyles,
  type WarehouseOverviewTone
} from '@/components/primitives/warehouse-overview-primitives'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { OrderStatus } from '@/generated/prisma'
import type { OrderTypeDashboardPayload } from '@/lib/pages/dashboard/get-order-type-dashboard-data'
import type {
  OrderTypeOverviewActivityItem,
  OrderTypeOverviewOrderCard
} from '@/types/order-type-dashboard.types'
import { formatTs, humanizeEnum } from '@/utils/components/formatters/enums'

const ORDERS_AND_ACTIVITIES_PREVIEW_LIMIT = 4

const ALL_ORDER_STATUSES = 'all'

type PurchaseListActions = {
  existingOrderCount: number
  onPurchaseCreated: () => Promise<void>
}

type OrderCardsFilterBarProps = {
  idPrefix: string
  statusSelectAriaLabel: string
  statusFilter: string
  onStatusChange: (value: string) => void
  sortByCompletionPercent: boolean
  onSortByCompletionPercentChange: (checked: boolean) => void
}

function OrderCardsFilterBar({
  idPrefix,
  statusSelectAriaLabel,
  statusFilter,
  onStatusChange,
  sortByCompletionPercent,
  onSortByCompletionPercentChange
}: OrderCardsFilterBarProps) {
  const sortCheckboxId = `${idPrefix}-sort-completion`

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger
          size="sm"
          id={`${idPrefix}-status`}
          aria-label={statusSelectAriaLabel}
          className="w-full min-w-[200px] sm:w-[240px]"
          style={{
            borderColor: 'var(--wh-border)',
            background: 'var(--wh-card-bg)',
            color: 'var(--wh-text-primary)'
          }}
        >
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_ORDER_STATUSES}>All statuses</SelectItem>
          {ORDER_STATUS_SEQUENCE.map((st) => (
            <SelectItem key={st} value={st}>
              {humanizeEnum(st)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center gap-2">
        <Checkbox
          id={sortCheckboxId}
          checked={sortByCompletionPercent}
          onCheckedChange={(checked) => onSortByCompletionPercentChange(checked === true)}
        />
        <Label
          htmlFor={sortCheckboxId}
          className="cursor-pointer text-sm font-normal"
          style={{ color: 'var(--wh-text-secondary)' }}
        >
          Sort by completion %
        </Label>
      </div>
    </div>
  )
}

const ORDER_TYPE_SHEET_CONTENT_CLASS =
  'flex h-full max-h-[100dvh] w-full flex-col gap-0 overflow-hidden border-wh-border bg-wh-page-bg p-0 text-wh-text-primary sm:max-w-2xl'

const DONUT_PALETTE = [
  '#22c55e',
  '#3b82f6',
  '#a855f7',
  '#f97316',
  '#eab308',
  '#ec4899',
  '#06b6d4',
  '#64748b',
  '#ef4444'
]

const STATUS_BAR_FILL: Record<string, string> = {
  DRAFT: '#94a3b8',
  CONFIRMED: '#6366f1',
  RELEASED: '#0284c7',
  EXECUTING: '#22c55e',
  PAUSED: '#eab308',
  EXECUTED: '#10b981',
  EXECUTED_WITH_PROBLEMS: '#ef4444',
  SIGNED_OFF: '#0d9488',
  CANCELLED: '#71717a'
}

const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  OrderStatus.DRAFT,
  OrderStatus.CONFIRMED,
  OrderStatus.RELEASED,
  OrderStatus.EXECUTING,
  OrderStatus.PAUSED,
  OrderStatus.EXECUTED,
  OrderStatus.EXECUTED_WITH_PROBLEMS,
  OrderStatus.SIGNED_OFF,
  OrderStatus.CANCELLED
]

function statusPillTone(status: string): WarehouseOverviewTone {
  if (status === OrderStatus.EXECUTING) {
    return 'success'
  }
  if (status === OrderStatus.PAUSED || status === OrderStatus.RELEASED) {
    return 'warning'
  }
  if (status === OrderStatus.EXECUTED_WITH_PROBLEMS) {
    return 'danger'
  }

  return 'neutral'
}

function OrderTypePreviewOrderCard({ order }: { order: OrderTypeOverviewOrderCard }) {
  return (
    <Link href={order.href} className="block transition-opacity hover:opacity-90">
      <div
        className="rounded-lg border p-4"
        style={{
          borderColor: 'var(--wh-border)',
          background: 'var(--wh-card-bg)'
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
              {order.orderLabel}
            </div>
            <div className="mt-1 text-xs" style={{ color: 'var(--wh-text-muted)' }}>
              {order.warehouseName} · {formatTs(order.createdAt)}
            </div>
          </div>
          <WarehouseOverviewStatusPill tone={statusPillTone(order.status)}>
            {humanizeEnum(order.status)}
          </WarehouseOverviewStatusPill>
        </div>
        <div className="mt-3 flex h-2 overflow-hidden rounded-full" style={{ background: 'var(--wh-card-bg-soft)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, order.progressPercent)}%`,
              background: 'var(--wh-status-available)'
            }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs" style={{ color: 'var(--wh-text-muted)' }}>
          <span>Progress</span>
          <span className="tabular-nums">{order.progressPercent}%</span>
        </div>
      </div>
    </Link>
  )
}

function OrderTypePreviewActivityRow({ row }: { row: OrderTypeOverviewActivityItem }) {
  return (
    <li
      className="rounded-lg border p-3 text-sm"
      style={{
        borderColor: 'var(--wh-border)',
        background: 'var(--wh-card-bg-soft)'
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href={row.href}
          className="font-medium hover:underline"
          style={{ color: 'var(--wh-text-primary)' }}
        >
          {row.orderLabel}
        </Link>
        <span className="text-xs tabular-nums" style={{ color: 'var(--wh-text-muted)' }}>
          {formatTs(row.createdAt)}
        </span>
      </div>
      <div className="mt-1 text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
        {humanizeEnum(row.activityType)} · {row.userName}
      </div>
    </li>
  )
}

type OrderTypeOverviewProps = {
  data: OrderTypeDashboardPayload
  purchaseListActions?: PurchaseListActions
}

export function OrderTypeOverview({ data, purchaseListActions }: OrderTypeOverviewProps) {
  const filterDomId = useId()
  const [ordersSheetOpen, setOrdersSheetOpen] = useState(false)
  const [activitiesSheetOpen, setActivitiesSheetOpen] = useState(false)
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>(ALL_ORDER_STATUSES)
  const [sortOrdersByCompletionPercent, setSortOrdersByCompletionPercent] = useState(false)

  const filteredAndSortedOrders = useMemo(() => {
    let list =
      orderStatusFilter === ALL_ORDER_STATUSES
        ? data.orders.slice()
        : data.orders.filter((order) => order.status === orderStatusFilter)

    if (sortOrdersByCompletionPercent) {
      list = [...list].sort((a, b) => b.progressPercent - a.progressPercent)
    }

    return list
  }, [data.orders, orderStatusFilter, sortOrdersByCompletionPercent])

  const previewOrders = filteredAndSortedOrders.slice(0, ORDERS_AND_ACTIVITIES_PREVIEW_LIMIT)
  const previewActivities = data.activities.slice(0, ORDERS_AND_ACTIVITIES_PREVIEW_LIMIT)
  const ordersHiddenCount = Math.max(0, filteredAndSortedOrders.length - previewOrders.length)
  const activitiesHiddenCount = Math.max(0, data.activities.length - previewActivities.length)

  const donutTotal = useMemo(
    () => data.statusDonut.reduce((sum, row) => sum + row.count, 0),
    [data.statusDonut]
  )

  const donutRows = useMemo(() => {
    return data.statusDonut.map((row, index) => ({
      id: `${row.status}-${index}`,
      label: humanizeEnum(row.status),
      value: row.count,
      color: DONUT_PALETTE[index % DONUT_PALETTE.length]
    }))
  }, [data.statusDonut])

  const warehouseBarData = useMemo(() => {
    return data.warehouseBars.map((w) => ({
      label: w.warehouseName,
      ...w.byStatus
    }))
  }, [data.warehouseBars])

  const filteredOrdersTotal = filteredAndSortedOrders.length
  const datasetOrdersTotal = data.orders.length
  const ordersCountLabel = (
    <>
      {filteredOrdersTotal.toLocaleString()}{' '}
      {filteredOrdersTotal === 1 ? 'order' : 'orders'}
      {filteredOrdersTotal !== datasetOrdersTotal ? (
        <>
          {' '}
          <span style={{ color: 'var(--wh-text-muted)' }}>
            ({datasetOrdersTotal.toLocaleString()} total)
          </span>
        </>
      ) : null}
    </>
  )

  const subtitle = (
    <>
      Workload and execution snapshot ·{' '}
      <span style={{ color: 'var(--wh-text-secondary)' }}>
        {data.kpis.totalOrders.toLocaleString()} orders across{' '}
        {data.kpis.warehousesWithOrders.toLocaleString()} warehouses
      </span>
    </>
  )

  return (
    <DashboardPageShell title={data.title} subtitle={subtitle} className="space-y-8 xl:space-y-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card
          className="border"
          style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }}
        >
          <CardContent className="p-5">
            <div className="text-xs font-medium" style={{ color: 'var(--wh-text-muted)' }}>
              Total orders
            </div>
            <div className="mt-1 text-3xl font-bold tabular-nums" style={{ color: 'var(--wh-text-primary)' }}>
              {data.kpis.totalOrders.toLocaleString()}
            </div>
            <p className="mt-2 text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
              All non-deleted records for this order category
            </p>
          </CardContent>
        </Card>

        <Card
          className="border"
          style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }}
        >
          <CardContent className="p-5">
            <div className="text-xs font-medium" style={{ color: 'var(--wh-text-muted)' }}>
              Warehouses with orders
            </div>
            <div className="mt-1 text-3xl font-bold tabular-nums" style={{ color: 'var(--wh-text-primary)' }}>
              {data.kpis.warehousesWithOrders.toLocaleString()}
            </div>
            <p className="mt-2 text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
              Distinct warehouses in this order population
            </p>
          </CardContent>
        </Card>

        <Card
          className="border"
          style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }}
        >
          <CardContent className="p-5">
            <div className="text-xs font-medium" style={{ color: 'var(--wh-text-muted)' }}>
              Average progress
            </div>
            <div
              className="mt-1 text-3xl font-bold tabular-nums"
              style={{ color: warehouseOverviewToneStyles.success.icon }}
            >
              {data.kpis.aggregateProgressPercent}%
            </div>
            <p className="mt-2 text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
              Mean line / completion progress across orders
            </p>
          </CardContent>
        </Card>
      </div>

      {donutRows.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
          <DashboardSection title="Order statuses" action={`${donutTotal.toLocaleString()} orders`}>
            <DashboardDonutBreakdown
              rows={donutRows}
              total={donutTotal}
              totalLabel="Orders"
              valueLabel="orders"
            />
          </DashboardSection>

          <DashboardSection title="Warehouses by status" action="Stacked counts">
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
                    data={warehouseBarData}
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
                      width={128}
                      stroke="var(--wh-text-muted)"
                      tick={{ fill: 'var(--wh-text-primary)', fontSize: 11 }}
                      axisLine={{ stroke: 'var(--wh-border)' }}
                    />
                    <Tooltip {...warehouseOverviewRechartsTooltipProps} />
                    <Legend
                      wrapperStyle={{ color: 'var(--wh-text-secondary)', fontSize: 11, paddingTop: 8 }}
                    />
                    {ORDER_STATUS_SEQUENCE.map((st) => (
                      <Bar
                        key={`wh-status:${st}`}
                        dataKey={st}
                        name={humanizeEnum(st)}
                        stackId="a"
                        fill={STATUS_BAR_FILL[st] ?? '#6b7280'}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </DashboardSection>
        </div>
      ) : (
        <DashboardSection title="Order statuses">
          <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
            No orders found for this type.
          </p>
        </DashboardSection>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
        <DashboardSection
          title="Orders"
          action={
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="text-[11px] xl:text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                {ordersCountLabel}
              </span>
              {purchaseListActions ? (
                <CreatePurchaseOrderModal
                  orderType="purchase"
                  existingOrderCount={purchaseListActions.existingOrderCount}
                  onCreated={purchaseListActions.onPurchaseCreated}
                />
              ) : null}
              {ordersHiddenCount > 0 ? (
                <Button type="button" variant="secondary" size="sm" onClick={() => setOrdersSheetOpen(true)}>
                  Show all
                </Button>
              ) : null}
            </div>
          }
        >
          {datasetOrdersTotal === 0 ? (
            <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
              No orders to display.
            </p>
          ) : filteredOrdersTotal === 0 ? (
            <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
              No orders match the selected status.
            </p>
          ) : (
            <div className="space-y-3">
              <OrderCardsFilterBar
                idPrefix={`${filterDomId}-main`}
                statusSelectAriaLabel="Order status filter (overview)"
                statusFilter={orderStatusFilter}
                onStatusChange={setOrderStatusFilter}
                sortByCompletionPercent={sortOrdersByCompletionPercent}
                onSortByCompletionPercentChange={setSortOrdersByCompletionPercent}
              />
              {previewOrders.map((order) => (
                <OrderTypePreviewOrderCard key={order.orderId} order={order} />
              ))}
            </div>
          )}
        </DashboardSection>

        <DashboardSection
          title="Recent assignments"
          action={
            <div className="flex items-center gap-2">
              <span className="text-[11px] xl:text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                {data.activities.length.toLocaleString()}{' '}
                {data.activities.length === 1 ? 'assignment' : 'assignments'}
              </span>
              {activitiesHiddenCount > 0 ? (
                <Button type="button" variant="secondary" size="sm" onClick={() => setActivitiesSheetOpen(true)}>
                  Show all
                </Button>
              ) : null}
            </div>
          }
        >
          {data.activities.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
              No order assignments for these orders yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {previewActivities.map((row) => (
                <OrderTypePreviewActivityRow key={row.id} row={row} />
              ))}
            </ul>
          )}
        </DashboardSection>
      </div>

      <Sheet open={ordersSheetOpen} onOpenChange={setOrdersSheetOpen}>
        <SheetContent side="right" showCloseButton className={ORDER_TYPE_SHEET_CONTENT_CLASS}>
          <SheetHeader className="border-b border-wh-border px-4 py-4 text-left">
            <SheetTitle className="text-wh-text-primary">All orders</SheetTitle>
            <SheetDescription className="text-wh-text-muted">
              {data.title} · {ordersCountLabel}
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {datasetOrdersTotal === 0 ? (
              <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
                No orders to display.
              </p>
            ) : (
              <div className="space-y-3">
                <OrderCardsFilterBar
                  idPrefix={`${filterDomId}-sheet`}
                  statusSelectAriaLabel="Order status filter (all orders)"
                  statusFilter={orderStatusFilter}
                  onStatusChange={setOrderStatusFilter}
                  sortByCompletionPercent={sortOrdersByCompletionPercent}
                  onSortByCompletionPercentChange={setSortOrdersByCompletionPercent}
                />
                {filteredOrdersTotal === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
                    No orders match the selected status.
                  </p>
                ) : (
                  filteredAndSortedOrders.map((order) => (
                    <OrderTypePreviewOrderCard key={`sheet-${order.orderId}`} order={order} />
                  ))
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={activitiesSheetOpen} onOpenChange={setActivitiesSheetOpen}>
        <SheetContent side="right" showCloseButton className={ORDER_TYPE_SHEET_CONTENT_CLASS}>
          <SheetHeader className="border-b border-wh-border px-4 py-4 text-left">
            <SheetTitle className="text-wh-text-primary">All assignments</SheetTitle>
            <SheetDescription className="text-wh-text-muted">
              {data.title} · {data.activities.length.toLocaleString()}{' '}
              {data.activities.length === 1 ? 'assignment' : 'assignments'}
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <ul className="space-y-3">
              {data.activities.map((row) => (
                <OrderTypePreviewActivityRow key={`sheet-${row.id}`} row={row} />
              ))}
            </ul>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardPageShell>
  )
}
