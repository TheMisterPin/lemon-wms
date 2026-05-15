'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/warehouse/orders/warehouse-orders-page-view.md
 */

import { useEffect, useMemo } from 'react'
import type { CSSProperties } from 'react'

import Link from 'next/link'

import { ArrowLeft, Loader2, Pause, Play, RotateCcw, SlidersHorizontal } from 'lucide-react'

import {
  WarehouseOverviewShellSection,
  WarehouseOverviewStatusPill,
  type WarehouseOverviewTone,
  warehouseOverviewToneStyles
} from '@/components/primitives/warehouse-overview-primitives'
import { PaginationSelector } from '@/components/shared/pagination-selector'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { OrderPoolSearch } from '@/components/warehouse/orders/order-pool-search'
import {
  usePurchaseOrders,
  type WarehouseOperationalOrderRow,
  type WarehouseOrdersSortBaseline
} from '@/components/warehouse/orders/use-purchase-orders'
import { OrderStatus } from '@/generated/prisma'

type Props = { orderType: string }

function statusTone(status: OrderStatus): WarehouseOverviewTone {
  if (status === OrderStatus.EXECUTING) {
    return 'success'
  }

  if (status === OrderStatus.PAUSED || status === OrderStatus.RELEASED) {
    return 'warning'
  }

  return 'neutral'
}

