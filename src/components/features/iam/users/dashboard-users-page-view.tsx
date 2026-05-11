'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/users/dashboard-users-page-view.md
 */

import Link from 'next/link'

import { format } from 'date-fns'

import { useUsersDashboard } from '@/components/features/iam/users/use-users-dashboard'
import { WarehouseOverviewShellSection } from '@/components/primitives/warehouse-overview-primitives'
import { Skeleton } from '@/components/ui/skeleton'

function formatTs(value?: string): string {
  if (!value) {
    return '—'
  }

  return format(new Date(value), 'MMM d, yyyy · HH:mm')
}

export function DashboardUsersPageView({ warehouseId }: { warehouseId?: string }) {
  const { data, isLoading, error, refetch } = useUsersDashboard(warehouseId)

  if (isLoading) {
    return (
      <main className="min-h-screen p-4 xl:p-6" style={{ background: 'var(--wh-page-bg)' }}>
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-28 w-full rounded-2xl bg-wh-card-bg-soft" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-xl bg-wh-card-bg-soft" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-2xl bg-wh-card-bg-soft" />
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
              {error ?? 'Could not load users dashboard.'}
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

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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

        <WarehouseOverviewShellSection title={`Warehouse Summary (${data.warehouseSummaries.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--wh-text-secondary)' }}>
                  <th className="pb-2 text-left font-medium">Warehouse</th>
                  <th className="pb-2 text-left font-medium">Active users</th>
                  <th className="pb-2 text-left font-medium">Idle users</th>
                  <th className="pb-2 text-left font-medium">Total users</th>
                  <th className="pb-2 text-left font-medium">Active orders</th>
                  <th className="pb-2 text-left font-medium">Avg orders/user</th>
                </tr>
              </thead>
              <tbody>
                {data.warehouseSummaries.map((row) => (
                  <tr key={row.warehouseId} className="border-t" style={{ borderColor: 'var(--wh-border)' }}>
                    <td className="py-2 pr-4">
                      <Link href={row.href} className="font-medium hover:underline" style={{ color: 'var(--wh-text-primary)' }}>
                        {row.warehouseName}
                      </Link>
                    </td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.activeUsers}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.idleUsers}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.totalUsers}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.activeOrders}</td>
                    <td className="py-2" style={{ color: 'var(--wh-text-secondary)' }}>{row.averageOrdersPerUser}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </WarehouseOverviewShellSection>

        <WarehouseOverviewShellSection title={`Users (${data.users.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--wh-text-secondary)' }}>
                  <th className="pb-2 text-left font-medium">User</th>
                  <th className="pb-2 text-left font-medium">Role</th>
                  <th className="pb-2 text-left font-medium">Warehouse</th>
                  <th className="pb-2 text-left font-medium">Status</th>
                  <th className="pb-2 text-left font-medium">Active order</th>
                  <th className="pb-2 text-left font-medium">Device</th>
                  <th className="pb-2 text-left font-medium">Last activity</th>
                  <th className="pb-2 text-left font-medium" />
                </tr>
              </thead>
              <tbody>
                {data.users.map((row) => (
                  <tr key={row.userId} className="border-t" style={{ borderColor: 'var(--wh-border)' }}>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-primary)' }}>{row.name}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.role}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.warehouseName ?? '—'}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.status}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.activeOrderLabel ?? '—'}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.deviceCode ?? '—'}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{formatTs(row.lastActivityAt)}</td>
                    <td className="py-2">
                      <Link href={row.href} className="text-xs hover:underline" style={{ color: 'var(--wh-text-secondary)' }}>
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
    </main>
  )
}
