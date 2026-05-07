'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/orders/dashboard-orders-overview-view.md
 */


import Link from 'next/link'

import { useOrdersDashboard } from '@/components/dashboard/orders/use-orders-dashboard'
import {
  WarehouseOverviewShellSection,
  WarehouseOverviewStatusPill,
  warehouseOverviewToneStyles,
  type WarehouseOverviewTone
} from '@/components/primitives/warehouse-overview-primitives'
import { Skeleton } from '@/components/ui/skeleton'
import type { DashboardKpi } from '@/types/bin-detail-dashboard.types'
import type { OrderAttentionCard, OrderSummaryRow } from '@/types/orders-dashboard.types'

function humanizeEnum(value: string): string {
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (ch) => ch.toUpperCase())
}

function kpiTone(tone: DashboardKpi['tone']): WarehouseOverviewTone {
  if (tone === 'success') {
    return 'success'
  }
  if (tone === 'warning') {
    return 'warning'
  }
  if (tone === 'danger') {
    return 'danger'
  }

  return 'neutral'
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

function formatTs(value?: string): string {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

function buildAgingBuckets(rows: OrderSummaryRow[]): Array<{ label: string; count: number }> {
  const now = Date.now()
  const buckets = [
    { label: '0-1d', count: 0 },
    { label: '2-3d', count: 0 },
    { label: '4-7d', count: 0 },
    { label: '8d+', count: 0 }
  ]

  rows.forEach((row) => {
    if (!row.startedAt) {
      return
    }

    const ageMs = now - new Date(row.startedAt).getTime()
    const ageDays = ageMs / (1000 * 60 * 60 * 24)

    if (ageDays <= 1) {
      buckets[0].count += 1

      return
    }

    if (ageDays <= 3) {
      buckets[1].count += 1

      return
    }

    if (ageDays <= 7) {
      buckets[2].count += 1

      return
    }

    buckets[3].count += 1
  })

  return buckets
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

function OrderRow({ row }: { row: OrderSummaryRow }) {
  return (
    <tr className="border-t" style={{ borderColor: 'var(--wh-border)' }}>
      <td className="py-2 pr-4">
        <Link
          href={row.href}
          className="font-medium hover:underline"
          style={{ color: 'var(--wh-text-primary)' }}
        >
          {row.orderLabel}
        </Link>
      </td>
      <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>
        {humanizeEnum(row.type)}
      </td>
      <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>
        {row.warehouseName}
      </td>
      <td className="py-2 pr-4">
        <WarehouseOverviewStatusPill tone={statusTone(row.status)}>
          {humanizeEnum(row.status)}
        </WarehouseOverviewStatusPill>
      </td>
      <td className="py-2 pr-4">
        <div className="flex items-center gap-2">
          <div
            className="h-1.5 w-20 overflow-hidden rounded-full"
            style={{ background: 'var(--wh-border)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${row.progressPercent}%`,
                background: 'var(--wh-status-available)'
              }}
            />
          </div>
          <span className="text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
            {row.progressPercent}%
          </span>
        </div>
      </td>
      <td className="py-2 pr-4 text-sm" style={{ color: 'var(--wh-text-secondary)' }}>
        {row.assignedUserName ?? '—'}
      </td>
      <td className="py-2 pr-4 text-sm" style={{ color: 'var(--wh-text-secondary)' }}>
        {formatTs(row.startedAt)}
      </td>
      <td className="py-2 pr-4 text-sm" style={{ color: 'var(--wh-text-secondary)' }}>
        {formatTs(row.lastActivityAt)}
      </td>
      <td className="py-2">
        <Link href={row.href} className="text-xs hover:underline" style={{ color: 'var(--wh-text-secondary)' }}>
          View
        </Link>
      </td>
    </tr>
  )
}

export function DashboardOrdersOverviewView() {
  const { data, isLoading, error, refetch } = useOrdersDashboard()

  const agingBuckets = data ? buildAgingBuckets(data.orders) : []

  if (isLoading) {
    return (
      <main className="min-h-screen p-4 xl:p-6" style={{ background: 'var(--wh-page-bg)' }}>
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl bg-wh-card-bg-soft" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl bg-wh-card-bg-soft" />
            ))}
          </div>
          <Skeleton className="h-48 rounded-2xl bg-wh-card-bg-soft" />
          <Skeleton className="h-96 rounded-2xl bg-wh-card-bg-soft" />
        </div>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="min-h-screen" style={{ background: 'var(--wh-page-bg)' }}>
        <div className="mx-auto flex max-w-7xl items-center justify-center p-6 xl:p-10">
          <div
            className="w-full max-w-lg rounded-2xl px-6 py-10 text-center"
            style={{
              background: 'var(--wh-card-bg-soft)',
              border: '1px solid var(--wh-border)'
            }}
          >
            <p className="text-sm" style={{ color: 'var(--wh-text-primary)' }}>
              {error ?? 'Could not load orders dashboard.'}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-6 rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                background: 'var(--wh-action-bg)',
                border: '1px solid var(--wh-action-border)',
                color: 'var(--wh-action-text)'
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--wh-page-bg)' }}>
      <div className="mx-auto max-w-7xl space-y-6 p-4 xl:p-6">
        {/* Header */}
        <div
          className="rounded-2xl border p-5 xl:p-6"
          style={{
            background: 'var(--wh-card-bg-soft)',
            borderColor: 'var(--wh-border)'
          }}
        >
          <h1
            className="text-xl font-bold xl:text-2xl"
            style={{ color: 'var(--wh-text-primary)' }}
          >
            {data.header.title}
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--wh-text-muted)' }}>
            {data.header.subtitle}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.orderTypeDistribution.map((slice) => (
              <Link
                key={slice.type}
                href={slice.href}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-80"
                style={{
                  background: 'var(--wh-card-bg)',
                  borderColor: 'var(--wh-border)',
                  color: 'var(--wh-text-primary)'
                }}
              >
                {humanizeEnum(slice.type)} ({slice.count})
              </Link>
            ))}
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {data.kpis.map((kpi) => {
            const tone = kpiTone(kpi.tone)
            const color = warehouseOverviewToneStyles[tone].icon

            return (
              <div
                key={kpi.label}
                className="rounded-xl border p-4"
                style={{
                  background: 'var(--wh-card-bg-soft)',
                  borderColor: 'var(--wh-border)'
                }}
              >
                <p className="text-xs font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                  {kpi.label}
                </p>
                <p className="mt-1 text-2xl font-bold" style={{ color }}>
                  {kpi.value}
                </p>
              </div>
            )
          })}
        </div>

        {/* Attention Cards */}
        {data.attention.length > 0 ? (
          <WarehouseOverviewShellSection title="Needs Attention">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.attention.map((card) => (
                <AttentionCard key={card.orderId} card={card} />
              ))}
            </div>
          </WarehouseOverviewShellSection>
        ) : null}

        {/* Summary Charts */}
        <WarehouseOverviewShellSection title="Summary Charts">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="rounded-xl border p-4" style={{ borderColor: 'var(--wh-border)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
                Order Type Distribution
              </p>
              <div className="mt-3 space-y-2">
                {data.orderTypeDistribution.map((slice) => {
                  const total = data.orderTypeDistribution.reduce((sum, row) => sum + row.count, 0)
                  const width = total > 0 ? (slice.count / total) * 100 : 0

                  return (
                    <div key={slice.type}>
                      <div className="mb-1 flex items-center justify-between text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                        <span>{humanizeEnum(slice.type)}</span>
                        <span>{slice.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--wh-border)' }}>
                        <div className="h-full rounded-full" style={{ width: `${width}%`, background: 'var(--wh-status-available)' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl border p-4" style={{ borderColor: 'var(--wh-border)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
                Status Stacked Bar
              </p>
              <div className="mt-3 space-y-3">
                {data.statusBreakdown.map((row) => {
                  const total = row.released + row.assigned + row.active + row.paused + row.completed + row.exception
                  const releasedWidth = total > 0 ? (row.released / total) * 100 : 0
                  const assignedWidth = total > 0 ? (row.assigned / total) * 100 : 0
                  const activeWidth = total > 0 ? (row.active / total) * 100 : 0
                  const pausedWidth = total > 0 ? (row.paused / total) * 100 : 0
                  const completedWidth = total > 0 ? (row.completed / total) * 100 : 0
                  const exceptionWidth = total > 0 ? (row.exception / total) * 100 : 0

                  return (
                    <div key={row.label}>
                      <div className="mb-1 flex items-center justify-between text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                        <span>{row.label}</span>
                        <span>{total}</span>
                      </div>
                      <div className="flex h-2 overflow-hidden rounded-full" style={{ background: 'var(--wh-border)' }}>
                        <div style={{ width: `${releasedWidth}%`, background: '#64748b' }} />
                        <div style={{ width: `${assignedWidth}%`, background: '#0284c7' }} />
                        <div style={{ width: `${activeWidth}%`, background: '#22c55e' }} />
                        <div style={{ width: `${pausedWidth}%`, background: '#eab308' }} />
                        <div style={{ width: `${completedWidth}%`, background: '#10b981' }} />
                        <div style={{ width: `${exceptionWidth}%`, background: '#ef4444' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl border p-4" style={{ borderColor: 'var(--wh-border)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
                Warehouse Workload
              </p>
              <div className="mt-3 space-y-2">
                {data.warehouseWorkload.map((row) => {
                  const total = row.active + row.released + row.exceptions
                  const width = total > 0 ? (row.active / total) * 100 : 0

                  return (
                    <div key={row.warehouseId}>
                      <div className="mb-1 flex items-center justify-between text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                        <span>{row.warehouseName}</span>
                        <span>A:{row.active} R:{row.released} E:{row.exceptions}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--wh-border)' }}>
                        <div className="h-full rounded-full" style={{ width: `${width}%`, background: 'var(--wh-status-available)' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl border p-4" style={{ borderColor: 'var(--wh-border)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
                Aging Buckets
              </p>
              <div className="mt-3 space-y-2">
                {agingBuckets.map((bucket) => {
                  const max = Math.max(...agingBuckets.map((item) => item.count), 1)
                  const width = (bucket.count / max) * 100

                  return (
                    <div key={bucket.label}>
                      <div className="mb-1 flex items-center justify-between text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                        <span>{bucket.label}</span>
                        <span>{bucket.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--wh-border)' }}>
                        <div className="h-full rounded-full" style={{ width: `${width}%`, background: '#f97316' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </WarehouseOverviewShellSection>

        {/* Warehouse Workload */}
        {data.warehouseWorkload.length > 0 ? (
          <WarehouseOverviewShellSection title="Warehouse Workload">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ color: 'var(--wh-text-secondary)' }}>
                    <th className="pb-2 text-left font-medium">Warehouse</th>
                    <th className="pb-2 text-left font-medium">Active</th>
                    <th className="pb-2 text-left font-medium">Released</th>
                    <th className="pb-2 text-left font-medium">Completed</th>
                    <th className="pb-2 text-left font-medium">Exceptions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.warehouseWorkload.map((row) => (
                    <tr
                      key={row.warehouseId}
                      className="border-t"
                      style={{ borderColor: 'var(--wh-border)' }}
                    >
                      <td className="py-2 pr-4">
                        <Link
                          href={row.href}
                          className="font-medium hover:underline"
                          style={{ color: 'var(--wh-text-primary)' }}
                        >
                          {row.warehouseName}
                        </Link>
                      </td>
                      <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.active}</td>
                      <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.released}</td>
                      <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.completedToday}</td>
                      <td
                        className="py-2"
                        style={{
                          color: row.exceptions > 0
                            ? 'var(--wh-status-blocked)'
                            : 'var(--wh-text-secondary)'
                        }}
                      >
                        {row.exceptions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </WarehouseOverviewShellSection>
        ) : null}

        {/* Orders Table */}
        <WarehouseOverviewShellSection title={`Orders (${data.orders.length} shown)`}>
          {data.orders.length === 0 ? (
            <p className="py-6 text-center text-sm" style={{ color: 'var(--wh-text-muted)' }}>
              No orders found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ color: 'var(--wh-text-secondary)' }}>
                    <th className="pb-2 text-left font-medium">Order</th>
                    <th className="pb-2 text-left font-medium">Type</th>
                    <th className="pb-2 text-left font-medium">Warehouse</th>
                    <th className="pb-2 text-left font-medium">Status</th>
                    <th className="pb-2 text-left font-medium">Progress</th>
                    <th className="pb-2 text-left font-medium">Assigned</th>
                    <th className="pb-2 text-left font-medium">Started At</th>
                    <th className="pb-2 text-left font-medium">Last Activity</th>
                    <th className="pb-2 text-left font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map((row) => (
                    <OrderRow key={row.orderId} row={row} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </WarehouseOverviewShellSection>
      </div>
    </main>
  )
}
