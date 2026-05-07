'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/orders/order-detail-dashboard.md
 */


import Link from 'next/link'

import { format } from 'date-fns'

import {
  WarehouseOverviewShellSection,
  WarehouseOverviewStatusPill,
  warehouseOverviewToneStyles,
  type WarehouseOverviewTone
} from '@/components/primitives/warehouse-overview-primitives'
import type { DashboardKpi } from '@/types/bin-detail-dashboard.types'
import type { OrderDetailDashboardDTO } from '@/types/order-detail-dashboard.types'

function humanize(value: string): string {
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatTs(value: string): string {
  return format(new Date(value), 'MMM d, yyyy · HH:mm')
}

function kpiTone(tone: DashboardKpi['tone']): WarehouseOverviewTone {
  if (tone === 'green') {
    return 'success'
  }
  if (tone === 'yellow') {
    return 'warning'
  }
  if (tone === 'red') {
    return 'danger'
  }

  return 'neutral'
}

function lineTone(status: string): WarehouseOverviewTone {
  if (status === 'COMPLETED') {
    return 'success'
  }
  if (status === 'PARTIAL') {
    return 'warning'
  }
  if (status === 'EXCEPTION') {
    return 'danger'
  }

  return 'neutral'
}

export function OrderDetailDashboard({ data }: { data: OrderDetailDashboardDTO }) {
  return (
    <main className="min-h-screen" style={{ background: 'var(--wh-page-bg)' }}>
      <div className="mx-auto max-w-7xl space-y-6 p-4 xl:p-6">
        <div
          className="rounded-2xl border p-5 xl:p-6"
          style={{
            background: 'var(--wh-card-bg-soft)',
            borderColor: 'var(--wh-border)'
          }}
        >
          <h1 className="text-xl font-bold xl:text-2xl" style={{ color: 'var(--wh-text-primary)' }}>
            {data.header.title}
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--wh-text-muted)' }}>
            {data.header.subtitle}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <WarehouseOverviewStatusPill tone="neutral">{humanize(data.header.orderType)}</WarehouseOverviewStatusPill>
            <WarehouseOverviewStatusPill tone="success">Progress {data.header.progressPercent}%</WarehouseOverviewStatusPill>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {data.kpis.map((kpi) => {
            const color = warehouseOverviewToneStyles[kpiTone(kpi.tone)].icon

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
                <p className="mt-1 text-lg font-semibold" style={{ color }}>
                  {kpi.value}
                </p>
              </div>
            )
          })}
        </div>

        <WarehouseOverviewShellSection title={`Lines (${data.lines.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--wh-text-secondary)' }}>
                  <th className="pb-2 text-left font-medium">SKU</th>
                  <th className="pb-2 text-left font-medium">Name</th>
                  <th className="pb-2 text-left font-medium">Expected</th>
                  <th className="pb-2 text-left font-medium">Processed</th>
                  <th className="pb-2 text-left font-medium">Remaining</th>
                  <th className="pb-2 text-left font-medium">Status</th>
                  <th className="pb-2 text-left font-medium" />
                </tr>
              </thead>
              <tbody>
                {data.lines.map((line) => (
                  <tr key={line.lineId} className="border-t" style={{ borderColor: 'var(--wh-border)' }}>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-primary)' }}>{line.sku}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{line.name}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{line.expectedQty} {line.uom}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{line.processedQty} {line.uom}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{line.remainingQty} {line.uom}</td>
                    <td className="py-2 pr-4">
                      <WarehouseOverviewStatusPill tone={lineTone(line.status)}>{humanize(line.status)}</WarehouseOverviewStatusPill>
                    </td>
                    <td className="py-2">
                      <Link href={line.href} className="text-xs hover:underline" style={{ color: 'var(--wh-text-secondary)' }}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </WarehouseOverviewShellSection>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <WarehouseOverviewShellSection title={`Assignments (${data.assignments.length})`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ color: 'var(--wh-text-secondary)' }}>
                    <th className="pb-2 text-left font-medium">User</th>
                    <th className="pb-2 text-left font-medium">Status</th>
                    <th className="pb-2 text-left font-medium">Started</th>
                    <th className="pb-2 text-left font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {data.assignments.map((row) => (
                    <tr key={row.assignmentId} className="border-t" style={{ borderColor: 'var(--wh-border)' }}>
                      <td className="py-2 pr-4" style={{ color: 'var(--wh-text-primary)' }}>{row.userName}</td>
                      <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{humanize(row.status)}</td>
                      <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.startedAt ? formatTs(row.startedAt) : '—'}</td>
                      <td className="py-2" style={{ color: 'var(--wh-text-secondary)' }}>{row.durationLabel ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </WarehouseOverviewShellSection>

          <WarehouseOverviewShellSection title={`Activity (${data.activity.length})`}>
            <ul className="space-y-3">
              {data.activity.map((row) => (
                <li key={row.activityId} className="border-b pb-3 last:border-b-0" style={{ borderColor: 'var(--wh-border)' }}>
                  <div className="text-sm font-medium" style={{ color: 'var(--wh-text-primary)' }}>
                    {humanize(row.action)}
                  </div>
                  <div className="mt-0.5 text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                    {row.userName} · {formatTs(row.occurredAt)}
                  </div>
                  <div className="mt-0.5 text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                    {row.details}
                  </div>
                </li>
              ))}
            </ul>
          </WarehouseOverviewShellSection>
        </div>

        <WarehouseOverviewShellSection title={`Movements (${data.movements.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--wh-text-secondary)' }}>
                  <th className="pb-2 text-left font-medium">Time</th>
                  <th className="pb-2 text-left font-medium">SKU</th>
                  <th className="pb-2 text-left font-medium">From</th>
                  <th className="pb-2 text-left font-medium">To</th>
                  <th className="pb-2 text-left font-medium">Qty</th>
                  <th className="pb-2 text-left font-medium">User</th>
                  <th className="pb-2 text-left font-medium">BOE</th>
                </tr>
              </thead>
              <tbody>
                {data.movements.map((row) => (
                  <tr key={row.movementId} className="border-t" style={{ borderColor: 'var(--wh-border)' }}>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{formatTs(row.occurredAt)}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-primary)' }}>{row.sku}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.fromBinCode ?? '—'}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.toBinCode ?? '—'}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.quantity}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.userName}</td>
                    <td className="py-2" style={{ color: 'var(--wh-text-secondary)' }}>{row.boeId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </WarehouseOverviewShellSection>
      </div>
    </main>
  )
}
