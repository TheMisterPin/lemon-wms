'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/bins/bin-overview-dashboard.md
 */

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { warehouseOverviewIcons } from '@/components/features/locations/warehouses/components/warehouse-overview-icons'
import {
  WarehouseOverviewButton,
  WarehouseOverviewChartPanel,
  WarehouseOverviewShellSection,
  WarehouseOverviewStatusPill,
  warehouseOverviewToneStyles,
  type WarehouseOverviewTone
} from '@/components/primitives/warehouse-overview-primitives'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import type { BinActivityRow, BinContentRow, BinDetailDashboardDTO } from '@/types/bin-detail-dashboard.types'
import { WarehouseActivityRow } from '@/components/features/locations/warehouses/components/warehouse-overview-types'

type BinOverviewDashboardProps = {
  data: BinDetailDashboardDTO
}

function humanizeEnumLabel(value: string): string {
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (ch) => ch.toUpperCase())
}

function parseFillPercentValue(value: string): number {
  const n = parseInt(value.replace(/%/g, ''), 10)

  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0
}

function stockStatusTone(status: BinContentRow['status']): WarehouseOverviewTone {
  if (status === 'BLOCKED') {
    return 'danger'
  }
  if (status === 'RESERVED') {
    return 'warning'
  }
  if (status === 'IN_TRANSIT') {
    return 'neutral'
  }

  return 'success'
}

function toWarehouseActivityRows(rows: BinActivityRow[]): WarehouseActivityRow[] {
  return rows.map((r) => {
    const bits: string[] = [`Qty ${r.quantity.toLocaleString()}`]
    if (r.orderLabel !== undefined && r.orderLabel !== '') {
      bits.push(r.orderLabel)
    }
    if (r.fromBinCode !== undefined && r.fromBinCode !== '') {
      bits.push(`from ${r.fromBinCode}`)
    }
    if (r.toBinCode !== undefined && r.toBinCode !== '') {
      bits.push(`to ${r.toBinCode}`)
    }

    const entity = bits.join(' · ')

    return {
      id: r.id,
      time: format(new Date(r.occurredAt), 'MMM d, yyyy · HH:mm'),
      user: r.userName,
      action: humanizeEnumLabel(r.action),
      entity: entity === '' ? '—' : entity,
      status: 'SUCCESS'
    }
  })
}

function activityEventTone(status: WarehouseActivityRow['status']): WarehouseOverviewTone {
  if (status === 'SUCCESS') {
    return 'success'
  }
  if (status === 'WARNING') {
    return 'warning'
  }

  return 'danger'
}

