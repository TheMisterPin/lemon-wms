'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/devices/device-detail-dashboard.md
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
import type { DeviceDetailDashboardDTO } from '@/types/device-detail-dashboard.types'

type DeviceDetailDashboardProps = {
  data: DeviceDetailDashboardDTO
}

function humanizeEnum(value: string): string {
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (ch) => ch.toUpperCase())
}

function onlineStatusTone(status: string): WarehouseOverviewTone {
  if (status === 'ACTIVE') {
    return 'success'
  }
  if (status === 'IDLE') {
    return 'warning'
  }

  return 'danger'
}

function authStatusTone(status: string): WarehouseOverviewTone {
  if (status === 'AUTHORIZED') {
    return 'success'
  }
  if (status === 'PENDING') {
    return 'warning'
  }

  return 'danger'
}

function kpiTone(tone: DashboardKpi['tone']): WarehouseOverviewTone {
  return tone
}

function formatTs(iso: string): string {
  return format(new Date(iso), 'MMM d, yyyy · HH:mm')
}

export function DeviceDetailDashboard({ data }: DeviceDetailDashboardProps) {
  const { header, kpis, currentWork, activity } = data

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 xl:p-6">
      {/* Header */}
      <div
        className="rounded-2xl border p-5 xl:p-6"
        style={{
          background: 'var(--wh-card-bg-soft)',
          borderColor: 'var(--wh-border)'
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1
              className="truncate text-xl font-bold xl:text-2xl"
              style={{ color: 'var(--wh-text-primary)' }}
            >
              {header.title}
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--wh-text-muted)' }}>
              {header.subtitle}
            </p>
            {header.lastSeenAt ? (
              <p className="mt-1 text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                Last seen {formatTs(header.lastSeenAt)}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <WarehouseOverviewStatusPill tone={onlineStatusTone(header.onlineStatus)}>
              {humanizeEnum(header.onlineStatus)}
            </WarehouseOverviewStatusPill>
            <WarehouseOverviewStatusPill tone={authStatusTone(header.authorizationStatus)}>
              {humanizeEnum(header.authorizationStatus)}
            </WarehouseOverviewStatusPill>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm" style={{ color: 'var(--wh-text-secondary)' }}>
          <span>
            Code: <span style={{ color: 'var(--wh-text-primary)' }}>{header.deviceCode}</span>
          </span>
          {header.warehouseName ? (
            <span>
              Warehouse: <span style={{ color: 'var(--wh-text-primary)' }}>{header.warehouseName}</span>
            </span>
          ) : null}
          {header.currentUserName ? (
            <span>
              Last user: <span style={{ color: 'var(--wh-text-primary)' }}>{header.currentUserName}</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((kpi) => {
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
              <p className="mt-1 text-lg font-semibold" style={{ color }}>
                {humanizeEnum(kpi.value)}
              </p>
            </div>
          )
        })}
      </div>

      {/* Current Work */}
      <WarehouseOverviewShellSection
        title={`Current Work (${currentWork.length})`}
      >
        {currentWork.length === 0 ? (
          <p className="py-6 text-center text-sm" style={{ color: 'var(--wh-text-muted)' }}>
            No active assignments.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--wh-text-secondary)' }}>
                  <th className="pb-2 text-left font-medium">Order</th>
                  <th className="pb-2 text-left font-medium">Type</th>
                  <th className="pb-2 text-left font-medium">User</th>
                  <th className="pb-2 text-left font-medium">Started</th>
                  <th className="pb-2 text-left font-medium">Progress</th>
                </tr>
              </thead>
              <tbody>
                {currentWork.map((row) => (
                  <tr
                    key={row.orderId}
                    className="border-t"
                    style={{ borderColor: 'var(--wh-border)' }}
                  >
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
                      {humanizeEnum(row.orderType)}
                    </td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>
                      {row.userName ?? '—'}
                    </td>
                    <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>
                      {row.startedAt ? formatTs(row.startedAt) : '—'}
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-1.5 w-24 overflow-hidden rounded-full"
                          style={{ background: 'var(--wh-border)' }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WarehouseOverviewShellSection>

      {/* Activity Timeline */}
      <WarehouseOverviewShellSection
        title={`Device Activity (recent ${activity.length})`}
      >
        {activity.length === 0 ? (
          <p className="py-6 text-center text-sm" style={{ color: 'var(--wh-text-muted)' }}>
            No activity recorded.
          </p>
        ) : (
          <ul className="space-y-3">
            {activity.map((row) => (
              <li
                key={row.id}
                className="flex items-start gap-3 border-b pb-3 last:border-b-0 last:pb-0"
                style={{ borderColor: 'var(--wh-border)' }}
              >
                <div
                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: 'var(--wh-text-secondary)' }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--wh-text-primary)' }}>
                      {humanizeEnum(row.action)}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                      {row.entityType}
                    </span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                    <span>{row.userName}</span>
                    {row.warehouseName ? <span>· {row.warehouseName}</span> : null}
                    <span>· {formatTs(row.occurredAt)}</span>
                  </div>
                  {row.notes ? (
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                      {row.notes}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </WarehouseOverviewShellSection>
    </div>
  )
}
