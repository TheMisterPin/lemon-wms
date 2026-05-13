'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/zones/components/zone-bins-section.md
 */

import Link from 'next/link'

import {
  DashboardEntityPreviewSection
} from '@/components/primitives/dashboard'
import {
  WarehouseOverviewStatusPill
} from '@/components/primitives/warehouse-overview-primitives'
import type { WarehouseOverviewTone } from '@/components/primitives/warehouse-overview-primitives'
import type { ZoneOverviewBinRow } from '@/types/zone-overview-dashboard.types'

function statusTone(rowStatus: ZoneOverviewBinRow['rowStatus']): WarehouseOverviewTone {
  if (rowStatus === 'BLOCKED') {
    return 'danger'
  }
  if (rowStatus === 'FULL') {
    return 'warning'
  }
  if (rowStatus === 'EMPTY') {
    return 'neutral'
  }

  return 'success'
}

type ZoneBinAvailabilityBarProps = {
  available: number
  reserved: number
  blocked: number
}

function ZoneBinAvailabilityBar({ available, reserved, blocked }: ZoneBinAvailabilityBarProps) {
  const total = available + reserved + blocked || 1

  return (
    <div className="flex h-2 overflow-hidden rounded-full" style={{ background: 'var(--wh-card-bg-soft, #171c24)' }}>
      <div style={{ width: `${(available / total) * 100}%`, background: 'var(--wh-status-available, #22c55e)' }} />
      <div style={{ width: `${(reserved / total) * 100}%`, background: 'var(--wh-status-full, #eab308)' }} />
      <div style={{ width: `${(blocked / total) * 100}%`, background: 'var(--wh-status-blocked, #ef4444)' }} />
    </div>
  )
}

type ZoneBinStockCardProps = {
  bin: ZoneOverviewBinRow
}

export function ZoneBinStockCard({ bin }: ZoneBinStockCardProps) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: 'var(--wh-card-bg)', borderColor: 'var(--wh-border)' }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-sm font-semibold">{bin.code}</div>
          <div className="mt-1 text-xs" style={{ color: 'var(--wh-text-muted)' }}>
            {bin.binType} · {bin.distinctItems} SKUs · {bin.fillPercent}% capacity
          </div>
        </div>
        <WarehouseOverviewStatusPill tone={statusTone(bin.rowStatus)}>{bin.rowStatus}</WarehouseOverviewStatusPill>
      </div>
      <div className="mt-3">
        <ZoneBinAvailabilityBar available={bin.available} reserved={bin.reserved} blocked={bin.blocked} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
        <div>
          <span style={{ color: 'var(--wh-status-available, #22c55e)' }}>{bin.available.toLocaleString()}</span> avail
        </div>
        <div>
          <span style={{ color: 'var(--wh-status-full, #eab308)' }}>{bin.reserved.toLocaleString()}</span> res
        </div>
        <div>
          <span style={{ color: 'var(--wh-status-blocked, #ef4444)' }}>{bin.blocked.toLocaleString()}</span> blk
        </div>
      </div>
    </div>
  )
}

type ZoneBinsSectionProps = {
  bins: ZoneOverviewBinRow[]
}

export function ZoneBinsSection({ bins }: ZoneBinsSectionProps) {
  return (
    <DashboardEntityPreviewSection
      title="Bins"
      items={bins}
      getKey={(bin) => bin.binId}
      sheetTitle="All bins"
      sheetDescription={`${bins.length} ${bins.length === 1 ? 'bin' : 'bins'} in this zone`}
      emptyMessage="No bins found in this zone."
      renderItem={(bin) => (
        <Link
          prefetch={false}
          href={`/dashboard/locations/bins/${bin.binId}`}
          className="block transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wh-border)]"
        >
          <ZoneBinStockCard bin={bin} />
        </Link>
      )}
    />
  )
}
