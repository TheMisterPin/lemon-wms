'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/stock/inventory-health-dashboard.md
 */


import Link from 'next/link'

import { format } from 'date-fns'

import { WarehouseOverviewShellSection } from '@/components/primitives/warehouse-overview-primitives'
import type { InventoryHealthDashboardDTO } from '@/types/inventory-health-dashboard.types'

function formatTs(value: string): string {
  return format(new Date(value), 'MMM d, yyyy · HH:mm')
}

export function InventoryHealthDashboard({ data }: { data: InventoryHealthDashboardDTO }) {
  return (
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
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {data.kpis.map((kpi) => (
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
            <p className="mt-1 text-lg font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <WarehouseOverviewShellSection title={`Alert Cards (${data.alerts.length})`}>
          <div className="space-y-2">
            {data.alerts.map((alert) => (
              <Link
                key={alert.id}
                href={alert.href}
                className="block rounded-lg border px-3 py-2 text-xs"
                style={{ borderColor: 'var(--wh-border)', color: 'var(--wh-text-secondary)' }}
              >
                <p className="font-semibold" style={{ color: 'var(--wh-text-primary)' }}>{alert.title}</p>
                <p>{alert.entityLabel}</p>
                <p>{alert.severity} · {alert.reason}</p>
              </Link>
            ))}
          </div>
        </WarehouseOverviewShellSection>

        <WarehouseOverviewShellSection title={`Issue Distribution (${data.issueDistribution.length})`}>
          <div className="space-y-2">
            {data.issueDistribution.map((slice) => (
              <div key={slice.type} className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs" style={{ borderColor: 'var(--wh-border)', color: 'var(--wh-text-secondary)' }}>
                <span>{slice.type.replace(/_/g, ' ')}</span>
                <span>{slice.count}</span>
              </div>
            ))}
          </div>
        </WarehouseOverviewShellSection>
      </div>

      <WarehouseOverviewShellSection title="Health Charts">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--wh-border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
              Category Health
            </p>
            <div className="mt-3 space-y-2">
              {data.categoryHealth.map((row) => {
                const total = row.lowStock + row.blocked + row.expiring + row.quarantine
                const lowWidth = total > 0 ? (row.lowStock / total) * 100 : 0
                const blockedWidth = total > 0 ? (row.blocked / total) * 100 : 0
                const expiringWidth = total > 0 ? (row.expiring / total) * 100 : 0
                const quarantineWidth = total > 0 ? (row.quarantine / total) * 100 : 0

                return (
                  <Link key={row.categoryId} href={row.href} className="block">
                    <div className="mb-1 flex items-center justify-between text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                      <span>{row.categoryName}</span>
                      <span>{total}</span>
                    </div>
                    <div className="flex h-2 overflow-hidden rounded-full" style={{ background: 'var(--wh-border)' }}>
                      <div style={{ width: `${lowWidth}%`, background: '#f97316' }} />
                      <div style={{ width: `${blockedWidth}%`, background: '#ef4444' }} />
                      <div style={{ width: `${expiringWidth}%`, background: '#eab308' }} />
                      <div style={{ width: `${quarantineWidth}%`, background: '#a855f7' }} />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--wh-border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
              Warehouse Health Comparison
            </p>
            <div className="mt-3 space-y-2">
              {data.warehouseHealth.map((row) => {
                const total = Math.max(row.issueCount, 1)
                const criticalWidth = (row.criticalCount / total) * 100
                const warningWidth = (row.warningCount / total) * 100

                return (
                  <Link key={row.warehouseId} href={row.href} className="block">
                    <div className="mb-1 flex items-center justify-between text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                      <span>{row.warehouseName}</span>
                      <span>{row.issueCount}</span>
                    </div>
                    <div className="flex h-2 overflow-hidden rounded-full" style={{ background: 'var(--wh-border)' }}>
                      <div style={{ width: `${criticalWidth}%`, background: '#ef4444' }} />
                      <div style={{ width: `${warningWidth}%`, background: '#eab308' }} />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </WarehouseOverviewShellSection>

      <WarehouseOverviewShellSection title={`Health Issues (${data.issues.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: 'var(--wh-text-secondary)' }}>
                <th className="pb-2 text-left font-medium">Issue</th>
                <th className="pb-2 text-left font-medium">Type</th>
                <th className="pb-2 text-left font-medium">Entity</th>
                <th className="pb-2 text-left font-medium">Warehouse</th>
                <th className="pb-2 text-left font-medium">Severity</th>
                <th className="pb-2 text-left font-medium">Quantity</th>
                <th className="pb-2 text-left font-medium">Detected</th>
                <th className="pb-2 text-left font-medium" />
              </tr>
            </thead>
            <tbody>
              {data.issues.map((issue) => (
                <tr key={issue.issueId} className="border-t" style={{ borderColor: 'var(--wh-border)' }}>
                  <td className="py-2 pr-4" style={{ color: 'var(--wh-text-primary)' }}>{issue.issueId}</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{issue.type}</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{issue.entityLabel}</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{issue.warehouseName}</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{issue.severity}</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{issue.quantity ?? '—'}</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{formatTs(issue.detectedAt)}</td>
                  <td className="py-2">
                    <Link href={issue.href} className="text-xs hover:underline" style={{ color: 'var(--wh-text-secondary)' }}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </WarehouseOverviewShellSection>
    </div>
  )
}