function floorActionOutline(kind: 'start' | 'pause' | 'resume'): CSSProperties {
  if (kind === 'pause') {
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

function actionKind(row: WarehouseOperationalOrderRow): 'start' | 'pause' | 'resume' | null {
  if (row.status === OrderStatus.EXECUTING) {
    return 'pause'
  }

  if (row.status === OrderStatus.PAUSED) {
    return 'resume'
  }

  if (row.status === OrderStatus.RELEASED) {
    return 'start'
  }

  return null
}

function actionForOrder(row: WarehouseOperationalOrderRow): {
  label: string
  Icon: typeof Play
  disabled: boolean
  kind: 'start' | 'pause' | 'resume'
} {
  if (row.status === OrderStatus.EXECUTING) {
    return { label: 'Pause', Icon: Pause, disabled: false, kind: 'pause' }
  }

  if (row.status === OrderStatus.PAUSED) {
    return { label: 'Resume', Icon: RotateCcw, disabled: false, kind: 'resume' }
  }

  if (row.status === OrderStatus.RELEASED) {
    return { label: 'Start', Icon: Play, disabled: false, kind: 'start' }
  }

  return { label: 'Unavailable', Icon: Play, disabled: true, kind: 'start' }
}

function formatDate(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date'
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function OrderCard({
  row,
  segment,
  actingId,
  onRunAction,
  partyUnavailableLabel
}: {
  row: WarehouseOperationalOrderRow
  segment: 'purchase' | 'sales' | 'transfer'
  actingId: string | null
  onRunAction: (row: WarehouseOperationalOrderRow) => void
  partyUnavailableLabel: string
}) {
  const action = actionForOrder(row)
  const ActionIcon = action.Icon
  const isActing = actingId === row.id
  const tone = statusTone(row.status)
  const toneColor = warehouseOverviewToneStyles[tone].icon
  const kind = actionKind(row) ?? 'start'
  const lastTouch = row.lastActiveAt ?? row.pausedAt ?? row.createdAt

  return (
    <article
      className="rounded-xl border p-4"
      style={{
        background: 'var(--wh-card-bg)',
        borderColor: 'var(--wh-border)'
      }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
              {row.reference}
            </p>
            <WarehouseOverviewStatusPill tone={tone}>{row.status}</WarehouseOverviewStatusPill>
          </div>
          <p className="mt-1 text-sm" style={{ color: 'var(--wh-text-muted)' }}>
            {row.supplier || partyUnavailableLabel}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4" style={{ color: 'var(--wh-text-secondary)' }}>
            <div>
              <p style={{ color: 'var(--wh-text-muted)' }}>Created</p>
              <p className="mt-0.5 font-medium">{formatDate(row.createdAt)}</p>
            </div>
            <div>
              <p style={{ color: 'var(--wh-text-muted)' }}>Last active</p>
              <p className="mt-0.5 font-medium">{formatDate(lastTouch)}</p>
            </div>
            <div>
              <p style={{ color: 'var(--wh-text-muted)' }}>Warehouse</p>
              <p className="mt-0.5 truncate font-mono">{row.warehouseId}</p>
            </div>
            <div>
              <p style={{ color: 'var(--wh-text-muted)' }}>State</p>
              <p className="mt-0.5 font-medium" style={{ color: toneColor }}>
                {row.status === OrderStatus.EXECUTING ? 'Active' : row.status === OrderStatus.PAUSED ? 'Paused' : 'Ready'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          {segment === 'purchase'
            ? (
              <Link
                prefetch={false}
                href={`/warehouse/orders/purchase/${encodeURIComponent(row.id)}`}
                className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl border px-4 py-2 text-center text-sm font-medium transition hover:opacity-90 sm:min-w-32"
                style={floorActionOutline('start')}
              >
                Receive
              </Link>
            )
            : null}
          <button
            type="button"
            className="inline-flex min-h-11 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-32"
            style={floorActionOutline(kind)}
            disabled={action.disabled || actingId !== null}
            onClick={() => onRunAction(row)}
          >
            {isActing ? (
              <Loader2 data-icon="inline-start" className="animate-spin size-4" />
            ) : (
              <ActionIcon data-icon="inline-start" className="size-4" />
            )}
            {isActing ? 'Working' : action.label}
          </button>
        </div>
      </div>
    </article>
  )
}

function sortBaselineLabel(mode: WarehouseOrdersSortBaseline): string {
  if (mode === 'newest') {
    return 'Newest'
  }

  if (mode === 'last-active') {
    return 'Last active'
  }

  return 'Status'
}

export function WarehouseOrdersPageView({ orderType }: Props) {
  const {
    segment,
    cards,
    totalOperational,
    isLoading,
    loadOutcome,
    actingId,
    loadOrders,
    paginatedRows,
    filteredCount,
    ordersPage,
    ordersTotalPages,
    ordersPrev,
    ordersNext,
    searchText,
    setSearchText,
    sortBaseline,
    setSortBaseline,
    selectedStatuses,
    toggleStatusInFilter,
    runAction
  } = usePurchaseOrders(orderType)

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  const headline =
    segment === 'purchase'
      ? 'Purchase orders'
      : segment === 'sales'
        ? 'Sales orders'
        : segment === 'transfer'
          ? 'Transfer orders'
          : 'Warehouse orders'

  const partyUnavailableLabel =
    segment === 'purchase'
      ? 'Supplier unavailable'
      : segment === 'sales'
        ? 'Customer unavailable'
        : 'Transfer details unavailable'

  const loadingLabel =
    segment === 'purchase'
      ? 'Loading purchase orders...'
      : segment === 'sales'
        ? 'Loading sales orders...'
        : segment === 'transfer'
          ? 'Loading transfer orders...'
          : 'Loading orders...'

  const sectionTitle = useMemo(() => headline, [headline])

  if (!segment) {
    return (
      <main className="min-h-screen p-4 xl:p-6" style={{ background: 'var(--wh-page-bg)', color: 'var(--wh-text-primary)' }}>
        <div
          className="mx-auto max-w-7xl rounded-xl border p-6"
          style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }}
        >
          <h1 className="text-2xl font-semibold">Warehouse orders</h1>
          <p className="mt-4 text-sm" style={{ color: 'var(--wh-text-muted)' }}>
            This order type is not supported on the floor. Use purchase, sales, or transfer routes.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen p-4 pb-20 xl:p-6 xl:pb-20"
      style={{
        background: 'var(--wh-page-bg)',
        color: 'var(--wh-text-primary)'
      }}
    >
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-2">
          <Link
            href="/warehouse"
            prefetch={false}
            className="inline-flex w-fit items-center gap-2 text-sm font-medium transition hover:opacity-90"
            style={{ color: 'var(--wh-text-secondary)' }}
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            Back to order pool
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{headline}</h1>
          </div>
        </header>

        <div
          className="rounded-xl border p-4 sm:p-5"
          style={{
            background: 'transparent',
            borderColor: 'var(--wh-border)'
          }}
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--wh-text-muted)' }}>
                Total operational
              </p>
              <p className="mt-1 text-4xl font-semibold tabular-nums">{totalOperational}</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {cards.map((card) => {
                const selected = selectedStatuses.includes(card.status)
                const tone = statusTone(card.status)
                const accent = warehouseOverviewToneStyles[tone].icon

                return (
                  <button
                    key={card.status}
                    type="button"
                    className="min-w-[5.5rem] rounded-lg border px-3 py-2 text-left transition hover:opacity-90"
                    style={{
                      background: 'transparent',
                      borderColor: selected ? accent : 'var(--wh-border)',
                      color: selected ? accent : 'var(--wh-text-muted)'
                    }}
                    onClick={() => toggleStatusInFilter(card.status)}
                  >
                    <p className="text-[10px] font-medium uppercase tracking-wide">{card.label}</p>
                    <p className="mt-0.5 text-xl font-semibold tabular-nums">{card.count}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div
            className="rounded-xl border px-6 py-10 text-center text-sm"
            style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)', color: 'var(--wh-text-muted)' }}
          >
            {loadingLabel}
          </div>
        ) : null}

        {!isLoading && loadOutcome === 'failed' ? (
          <div
            className="rounded-xl border border-dashed px-4 py-8 text-center text-sm"
            style={{ borderColor: 'var(--wh-border)', color: 'var(--wh-text-muted)' }}
          >
            Unable to load orders. Use the dialog to retry or dismiss.
          </div>
        ) : null}

        {!isLoading && loadOutcome !== 'failed' ? (
          <WarehouseOverviewShellSection
            title={sectionTitle}
            action={
              <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
                <span className="hidden text-xs font-normal sm:inline" style={{ color: 'var(--wh-text-muted)' }}>
                  {filteredCount} open
                </span>
                <OrderPoolSearch value={searchText} onChange={setSearchText} />
                <PaginationSelector
                  page={ordersPage}
                  totalPages={ordersTotalPages}
                  onPrev={ordersPrev}
                  onNext={ordersNext}
                />
              </div>
            }
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="min-h-9 cursor-pointer gap-1 bg-transparent">
                    <SlidersHorizontal className="size-4" />
                    Sort · {sortBaselineLabel(sortBaseline)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-56 border-dash-border bg-dash-shell p-3">
                  <p className="mb-2 text-xs font-medium uppercase" style={{ color: 'var(--wh-text-muted)' }}>List order</p>
                  <div className="flex flex-wrap gap-2">
                    {(['status', 'newest', 'last-active'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        className="rounded-lg px-3 py-2 text-xs font-medium motion-safe:transition-opacity"
                        style={{
                          background: 'transparent',
                          borderWidth: 1,
                          borderStyle: 'solid',
                          borderColor: sortBaseline === mode ? 'var(--wh-status-available)' : 'var(--wh-border)',
                          color: 'var(--wh-text-primary)'
                        }}
                        onClick={() => setSortBaseline(mode)}
                      >
                        {sortBaselineLabel(mode)}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {paginatedRows.length === 0 ? (
              <div
                className="rounded-xl border border-dashed px-4 py-8 text-center text-sm"
                style={{ borderColor: 'var(--wh-border)', color: 'var(--wh-text-muted)' }}
              >
                No orders match these filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {paginatedRows.map((row) => (
                  <OrderCard
                    key={row.id}
                    row={row}
                    segment={segment}
                    actingId={actingId}
                    partyUnavailableLabel={partyUnavailableLabel}
                    onRunAction={(nextRow) => {
                      if (actingId !== null) {
                        return
                      }

                      void runAction(nextRow)
                    }}
                  />
                ))}
              </div>
            )}
          </WarehouseOverviewShellSection>
        ) : null}
      </div>
    </main>
  )
}
