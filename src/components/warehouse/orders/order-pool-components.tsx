'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'

import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  PackageCheck,
  Pause,
  Play,
  SlidersHorizontal,
  Warehouse
} from 'lucide-react'

import {
  WarehouseOverviewShellSection,
  WarehouseOverviewStatusPill,
  type WarehouseOverviewTone
} from '@/components/primitives/warehouse-overview-primitives'
import { PaginationSelector } from '@/components/shared/pagination-selector'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { OrderPoolSearch } from '@/components/warehouse/orders/order-pool-search'
import type { WarehouseOrderRecord } from '@/components/warehouse/orders/types'
import {
  ORDER_POOL_STATUSES,
  ORDER_POOL_TYPES,
  type OrderPoolCompletionSort,
  type OrderPoolSortBaseline
} from '@/components/warehouse/orders/use-warehouse-order-pool'
import { cn } from '@/lib/utils'

export function statusTone(status: string): WarehouseOverviewTone {
  if (status === 'EXECUTING') {
    return 'success'
  }

  if (status === 'PAUSED') {
    return 'warning'
  }

  return 'neutral'
}

export function typeLabel(type: WarehouseOrderRecord['type']): string {
  if (type === 'PURCHASE') {
    return 'Purchase'
  }
  if (type === 'SALES') {
    return 'Sales'
  }

  return 'Transfer'
}

