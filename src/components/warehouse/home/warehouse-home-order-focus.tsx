'use client'

import Link from 'next/link'

import {
  humanizeOrderStatus,
  statusTone,
  typeLabel
} from '@/components/warehouse/orders/order-pool-components'
import type { WarehouseOrderRecord } from '@/components/warehouse/orders/types'
import {
  WarehouseOverviewShellSection,
  WarehouseOverviewStatusPill
} from '@/components/primitives/warehouse-overview-primitives'

import { warehouseOrderDetailHref } from './warehouse-home-order-helpers'

type WarehouseHomeOrderFocusProps = {
  focusOrder: WarehouseOrderRecord | null
  activeExecutingOrder: WarehouseOrderRecord | null
  summary: {
    totalOrders: number
    releasedOrders: number
    activeOrders: number
    pausedOrders: number
  }
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

function SummaryMetrics({
  summary
}: {
  summary: WarehouseHomeOrderFocusProps['summary']
}) {
  const items = [
    { label: 'Total', value: summary.totalOrders, color: 'var(--wh-text-primary)' },
    { label: 'Active', value: summary.activeOrders, color: 'var(--wh-status-available)' },
    { label: 'Paused', value: summary.pausedOrders, color: 'var(--wh-status-full)' },
    { label: 'Ready', value: summary.releasedOrders, color: 'var(--wh-text-muted)' }
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border px-3 py-3"
          style={{ background: 'var(--wh-card-bg)', borderColor: 'var(--wh-border)' }}
        >
          <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--wh-text-muted)' }}>
            {item.label}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums" style={{ color: item.color }}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}

export function WarehouseHomeOrderFocus({
  focusOrder,
  activeExecutingOrder,
  summary
}: WarehouseHomeOrderFocusProps) {
  const isCurrent =
    focusOrder !== null
    && activeExecutingOrder !== null
    && focusOrder.id === activeExecutingOrder.id
    && focusOrder.type === activeExecutingOrder.type

  return (
    <WarehouseOverviewShellSection title="Orders">
      {focusOrder ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase" style={{ color: 'var(--wh-text-muted)' }}>
                {isCurrent ? 'Current order' : 'Your last order'}
              </p>
              <p className="mt-1 truncate text-xl font-semibold">{focusOrder.reference}</p>
              <p className="mt-1 truncate text-sm" style={{ color: 'var(--wh-text-muted)' }}>
                {typeLabel(focusOrder.type)} · {focusOrder.infoValue}
              </p>
            </div>
            <WarehouseOverviewStatusPill tone={statusTone(focusOrder.status)}>
              {humanizeOrderStatus(focusOrder.status)}
            </WarehouseOverviewStatusPill>
          </div>
          <OrderProgress value={focusOrder.progress} />
          <div className="flex flex-wrap gap-2">
            <Link
              href={warehouseOrderDetailHref(focusOrder)}
              prefetch={false}
              className="inline-flex h-9 items-center rounded-xl border px-3 text-sm font-medium transition hover:opacity-90"
              style={{
                background: 'transparent',
                borderColor: 'color-mix(in srgb, var(--wh-status-available) 55%, transparent)',
                color: 'var(--wh-status-available)'
              }}
            >
              {isCurrent ? 'Continue order' : 'Open order'}
            </Link>
            <Link
              href="/warehouse/orders"
              prefetch={false}
              className="inline-flex h-9 items-center rounded-xl border px-3 text-sm font-medium transition hover:opacity-90"
              style={{
                background: 'var(--wh-card-bg)',
                borderColor: 'var(--wh-border)',
                color: 'var(--wh-text-secondary)'
              }}
            >
              View order pool
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--wh-text-primary)' }}>
              No active assignment yet
            </p>
            <p className="mt-1 text-sm" style={{ color: 'var(--wh-text-muted)' }}>
              Summary of operational orders in this warehouse.
            </p>
          </div>
          <SummaryMetrics summary={summary} />
          <Link
            href="/warehouse/orders"
            prefetch={false}
            className="inline-flex h-9 items-center rounded-xl border px-3 text-sm font-medium transition hover:opacity-90"
            style={{
              background: 'transparent',
              borderColor: 'color-mix(in srgb, var(--wh-status-available) 55%, transparent)',
              color: 'var(--wh-status-available)'
            }}
          >
            Go to order pool
          </Link>
        </div>
      )}
    </WarehouseOverviewShellSection>
  )
}
