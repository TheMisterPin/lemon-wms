'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/users/user-detail-dashboard.md
 */


import Link from 'next/link'
import { useMemo, useState } from 'react'

import { format } from 'date-fns'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { WarehouseOverviewShellSection } from '@/components/primitives/warehouse-overview-primitives'
import type { UserActivityRow, UserDetailDashboardDTO } from '@/types/user-detail-dashboard.types'

function formatTs(value?: string): string {
  if (!value) {
    return '—'
  }

  return format(new Date(value), 'MMM d, yyyy · HH:mm')
}

export function UserDetailDashboard({ data }: { data: UserDetailDashboardDTO }) {
  const [activeActivityTab, setActiveActivityTab] = useState<'ALL' | 'LOGIN' | 'ORDER' | 'MOVEMENT' | 'DEVICE' | 'EXCEPTION'>('ALL')
  const [selectedActivity, setSelectedActivity] = useState<UserActivityRow | null>(null)

  const filteredActivity = useMemo(() => {
    if (activeActivityTab === 'ALL') {
      return data.activity
    }

    if (activeActivityTab === 'LOGIN') {
      return data.activity.filter((row) => row.type === 'LOGIN' || row.type === 'LOGOUT')
    }

    return data.activity.filter((row) => row.type === activeActivityTab)
  }, [activeActivityTab, data.activity])

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

      <WarehouseOverviewShellSection title={`Current Work (${data.currentWork.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: 'var(--wh-text-secondary)' }}>
                <th className="pb-2 text-left font-medium">Order</th>
                <th className="pb-2 text-left font-medium">Type</th>
                <th className="pb-2 text-left font-medium">Progress</th>
                <th className="pb-2 text-left font-medium">Started</th>
                <th className="pb-2 text-left font-medium" />
              </tr>
            </thead>
            <tbody>
              {data.currentWork.map((row) => (
                <tr key={`${row.orderType}:${row.orderId}`} className="border-t" style={{ borderColor: 'var(--wh-border)' }}>
                  <td className="py-2 pr-4" style={{ color: 'var(--wh-text-primary)' }}>{row.orderLabel}</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.orderType}</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.progressPercent}%</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{formatTs(row.startedAt)}</td>
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <WarehouseOverviewShellSection title={`Activity (${filteredActivity.length})`}>
          <div className="mb-3 flex flex-wrap gap-2">
            {(['ALL', 'LOGIN', 'ORDER', 'MOVEMENT', 'DEVICE', 'EXCEPTION'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveActivityTab(tab)}
                className="rounded-full px-3 py-1 text-xs font-medium transition-opacity hover:opacity-90"
                style={{
                  background: activeActivityTab === tab ? 'var(--wh-action-bg)' : 'var(--wh-card-bg)',
                  border: '1px solid var(--wh-border)',
                  color: activeActivityTab === tab ? 'var(--wh-action-text)' : 'var(--wh-text-secondary)'
                }}
              >
                {tab === 'ALL' ? 'All' : tab === 'LOGIN' ? 'Login/Logout' : tab}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--wh-text-secondary)' }}>
                  <th className="pb-2 text-left font-medium">Time</th>
                  <th className="pb-2 text-left font-medium">Type</th>
                  <th className="pb-2 text-left font-medium">Action</th>
                  <th className="pb-2 text-left font-medium">Warehouse</th>
                  <th className="pb-2 text-left font-medium">Entity</th>
                  <th className="pb-2 text-left font-medium">Details</th>
                  <th className="pb-2 text-left font-medium" />
                </tr>
              </thead>
              <tbody>
                {filteredActivity.map((row) => (
                  <tr key={row.activityId} className="border-t" style={{ borderColor: 'var(--wh-border)' }}>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{formatTs(row.occurredAt)}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.type}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-primary)' }}>{row.action}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.warehouseName ?? '—'}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.entityLabel ?? '—'}</td>
                    <td className="max-w-55 truncate py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.details}</td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => setSelectedActivity(row)}
                        className="text-xs hover:underline"
                        style={{ color: 'var(--wh-text-secondary)' }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </WarehouseOverviewShellSection>

        <WarehouseOverviewShellSection title={`Sessions (${data.sessions.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--wh-text-secondary)' }}>
                  <th className="pb-2 text-left font-medium">Login</th>
                  <th className="pb-2 text-left font-medium">Logout</th>
                  <th className="pb-2 text-left font-medium">Duration</th>
                  <th className="pb-2 text-left font-medium">Device</th>
                  <th className="pb-2 text-left font-medium">Warehouse</th>
                </tr>
              </thead>
              <tbody>
                {data.sessions.map((row) => (
                  <tr key={row.sessionId} className="border-t" style={{ borderColor: 'var(--wh-border)' }}>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{formatTs(row.loginAt)}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{formatTs(row.logoutAt)}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.durationLabel ?? '—'}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.deviceCode ?? '—'}</td>
                    <td className="py-2" style={{ color: 'var(--wh-text-secondary)' }}>{row.warehouseName ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </WarehouseOverviewShellSection>
      </div>

      <WarehouseOverviewShellSection title={`Orders (${data.orders.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: 'var(--wh-text-secondary)' }}>
                <th className="pb-2 text-left font-medium">Order</th>
                <th className="pb-2 text-left font-medium">Type</th>
                <th className="pb-2 text-left font-medium">Status</th>
                <th className="pb-2 text-left font-medium">Started</th>
                <th className="pb-2 text-left font-medium" />
              </tr>
            </thead>
            <tbody>
              {data.orders.map((row) => (
                <tr key={`${row.type}:${row.orderId}`} className="border-t" style={{ borderColor: 'var(--wh-border)' }}>
                  <td className="py-2 pr-4" style={{ color: 'var(--wh-text-primary)' }}>{row.orderLabel}</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.type}</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{row.status}</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{formatTs(row.startedAt)}</td>
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

      <Dialog open={selectedActivity !== null} onOpenChange={(open) => {
        if (!open) {
          setSelectedActivity(null)
        }
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Activity</DialogTitle>
          </DialogHeader>

          {selectedActivity ? (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>Action</p>
                <p style={{ color: 'var(--wh-text-primary)' }}>{selectedActivity.action}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>Timestamp</p>
                <p style={{ color: 'var(--wh-text-primary)' }}>{formatTs(selectedActivity.occurredAt)}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>Warehouse</p>
                <p style={{ color: 'var(--wh-text-primary)' }}>{selectedActivity.warehouseName ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>Entity</p>
                <p style={{ color: 'var(--wh-text-primary)' }}>{selectedActivity.entityLabel ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>Details</p>
                <p style={{ color: 'var(--wh-text-primary)' }}>{selectedActivity.details}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>Raw technical details</p>
                <pre
                  className="max-h-56 overflow-auto rounded border p-3 text-xs"
                  style={{
                    background: 'var(--wh-card-bg-soft)',
                    borderColor: 'var(--wh-border)',
                    color: 'var(--wh-text-secondary)'
                  }}
                >
{JSON.stringify(selectedActivity.metadata ?? {}, null, 2)}
                </pre>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
