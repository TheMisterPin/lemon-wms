'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/devices/dashboard-devices-page-view.md
 */


import Link from 'next/link'
import { Package2, Router, Shield, Smartphone } from 'lucide-react'

import { DashboardDevicesPageSkeleton } from '@/components/dashboard/devices/dashboard-devices-page-skeleton'
import { useDevicesDashboard } from '@/components/dashboard/devices/use-devices-dashboard'

function KpiCard({
  icon: Icon,
  label,
  value,
  helper
}: {
  icon: typeof Smartphone
  label: string
  value: string
  helper: string
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: 'var(--wh-card-bg)',
        border: '1px solid var(--wh-border)',
        boxShadow: '0 8px 22px rgba(0,0,0,0.24)'
      }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--wh-text-muted)' }}>
          {label}
        </div>
        <Icon className="size-4" style={{ color: 'var(--wh-text-secondary)' }} />
      </div>
      <div className="text-3xl font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
        {value}
      </div>
      <div className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--wh-text-muted)' }}>
        {helper}
      </div>
    </div>
  )
}

function SectionShell({
  title,
  action,
  children
}: {
  title: string
  action?: string
  children: React.ReactNode
}) {
  return (
    <section
      className="rounded-2xl"
      style={{
        background: 'var(--wh-card-bg-soft)',
        border: '1px solid var(--wh-border)'
      }}
    >
      <div
        className="flex items-center justify-between gap-2 border-b px-4 py-3 xl:px-5"
        style={{ borderColor: 'var(--wh-border)' }}
      >
        <div className="text-sm font-semibold xl:text-base" style={{ color: 'var(--wh-text-primary)' }}>
          {title}
        </div>
        {action ? (
          <div className="text-[11px] xl:text-xs" style={{ color: 'var(--wh-text-muted)' }}>
            {action}
          </div>
        ) : null}
      </div>
      <div className="p-4 xl:p-5">{children}</div>
    </section>
  )
}

function StatusPill({ label }: { label: string }) {
  return (
    <div
      className="rounded-full px-3 py-2 text-xs font-medium"
      style={{
        background: 'var(--wh-card-bg)',
        border: '1px solid var(--wh-border)',
        color: 'var(--wh-text-primary)'
      }}
    >
      {label}
    </div>
  )
}

