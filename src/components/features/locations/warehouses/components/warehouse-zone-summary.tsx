'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-zone-summary.md
 */

import {
  WarehouseOverviewButton,
  WarehouseOverviewShellSection
} from '@/components/primitives/warehouse-overview-primitives'

import type { WarehouseZoneSummaryRow } from './warehouse-overview-types'

type WarehouseZoneSummaryProps = {
  zones: WarehouseZoneSummaryRow[]
  maxZones?: number
}

/** Highlights top zones by fill level with stock mix bars. */
export function WarehouseZoneSummary({ zones, maxZones = 3 }: WarehouseZoneSummaryProps) {
  const visible = zones.slice(0, maxZones)

  return (
    <WarehouseOverviewShellSection
      title="Zone summary"
      action={
        <WarehouseOverviewButton variant="ghost" size="sm">
          View stock
        </WarehouseOverviewButton>
      }
    >
      <div className="space-y-2">
        {visible.map((zone) => (
          <a
            key={zone.id}
            href={`/dashboard/locations/zones/${zone.id}`}
            className="block"
            style={{ textDecoration: 'none' }}
          >
            <div
              className="cursor-pointer rounded-lg border p-4 transition hover:border-opacity-100"
              style={{
                borderColor: 'var(--wh-border)',
                background: 'var(--wh-card-bg)'
              }}
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold">{zone.name}</div>
                  <div className="mt-1 text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                    {zone.type}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold">{zone.fill}%</div>
                  <div className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                    Fill level
                  </div>
                </div>
              </div>

              <div
                className="mb-3 flex h-2 overflow-hidden rounded-full"
                style={{ background: 'var(--wh-card-bg-soft)' }}
              >
                <div
                  style={{
                    width: `${(zone.available / (zone.onHand || 1)) * 100}%`,
                    background: 'var(--wh-status-available, #22c55e)'
                  }}
                />
                <div
                  style={{
                    width: `${(zone.reserved / (zone.onHand || 1)) * 100}%`,
                    background: 'var(--wh-status-full, #eab308)'
                  }}
                />
                <div
                  style={{
                    width: `${(zone.blocked / (zone.onHand || 1)) * 100}%`,
                    background: 'var(--wh-status-blocked, #ef4444)'
                  }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                    Available
                  </div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--wh-status-available, #22c55e)' }}>
                    {zone.available.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                    Reserved
                  </div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--wh-status-full, #eab308)' }}>
                    {zone.reserved.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                    Blocked
                  </div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--wh-status-blocked, #ef4444)' }}>
                    {zone.blocked.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </WarehouseOverviewShellSection>
  )
}
