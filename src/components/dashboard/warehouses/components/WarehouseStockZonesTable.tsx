'use client'

import Link from 'next/link'

import type { WarehouseStockDashboardZoneRow } from '@/types/warehouse-stock-dashboard.types'
import {
  WarehouseOverviewButton,
  WarehouseOverviewShellSection
} from './warehouse-overview-primitives'

type WarehouseStockZonesTableProps = {
  zones: WarehouseStockDashboardZoneRow[]
}

export function WarehouseStockZonesTable({ zones }: WarehouseStockZonesTableProps) {
  return (
    <WarehouseOverviewShellSection
      title="Zone stock summary"
      action={
        <WarehouseOverviewButton variant="ghost" size="sm">
          View all
        </WarehouseOverviewButton>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottomColor: 'var(--wh-border)' }} className="border-b">
              <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                Zone
              </th>
              <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                Code
              </th>
              <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                Type
              </th>
              <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                On hand
              </th>
              <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                Available
              </th>
              <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                Reserved
              </th>
              <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                Blocked
              </th>
              <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                Fill %
              </th>
              <th className="px-4 py-3 text-center font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => (
              <tr
                key={zone.zoneId}
                style={{ borderBottomColor: 'var(--wh-border)' }}
                className="border-b hover:opacity-75"
              >
                <td className="px-4 py-3 font-medium">{zone.name}</td>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                  {zone.code}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                  {zone.type}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{zone.totalOnHand.toLocaleString()}</td>
                <td
                  className="px-4 py-3 text-right tabular-nums"
                  style={{ color: 'var(--wh-status-available, #22c55e)' }}
                >
                  {zone.available.toLocaleString()}
                </td>
                <td
                  className="px-4 py-3 text-right tabular-nums"
                  style={{ color: 'var(--wh-status-full, #eab308)' }}
                >
                  {zone.reserved.toLocaleString()}
                </td>
                <td
                  className="px-4 py-3 text-right tabular-nums"
                  style={{ color: 'var(--wh-status-blocked, #ef4444)' }}
                >
                  {zone.blocked.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-medium">{zone.fillPercent}%</td>
                <td className="px-4 py-3 text-center">
                  <Link
                    href={`/dashboard/zones/${zone.zoneId}`}
                    className="inline-flex rounded-xl px-3 py-1.5 text-xs font-medium transition hover:opacity-90"
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--wh-border)',
                      color: 'var(--wh-text-secondary)'
                    }}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WarehouseOverviewShellSection>
  )
}