function formatLastSeen(value?: string) {
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

export function DashboardDevicesPageView() {
  const { data, isLoading, error, refetch } = useDevicesDashboard()

  if (isLoading && !data) {
    return <DashboardDevicesPageSkeleton />
  }

  if (error !== null || data === null) {
    return (
      <div
        className="min-h-screen p-6"
        style={{ background: 'var(--wh-page-bg)', color: 'var(--wh-text-primary)' }}
      >
        <div
          className="mx-auto max-w-lg rounded-xl border px-6 py-8 text-center"
          style={{
            borderColor: 'var(--wh-border)',
            background: 'var(--wh-card-bg-soft)'
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: 'var(--wh-text-muted)' }}>
            {error ?? 'Could not load devices dashboard.'}
          </p>
          <button
            type="button"
            className="mt-6 rounded-lg px-4 py-2 text-sm font-medium"
            style={{
              background: 'var(--wh-card-bg)',
              border: '1px solid var(--wh-border)',
              color: 'var(--wh-text-primary)'
            }}
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="mx-auto min-h-screen max-w-7xl space-y-8 p-4 xl:space-y-10 xl:p-6"
      style={{ background: 'var(--wh-page-bg)' }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--wh-text-primary)' }}>
            {data.header.title}
          </h1>
          <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
            {data.header.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium" style={{ background: 'var(--wh-card-bg)', border: '1px solid var(--wh-border)', color: 'var(--wh-text-secondary)' }}>
          <Smartphone className="size-4" /> Overview route: /dashboard/auth/devices
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {data.kpis.map((kpi, index) => {
          const icon = index < 2 ? Smartphone : index < 4 ? Shield : index === 4 ? Router : Package2

          return (
            <KpiCard
              key={kpi.label}
              icon={icon}
              label={kpi.label}
              value={String(kpi.value)}
              helper={kpi.helper}
            />
          )
        })}
      </div>

      <SectionShell title="Status tabs" action="Spec parity with operational filters comes next">
        <div className="flex flex-wrap gap-3">
          {data.tabs.map((tab) => (
            <StatusPill key={tab.key} label={`${tab.label} · ${tab.count.toLocaleString()}`} />
          ))}
        </div>
      </SectionShell>

      <SectionShell title="Devices" action={`${data.devices.length.toLocaleString()} rows`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr style={{ color: 'var(--wh-text-muted)' }}>
                <th className="pb-3 pr-4 font-medium">Device</th>
                <th className="pb-3 pr-4 font-medium">Warehouse</th>
                <th className="pb-3 pr-4 font-medium">User</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium">Authorization</th>
                <th className="pb-3 pr-4 font-medium">Last seen</th>
                <th className="pb-3 pr-4 font-medium">Current order</th>
                <th className="pb-3 font-medium">View</th>
              </tr>
            </thead>
            <tbody>
              {data.devices.map((row) => (
                <tr key={row.deviceId} className="border-t align-top" style={{ borderColor: 'var(--wh-border)' }}>
                  <td className="py-3 pr-4">
                    <div className="font-medium" style={{ color: 'var(--wh-text-primary)' }}>{row.label}</div>
                    <div className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>{row.code}</div>
                  </td>
                  <td className="py-3 pr-4" style={{ color: 'var(--wh-text-primary)' }}>{row.warehouseName ?? '—'}</td>
                  <td className="py-3 pr-4" style={{ color: 'var(--wh-text-primary)' }}>{row.userName ?? '—'}</td>
                  <td className="py-3 pr-4" style={{ color: 'var(--wh-text-primary)' }}>{row.onlineStatus}</td>
                  <td className="py-3 pr-4" style={{ color: 'var(--wh-text-primary)' }}>{row.authorizationStatus}</td>
                  <td className="py-3 pr-4" style={{ color: 'var(--wh-text-primary)' }}>{formatLastSeen(row.lastSeenAt)}</td>
                  <td className="py-3 pr-4" style={{ color: 'var(--wh-text-primary)' }}>{row.currentOrderLabel ?? '—'}</td>
                  <td className="py-3">
                    <Link href={row.href} className="text-sm font-medium" style={{ color: 'var(--wh-status-available)' }}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionShell>

      <SectionShell title="Trolleys" action={`${data.trolleys.length.toLocaleString()} rows`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr style={{ color: 'var(--wh-text-muted)' }}>
                <th className="pb-3 pr-4 font-medium">Trolley</th>
                <th className="pb-3 pr-4 font-medium">Device</th>
                <th className="pb-3 pr-4 font-medium">User</th>
                <th className="pb-3 pr-4 font-medium">Warehouse</th>
                <th className="pb-3 pr-4 font-medium">Items</th>
                <th className="pb-3 pr-4 font-medium">Orders linked</th>
                <th className="pb-3 font-medium">View</th>
              </tr>
            </thead>
            <tbody>
              {data.trolleys.map((row) => (
                <tr key={row.trolleyId} className="border-t align-top" style={{ borderColor: 'var(--wh-border)' }}>
                  <td className="py-3 pr-4">
                    <div className="font-medium" style={{ color: 'var(--wh-text-primary)' }}>{row.code}</div>
                    <div className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>{row.trolleyId.slice(0, 8)}</div>
                  </td>
                  <td className="py-3 pr-4" style={{ color: 'var(--wh-text-primary)' }}>{row.deviceCode ?? '—'}</td>
                  <td className="py-3 pr-4" style={{ color: 'var(--wh-text-primary)' }}>{row.userName ?? '—'}</td>
                  <td className="py-3 pr-4" style={{ color: 'var(--wh-text-primary)' }}>{row.warehouseName}</td>
                  <td className="py-3 pr-4" style={{ color: 'var(--wh-text-primary)' }}>{row.itemCount.toLocaleString()}</td>
                  <td className="py-3 pr-4" style={{ color: 'var(--wh-text-primary)' }}>{row.linkedOrdersCount.toLocaleString()}</td>
                  <td className="py-3">
                    <Link href={row.href} className="text-sm font-medium" style={{ color: 'var(--wh-status-available)' }}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionShell>
    </div>
  )
}