function BinOperationsEventList({ items }: { items: WarehouseActivityRow[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const tone = activityEventTone(item.status)

        return (
          <div
            key={item.id}
            className="rounded-xl border p-3"
            style={{ background: 'var(--wh-card-bg)', borderColor: 'var(--wh-border)' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                  {item.time} · {item.user}
                </div>
                <div className="mt-1 text-sm font-medium">{item.action}</div>
                <div className="mt-1 text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                  {item.entity}
                </div>
              </div>
              <WarehouseOverviewStatusPill tone={tone}>{item.status}</WarehouseOverviewStatusPill>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const BIN_OPS_PREVIEW_COUNT = 4

type BinKpiIconKey = keyof typeof warehouseOverviewIcons

type BinKpiCardProps = {
  label: string
  value: string
  helper: string
  tone: keyof typeof warehouseOverviewToneStyles
  iconKey: BinKpiIconKey
  showProgress?: boolean
  progress?: number
}

function BinKpiCard({ label, value, helper, tone, iconKey, showProgress, progress = 0 }: BinKpiCardProps) {
  const Icon = warehouseOverviewIcons[iconKey] ?? warehouseOverviewIcons.stock
  const toneStyle = warehouseOverviewToneStyles[tone]

  return (
    <div
      className="rounded-lg border p-4 transition hover:border-opacity-100"
      style={{
        background: 'var(--wh-card-bg)',
        borderColor: 'var(--wh-border)'
      }}
    >
      {showProgress ? (
        <div className="flex items-start gap-3">
          <div className="shrink-0 text-3xl font-bold tabular-nums" style={{ color: 'var(--wh-text-primary, #f8fafc)' }}>
            {progress}%
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="text-sm font-medium" style={{ color: 'var(--wh-text-muted, #94a3b8)' }}>
              {label}
            </div>
            <div className="flex h-2 overflow-hidden rounded-full" style={{ background: 'var(--wh-card-bg-soft, #171c24)' }}>
              <div style={{ width: `${progress}%`, background: toneStyle.icon }} />
            </div>
            <div className="text-xs leading-relaxed" style={{ color: 'var(--wh-text-muted, #94a3b8)' }}>
              {helper}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <div style={{ color: toneStyle.icon }} className="shrink-0">
            <Icon />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="text-xs font-medium" style={{ color: 'var(--wh-text-muted, #94a3b8)' }}>
              {label}
            </div>
            <div className="text-xl font-bold tabular-nums" style={{ color: 'var(--wh-text-primary, #f8fafc)' }}>
              {value}
            </div>
            <div className="text-xs leading-relaxed" style={{ color: 'var(--wh-text-muted, #94a3b8)' }}>
              {helper}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const rechartsBinTooltip = {
  contentStyle: {
    background: 'var(--wh-card-bg)',
    border: '1px solid var(--wh-border)',
    borderRadius: '8px',
    color: 'var(--wh-text-primary)',
    fontSize: 12
  } as const,
  labelStyle: { color: 'var(--wh-text-secondary)' } as const,
  itemStyle: { color: 'var(--wh-text-primary)' } as const
}

export function BinOverviewDashboard({ data }: BinOverviewDashboardProps) {
  const { header, kpis, fillOverTime, contents, activity } = data
  const [opsSheetOpen, setOpsSheetOpen] = useState(false)

  const activityRows = useMemo(() => toWarehouseActivityRows(activity), [activity])

  const previewOps = useMemo(
    () => activityRows.slice(0, BIN_OPS_PREVIEW_COUNT),
    [activityRows]
  )
  const hasMoreOps = activityRows.length > BIN_OPS_PREVIEW_COUNT

  const chartRows = useMemo(
    () =>
      fillOverTime.map((p) => ({
        ...p,
        tick: format(new Date(p.occurredAt), 'MMM d HH:mm')
      })),
    [fillOverTime]
  )

  const chartUsesFillPercent = useMemo(
    () => fillOverTime.some((p) => p.fillPercent !== null),
    [fillOverTime]
  )

  const fillKpi = kpis[0]
  const itemsKpi = kpis[1]
  const mixKpi = kpis[2]

  return (
    <main
      className="min-h-screen p-4 xl:p-6"
      style={{
        background: 'var(--wh-page-bg, #0d1117)',
        color: 'var(--wh-text-primary, #f8fafc)'
      }}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm" style={{ color: 'var(--wh-text-muted, #94a3b8)' }}>
              <Link href="/dashboard/locations/warehouses" className="hover:underline">
                Warehouses
              </Link>
              <span className="mx-2">/</span>
              <Link href={`/dashboard/locations/warehouses/${header.warehouseId}`} className="hover:underline">
                {header.warehouseName}
              </Link>
              <span className="mx-2">/</span>
              <Link href={`/dashboard/locations/zones/${header.zoneId}`} className="hover:underline">
                {header.zoneName}
              </Link>
              <span className="mx-2">/</span>
              <span className="font-mono">{header.binCode}</span>
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight font-mono">{header.binCode}</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--wh-text-muted, #94a3b8)' }}>
              {header.subtitle}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-3">
              <div>
                <dt style={{ color: 'var(--wh-text-muted)' }}>Zone</dt>
                <dd className="mt-0.5 font-medium">
                  <Link href={`/dashboard/locations/zones/${header.zoneId}`} className="hover:underline">
                    {header.zoneName}
                  </Link>
                </dd>
              </div>
              <div>
                <dt style={{ color: 'var(--wh-text-muted)' }}>Warehouse</dt>
                <dd className="mt-0.5 font-medium">
                  <Link href={`/dashboard/locations/warehouses/${header.warehouseId}`} className="hover:underline">
                    {header.warehouseName}
                  </Link>
                </dd>
              </div>
              <div>
                <dt style={{ color: 'var(--wh-text-muted)' }}>Bin type</dt>
                <dd className="mt-0.5 font-medium">{humanizeEnumLabel(header.binType)}</dd>
              </div>
              <div className="col-span-2 md:col-span-1">
                <dt style={{ color: 'var(--wh-text-muted)' }}>Blocked status</dt>
                <dd className="mt-0.5">
                  <WarehouseOverviewStatusPill tone={header.isBlocked ? 'danger' : 'success'}>
                    {header.isBlocked ? 'Blocked' : 'Not blocked'}
                  </WarehouseOverviewStatusPill>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <BinKpiCard
            label={fillKpi.label}
            value={fillKpi.value}
            helper={fillKpi.helper}
            tone={fillKpi.tone}
            iconKey="warehouse"
            showProgress={fillKpi.value.endsWith('%')}
            progress={parseFillPercentValue(fillKpi.value)}
          />
          <BinKpiCard
            label={itemsKpi.label}
            value={itemsKpi.value}
            helper={itemsKpi.helper}
            tone={itemsKpi.tone}
            iconKey="stock"
          />
          <BinKpiCard
            label={mixKpi.label}
            value={mixKpi.value}
            helper={mixKpi.helper}
            tone={mixKpi.tone}
            iconKey="stock"
          />
        </section>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <WarehouseOverviewShellSection
            title={
              chartUsesFillPercent ? 'Bin fill over time (BinHistory)' : 'Units in bin over time (BinHistory)'
            }
            action={
              chartUsesFillPercent ? 'Daily BinHistory snapshots · % of max capacity' : 'Daily BinHistory snapshots · units on hand'
            }
          >
            <WarehouseOverviewChartPanel>
              <div className="h-75ll min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="var(--wh-border)" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="tick"
                      stroke="var(--wh-text-muted)"
                      tick={{ fill: 'var(--wh-text-muted)', fontSize: 10 }}
                    />
                    <YAxis
                      stroke="var(--wh-text-muted)"
                      tick={{ fill: 'var(--wh-text-muted)', fontSize: 11 }}
                    />
                    <Tooltip
                      {...rechartsBinTooltip}
                      labelFormatter={(_label, items) => {
                        const first =
                          Array.isArray(items) && items.length > 0 && typeof items[0] === 'object'
                            ? (items[0] as { payload?: { occurredAt?: string } }).payload
                            : undefined

                        return first?.occurredAt !== undefined
                          ? format(new Date(first.occurredAt), 'PPpp')
                          : ''
                      }}
                    />
                    {chartUsesFillPercent ? (
                      <Line
                        type="monotone"
                        dataKey="fillPercent"
                        name="Fill %"
                        stroke="var(--wh-status-available, #22c55e)"
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                      />
                    ) : (
                      <Line
                        type="monotone"
                        dataKey="unitsOnHand"
                        name="Units on hand"
                        stroke="var(--wh-status-available, #22c55e)"
                        strokeWidth={2}
                        dot={false}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </WarehouseOverviewChartPanel>
          </WarehouseOverviewShellSection>

          <WarehouseOverviewShellSection
            title="Bin operations"
            action={
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {hasMoreOps ? (
                  <WarehouseOverviewButton variant="secondary" size="sm" onClick={() => setOpsSheetOpen(true)}>
                    Show more
                  </WarehouseOverviewButton>
                ) : null}
                <WarehouseOverviewStatusPill>{activityRows.length} events</WarehouseOverviewStatusPill>
              </div>
            }
          >
            <WarehouseOverviewChartPanel>
              {activityRows.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
                  No operations recorded for this bin yet.
                </p>
              ) : (
                <BinOperationsEventList items={previewOps} />
              )}
            </WarehouseOverviewChartPanel>
          </WarehouseOverviewShellSection>
        </div>

        <Sheet open={opsSheetOpen} onOpenChange={setOpsSheetOpen}>
          <SheetContent
            side="right"
            showCloseButton
            className="flex h-full max-h-dvh w-full flex-col gap-0 overflow-hidden border-wh-border bg-wh-page-bg p-0 text-wh-text-primary sm:max-w-2xl"
          >
            <SheetHeader className="border-b border-wh-border px-4 py-4 text-left">
              <SheetTitle className="text-wh-text-primary">All bin operations</SheetTitle>
              <SheetDescription className="text-wh-text-muted">
                {activityRows.length} {activityRows.length === 1 ? 'event' : 'events'} for {header.binCode}
              </SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <BinOperationsEventList items={activityRows} />
            </div>
          </SheetContent>
        </Sheet>

        <WarehouseOverviewShellSection title="Bin contents" action={`${contents.length} lines`}>
          <WarehouseOverviewChartPanel>
            {contents.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
                No stock lines in this bin.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-220der-collapse text-left text-sm">
                  <thead>
                    <tr
                      className="border-b text-[11px] font-medium"
                      style={{ borderColor: 'var(--wh-border)', color: 'var(--wh-text-muted)' }}
                    >
                      <th className="py-2 pr-3">SKU</th>
                      <th className="py-2 pr-3">Name</th>
                      <th className="py-2 pr-3">Lot</th>
                      <th className="py-2 pr-3">Serial</th>
                      <th className="py-2 pr-2 text-right">Available</th>
                      <th className="py-2 pr-2 text-right">Reserved</th>
                      <th className="py-2 pr-2 text-right">Blocked</th>
                      <th className="py-2 pr-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contents.map((row) => (
                      <tr
                        key={row.binStockItemId}
                        className="border-b"
                        style={{ borderColor: 'var(--wh-border)' }}
                      >
                        <td className="py-2 pr-3 font-mono text-xs">
                          <Link
                            href={row.href}
                            className="hover:underline"
                            style={{ color: 'var(--wh-text-primary)' }}
                          >
                            {row.sku}
                          </Link>
                        </td>
                        <td className="max-w-55 truncate py-2 pr-3" title={`${row.name} · Last op: ${row.lastOperationLabel}`}>
                          {row.name}
                        </td>
                        <td className="py-2 pr-3 font-mono text-xs">{row.lotCode ?? '—'}</td>
                        <td className="py-2 pr-3 font-mono text-xs">{row.serialNumber ?? '—'}</td>
                        <td
                          className="py-2 pr-2 text-right tabular-nums"
                          style={{ color: 'var(--wh-status-available)' }}
                        >
                          {row.available.toLocaleString()}
                        </td>
                        <td
                          className="py-2 pr-2 text-right tabular-nums"
                          style={{ color: 'var(--wh-status-full)' }}
                        >
                          {row.reserved.toLocaleString()}
                        </td>
                        <td
                          className="py-2 pr-2 text-right tabular-nums"
                          style={{ color: 'var(--wh-status-blocked)' }}
                        >
                          {row.blocked.toLocaleString()}
                        </td>
                        <td className="py-2 pr-3">
                          <WarehouseOverviewStatusPill tone={stockStatusTone(row.status)}>
                            {row.status.replace(/_/g, ' ')}
                          </WarehouseOverviewStatusPill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-3 text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                  Last operation (line-level): shown per row. Open SKU to jump to the items workspace.
                </p>
              </div>
            )}
          </WarehouseOverviewChartPanel>
        </WarehouseOverviewShellSection>
      </div>
    </main>
  )
}