export function humanizeOrderStatus(status: WarehouseOrderRecord['status']): string {
  return `${status.charAt(0)}${status.slice(1).toLowerCase()}`
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return 'No activity yet'
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

export function warehousePoolOrderHref(order: WarehouseOrderRecord): string {
  if (order.type === 'PURCHASE') {
    return '/warehouse/orders/purchase'
  }
  if (order.type === 'SALES') {
    return '/warehouse/orders/sales'
  }

  return '/warehouse/orders/transfer'
}

function OrderProgress({ value }: { value: number }) {
  const progress = Math.max(0, Math.min(100, value))

  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--wh-card-bg)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${progress}%`,
            background: progress >= 100
              ? 'var(--wh-status-available)'
              : progress > 0
                ? 'var(--wh-status-full)'
                : 'var(--wh-border)'
          }}
        />
      </div>
      <span className="w-10 text-right text-sm font-semibold tabular-nums">{progress}%</span>
    </div>
  )
}

function actionConfig(order: WarehouseOrderRecord, currentUserId: string | null) {
  const isCurrentUserOrder = order.assignedUserId === currentUserId

  if (order.status === 'EXECUTING') {
    return {
      label: 'Pause',
      Icon: Pause,
      enabled: isCurrentUserOrder,
      tone: 'pause' as const
    }
  }
  if (order.status === 'PAUSED') {
    return {
      label: 'Resume',
      Icon: Play,
      enabled: true,
      tone: 'resume' as const
    }
  }
  if (order.status === 'RELEASED') {
    return {
      label: 'Start',
      Icon: Play,
      enabled: true,
      tone: 'start' as const
    }
  }

  return null
}

function actionButtonStyle(config: NonNullable<ReturnType<typeof actionConfig>>) {
  if (!config.enabled) {
    return {
      background: 'transparent',
      borderColor: 'rgba(148, 163, 184, 0.14)',
      color: 'rgba(100, 116, 139, 0.55)'
    }
  }

  if (config.tone === 'pause') {
    return {
      background: 'transparent',
      borderColor: 'color-mix(in srgb, var(--wh-status-full) 55%, transparent)',
      color: 'var(--wh-status-full)'
    }
  }

  return {
    background: 'transparent',
    borderColor: 'color-mix(in srgb, var(--wh-status-available) 55%, transparent)',
    color: 'var(--wh-status-available)'
  }
}

export function WarehouseOrderPoolHeader({ warehouseName }: { warehouseName: string }) {
  return (
    <header className="flex shrink-0 items-center gap-3">
      <div
        className="flex size-11 shrink-0 items-center justify-center rounded-xl border"
        style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)', color: 'var(--wh-status-available)' }}
      >
        <Warehouse className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>Warehouse</p>
        <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
          {warehouseName || 'Warehouse unavailable'}
        </h1>
      </div>
    </header>
  )
}

export function WarehouseOrderPoolKpis({
  activeExecutingOrder,
  activeOrders,
  lastUserOrder,
  nextReadyOrder,
  pausedOrders,
  readyOrders,
  totalOrders,
  onStatusClick,
  onStartOrder,
  onPauseActive
}: {
  activeExecutingOrder: WarehouseOrderRecord | null
  activeOrders: number
  lastUserOrder: WarehouseOrderRecord | null
  nextReadyOrder: WarehouseOrderRecord | null
  pausedOrders: number
  readyOrders: number
  totalOrders: number
  onStatusClick: (status: WarehouseOrderRecord['status']) => void
  onStartOrder: (order: WarehouseOrderRecord) => void
  onPauseActive?: () => void
}) {
  return (
    <section className="grid shrink-0 gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.58fr)]">
      <div className="rounded-xl border px-4 py-4" style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium uppercase" style={{ color: 'var(--wh-text-muted)' }}>Total orders</p>
          <ClipboardList className="size-6 shrink-0" style={{ color: 'var(--wh-status-available)' }} />
        </div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
          <p className="shrink-0 text-3xl font-semibold tabular-nums">{totalOrders}</p>
          <div className="flex min-w-0 flex-1 flex-wrap justify-end gap-x-4 gap-y-2 sm:gap-x-6">
            {[
              { label: 'Active', value: activeOrders, status: 'EXECUTING' as const, color: 'var(--wh-status-available)' },
              { label: 'Paused', value: pausedOrders, status: 'PAUSED' as const, color: 'var(--wh-status-full)' },
              { label: 'Ready', value: readyOrders, status: 'RELEASED' as const, color: 'var(--wh-text-muted)' }
            ].map((item) => (
              <button
                key={item.status}
                type="button"
                className="text-right transition hover:opacity-90"
                onClick={() => onStatusClick(item.status)}
              >
                <p className="text-[10px] font-medium uppercase tracking-wide sm:text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                  {item.label}
                </p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums sm:text-xl" style={{ color: item.color }}>{item.value}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border px-4 py-3" style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }}>
        {activeExecutingOrder ? (
          <>
            <p className="text-xs font-medium uppercase" style={{ color: 'var(--wh-text-muted)' }}>Active order</p>
            <div className="mt-2 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">{activeExecutingOrder.reference}</p>
                <p className="mt-1 truncate text-sm" style={{ color: 'var(--wh-text-muted)' }}>
                  {typeLabel(activeExecutingOrder.type)} · {activeExecutingOrder.infoValue}
                </p>
              </div>
              <WarehouseOverviewStatusPill tone={statusTone(activeExecutingOrder.status)}>
                {humanizeOrderStatus(activeExecutingOrder.status)}
              </WarehouseOverviewStatusPill>
            </div>
            <div className="mt-3">
              <OrderProgress value={activeExecutingOrder.progress} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {onPauseActive ? (
                <button
                  type="button"
                  className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-medium transition hover:opacity-90"
                  style={{
                    background: 'transparent',
                    borderColor: 'color-mix(in srgb, var(--wh-status-full) 55%, transparent)',
                    color: 'var(--wh-status-full)'
                  }}
                  onClick={onPauseActive}
                >
                  <Pause className="size-4" />
                  Pause
                </button>
              ) : null}
              <Link
                href={warehousePoolOrderHref(activeExecutingOrder)}
                prefetch={false}
                className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-medium transition hover:opacity-90"
                style={{
                  background: 'transparent',
                  borderColor: 'color-mix(in srgb, var(--wh-status-available) 55%, transparent)',
                  color: 'var(--wh-status-available)'
                }}
              >
                Continue order
              </Link>
            </div>
          </>
        ) : lastUserOrder ? (
          <>
            <p className="text-xs font-medium uppercase" style={{ color: 'var(--wh-text-muted)' }}>Your last active order</p>
            <div className="mt-2 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">{lastUserOrder.reference}</p>
                <p className="mt-1 truncate text-sm" style={{ color: 'var(--wh-text-muted)' }}>
                  {typeLabel(lastUserOrder.type)} · {lastUserOrder.infoValue}
                </p>
              </div>
              <WarehouseOverviewStatusPill tone={statusTone(lastUserOrder.status)}>{humanizeOrderStatus(lastUserOrder.status)}</WarehouseOverviewStatusPill>
            </div>
            <div className="mt-3">
              <OrderProgress value={lastUserOrder.progress} />
            </div>
          </>
        ) : (
          <>
            <p className="text-xs font-medium uppercase" style={{ color: 'var(--wh-text-muted)' }}>Next action</p>
            <p className="mt-2 text-lg font-semibold">Start work from the pool</p>
            <p className="mt-1 text-sm" style={{ color: 'var(--wh-text-muted)' }}>
              Pick a ready order when you are taking ownership.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-3 min-h-9 cursor-pointer border bg-transparent"
              style={{
                borderColor: 'color-mix(in srgb, var(--wh-status-available) 55%, transparent)',
                color: 'var(--wh-status-available)'
              }}
              disabled={!nextReadyOrder}
              onClick={() => nextReadyOrder ? onStartOrder(nextReadyOrder) : undefined}
            >
              <Play data-icon="inline-start" />
              Start ready order
            </Button>
          </>
        )}
      </div>
    </section>
  )
}

function FilterChipBadge({
  children,
  struck,
  onRemove
}: {
  children: ReactNode
  struck?: boolean
  onRemove: () => void
}) {
  return (
    <button
      type="button"
      className={cn(
        'max-w-[14rem] truncate rounded-full border px-2.5 py-1 text-left text-xs font-medium motion-safe:transition-opacity motion-safe:duration-200 hover:opacity-90',
        struck && 'line-through opacity-65'
      )}
      style={{
        borderColor: 'var(--wh-border)',
        color: 'var(--wh-text-muted)',
        background: 'var(--wh-card-bg)'
      }}
      onClick={onRemove}
    >
      {children}
    </button>
  )
}

export function WarehouseOrderPoolToolbar({
  availablePoolOnly,
  completionSort,
  myOrdersOnly,
  onAvailablePoolToggle,
  onCompletionSortCycle,
  onEnableAvailablePoolOnly,
  onMyOrdersToggle,
  onResetCompletionSort,
  onSearchClear,
  onSortBaselineChange,
  onStatusToggle,
  onTypeToggle,
  searchText,
  selectedStatuses,
  selectedTypes,
  sortBaseline
}: {
  availablePoolOnly: boolean
  completionSort: OrderPoolCompletionSort
  myOrdersOnly: boolean
  onAvailablePoolToggle: () => void
  onCompletionSortCycle: () => void
  onEnableAvailablePoolOnly: () => void
  onMyOrdersToggle: () => void
  onResetCompletionSort: () => void
  onSearchClear: () => void
  onSortBaselineChange: (value: OrderPoolSortBaseline) => void
  onStatusToggle: (status: WarehouseOrderRecord['status']) => void
  onTypeToggle: (type: WarehouseOrderRecord['type']) => void
  searchText: string
  selectedStatuses: WarehouseOrderRecord['status'][]
  selectedTypes: WarehouseOrderRecord['type'][]
  sortBaseline: OrderPoolSortBaseline
}) {
  const excludedTypes = ORDER_POOL_TYPES.filter((type) => !selectedTypes.includes(type))
  const excludedStatuses = ORDER_POOL_STATUSES.filter((status) => !selectedStatuses.includes(status))
  const searchTrimmed = searchText.trim()

  const completionSortBadgeLabel =
    completionSort === 'asc' ? 'Completion · ascending' : completionSort === 'desc' ? 'Completion · descending' : ''

  return (
    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="min-h-9 cursor-pointer">
              <SlidersHorizontal className="size-4" />
              Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 border-dash-border bg-dash-shell p-3">
            <div className="space-y-3">
              <div>
                <p className="mb-2 text-xs font-medium uppercase" style={{ color: 'var(--wh-text-muted)' }}>List order</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg px-3 py-2 text-xs font-medium motion-safe:transition-opacity motion-safe:duration-150"
                    style={{
                      background: sortBaseline === 'status' ? 'var(--wh-card-bg)' : 'transparent',
                      borderWidth: 1,
                      borderStyle: 'solid',
                      borderColor: sortBaseline === 'status' ? 'var(--wh-status-available)' : 'var(--wh-border)',
                      color: 'var(--wh-text-primary)'
                    }}
                    onClick={() => onSortBaselineChange('status')}
                  >
                    Status
                  </button>
                  <button
                    type="button"
                    className="rounded-lg px-3 py-2 text-xs font-medium motion-safe:transition-opacity motion-safe:duration-150"
                    style={{
                      background: sortBaseline === 'newest' ? 'var(--wh-card-bg)' : 'transparent',
                      borderWidth: 1,
                      borderStyle: 'solid',
                      borderColor: sortBaseline === 'newest' ? 'var(--wh-status-available)' : 'var(--wh-border)',
                      color: 'var(--wh-text-primary)'
                    }}
                    onClick={() => onSortBaselineChange('newest')}
                  >
                    Newest
                  </button>
                  <button
                    type="button"
                    className="rounded-lg px-3 py-2 text-xs font-medium motion-safe:transition-opacity motion-safe:duration-150"
                    style={{
                      background: sortBaseline === 'last-active' ? 'var(--wh-card-bg)' : 'transparent',
                      borderWidth: 1,
                      borderStyle: 'solid',
                      borderColor: sortBaseline === 'last-active' ? 'var(--wh-status-available)' : 'var(--wh-border)',
                      color: 'var(--wh-text-primary)'
                    }}
                    onClick={() => onSortBaselineChange('last-active')}
                  >
                    Last active
                  </button>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase" style={{ color: 'var(--wh-text-muted)' }}>Order type</p>
                {ORDER_POOL_TYPES.map((type) => (
                  <label key={type} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm">
                    <Checkbox checked={selectedTypes.includes(type)} onCheckedChange={() => onTypeToggle(type)} />
                    {typeLabel(type)}
                  </label>
                ))}
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase" style={{ color: 'var(--wh-text-muted)' }}>Status</p>
                {ORDER_POOL_STATUSES.map((status) => (
                  <label key={status} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm">
                    <Checkbox checked={selectedStatuses.includes(status)} onCheckedChange={() => onStatusToggle(status)} />
                    {humanizeOrderStatus(status)}
                  </label>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-9 cursor-pointer gap-1"
          aria-label={
            completionSort === 'none'
              ? 'Sort by completion: inactive. Activate ascending.'
              : completionSort === 'asc'
                ? 'Completion ascending. Switch to descending.'
                : 'Completion descending. Clear completion sort.'
          }
          onClick={onCompletionSortCycle}
        >
          <span>Completion</span>
          <ChevronUp
            className="size-4 shrink-0 motion-safe:transition-[opacity,color] motion-safe:duration-200"
            style={{
              opacity: completionSort === 'asc' ? 1 : 0.35,
              color: completionSort === 'asc' ? 'var(--wh-status-available)' : 'var(--wh-text-muted)'
            }}
            aria-hidden
          />
          <ChevronDown
            className="size-4 shrink-0 motion-safe:transition-[opacity,color] motion-safe:duration-200"
            style={{
              opacity: completionSort === 'desc' ? 1 : 0.35,
              color: completionSort === 'desc' ? 'var(--wh-status-available)' : 'var(--wh-text-muted)'
            }}
            aria-hidden
          />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-9 cursor-pointer bg-transparent"
          aria-pressed={availablePoolOnly}
          aria-label={
            availablePoolOnly
              ? 'Available pool active (released and paused). Click to include executing orders.'
              : 'All statuses visible. Click to show only available pool.'
          }
          onClick={onAvailablePoolToggle}
        >
          Available
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            'min-h-9 cursor-pointer bg-transparent',
            myOrdersOnly && 'border-emerald-500/35 text-emerald-100'
          )}
          aria-pressed={myOrdersOnly}
          aria-label={
            myOrdersOnly
              ? 'Showing only orders assigned to you. Click to show all orders.'
              : 'Show only orders assigned to you.'
          }
          onClick={onMyOrdersToggle}
        >
          My orders
        </Button>
      </div>

      <div className="flex min-w-0 flex-wrap items-center justify-start gap-2 sm:max-w-[min(100%,28rem)] sm:justify-end">
        {excludedTypes.map((type) => (
          <FilterChipBadge key={`type-${type}`} struck onRemove={() => onTypeToggle(type)}>
            {typeLabel(type)}
          </FilterChipBadge>
        ))}
        {excludedStatuses.map((status) => (
          <FilterChipBadge key={`status-${status}`} struck onRemove={() => onStatusToggle(status)}>
            {humanizeOrderStatus(status)}
          </FilterChipBadge>
        ))}
        {completionSort !== 'none' ? (
          <FilterChipBadge onRemove={onResetCompletionSort}>
            {completionSortBadgeLabel}
          </FilterChipBadge>
        ) : null}
        {sortBaseline === 'newest' ? (
          <FilterChipBadge onRemove={() => onSortBaselineChange('status')}>
            Newest first
          </FilterChipBadge>
        ) : null}
        {sortBaseline === 'last-active' ? (
          <FilterChipBadge onRemove={() => onSortBaselineChange('status')}>
            Last active first
          </FilterChipBadge>
        ) : null}
        {!availablePoolOnly ? (
          <FilterChipBadge onRemove={onEnableAvailablePoolOnly}>
            Executing orders shown
          </FilterChipBadge>
        ) : null}
        {myOrdersOnly ? (
          <FilterChipBadge onRemove={onMyOrdersToggle}>
            My orders
          </FilterChipBadge>
        ) : null}
        {searchTrimmed ? (
          <FilterChipBadge onRemove={onSearchClear}>
            Search · {searchTrimmed.length > 28 ? `${searchTrimmed.slice(0, 28)}…` : searchTrimmed}
          </FilterChipBadge>
        ) : null}
      </div>
    </div>
  )
}

export function WarehouseOrderPoolCard({
  actingId,
  currentUserId,
  onAction,
  order
}: {
  actingId: string | null
  currentUserId: string | null
  onAction: (order: WarehouseOrderRecord) => void
  order: WarehouseOrderRecord
}) {
  const href = warehousePoolOrderHref(order)
  const activityLabel =
    order.status === 'EXECUTING'
      ? `Assigned to ${order.assignedTo}`
      : order.status === 'PAUSED'
        ? `Last active ${formatDateTime(order.pausedAt ?? order.lastActiveAt)}`
        : 'Ready to start'
  const config = actionConfig(order, currentUserId)
  const cardBody = (
    <>
      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="shrink-0 text-xl font-semibold tracking-tight" style={{ color: 'var(--wh-text-muted)' }}>
              {typeLabel(order.type)}
            </span>
            <h2 className="min-w-0 truncate text-xl font-semibold tracking-tight">{order.reference}</h2>
          </div>
          <div className="shrink-0 pt-0.5">
            <WarehouseOverviewStatusPill tone={statusTone(order.status)}>{humanizeOrderStatus(order.status)}</WarehouseOverviewStatusPill>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-xs font-medium uppercase" style={{ color: 'var(--wh-text-muted)' }}>{order.infoLabel}</p>
        <p className="truncate text-sm font-medium">{order.infoValue}</p>
      </div>

      <div className="mt-4">
        <OrderProgress value={order.progress} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm" style={{ color: 'var(--wh-text-muted)' }}>
        <span className="truncate">{activityLabel}</span>
        <div className="flex shrink-0 items-center gap-2">
          {config ? (
            <button
              type="button"
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-100"
              style={actionButtonStyle(config)}
              disabled={!config.enabled || actingId === order.id}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onAction(order)
              }}
            >
              <config.Icon className="size-4" />
              {config.label}
            </button>
          ) : null}
        </div>
      </div>
    </>
  )

  return (
    <Link
      href={href}
      className="min-h-[12rem] rounded-xl border p-4 text-left transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--wh-border)]"
      style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }}
    >
      {cardBody}
    </Link>
  )
}

export function WarehouseOrderPoolHeaderActions({
  onNext,
  onPrev,
  onSearchChange,
  page,
  searchText,
  totalPages
}: {
  onNext: () => void
  onPrev: () => void
  onSearchChange: (value: string) => void
  page: number
  searchText: string
  totalPages: number
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <OrderPoolSearch value={searchText} onChange={onSearchChange} />
      <PaginationSelector page={page} totalPages={totalPages} onPrev={onPrev} onNext={onNext} />
    </div>
  )
}

export function WarehouseOrderPoolSection({
  actingId,
  headerActions,
  currentUserId,
  onClearFilters,
  orderCount,
  pageOrders,
  toolbar,
  onAction
}: {
  actingId: string | null
  headerActions: ReactNode
  currentUserId: string | null
  onClearFilters?: () => void
  orderCount: number
  pageOrders: WarehouseOrderRecord[]
  toolbar: ReactNode
  onAction: (order: WarehouseOrderRecord) => void
}) {
  return (
    <WarehouseOverviewShellSection
      className="min-h-0 flex-1 overflow-hidden"
      title={
        <span className="inline-flex items-center gap-2">
          <ClipboardList className="size-4" />
          Orders
        </span>
      }
      action={
        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-normal sm:inline" style={{ color: 'var(--wh-text-muted)' }}>{orderCount} open</span>
          {headerActions}
        </div>
      }
    >
      {toolbar}
      {pageOrders.length === 0 ? (
        <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-xl border px-4 py-8 text-center" style={{ background: 'var(--wh-card-bg)', borderColor: 'var(--wh-border)' }}>
          <PackageCheck className="size-8" style={{ color: 'var(--wh-status-available)' }} />
          <p className="mt-3 text-sm font-medium">No orders match these filters.</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--wh-text-muted)' }}>Clear a filter to bring more work back into the pool.</p>
          {onClearFilters ? (
            <Button type="button" variant="outline" size="sm" className="mt-4 min-h-9 cursor-pointer" style={{ borderColor: 'var(--wh-border)', color: 'var(--wh-text-primary)' }} onClick={onClearFilters}>
              Remove filters
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {pageOrders.map((order) => (
            <WarehouseOrderPoolCard
              key={`${order.type}-${order.id}`}
              actingId={actingId}
              currentUserId={currentUserId}
              order={order}
              onAction={onAction}
            />
          ))}
        </div>
      )}
    </WarehouseOverviewShellSection>
  )
}
