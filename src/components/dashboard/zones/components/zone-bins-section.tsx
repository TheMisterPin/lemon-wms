'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/zones/components/zone-bins-section.md
 */


import { useState } from 'react'
import Link from 'next/link'

import {
  WarehouseOverviewButton,
  WarehouseOverviewChartPanel,
  WarehouseOverviewShellSection,
  WarehouseOverviewStatusPill
} from '@/components/dashboard/warehouses/components/warehouse-overview-primitives'
import type { WarehouseOverviewTone } from '@/components/dashboard/warehouses/components/warehouse-overview-primitives'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
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

const ZONE_BINS_PREVIEW_COUNT = 4

type ZoneBinsSectionProps = {
  bins: ZoneOverviewBinRow[]
}

export function ZoneBinsSection({ bins }: ZoneBinsSectionProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const previewBins = bins.slice(0, ZONE_BINS_PREVIEW_COUNT)
  const hasMore = bins.length > ZONE_BINS_PREVIEW_COUNT

  return (
    <>
      <WarehouseOverviewShellSection
        title="Bins"
        action={
          hasMore ? (
            <WarehouseOverviewButton
              variant="secondary"
              size="sm"
              onClick={() => setSheetOpen(true)}
            >
              Show more
            </WarehouseOverviewButton>
          ) : null
        }
      >
        <WarehouseOverviewChartPanel>
          <div className="grid grid-cols-1 gap-3">
            {previewBins.map((b) => (
              <Link
                key={b.binId}
                href={`/dashboard/locations/bins/${b.binId}`}
                className="block transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wh-border)]"
              >
                <ZoneBinStockCard bin={b} />
              </Link>
            ))}
          </div>
        </WarehouseOverviewChartPanel>
      </WarehouseOverviewShellSection>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          showCloseButton
          className="flex h-full max-h-[100dvh] w-full flex-col gap-0 overflow-hidden border-[var(--wh-border)] bg-[var(--wh-page-bg)] p-0 text-[var(--wh-text-primary)] sm:max-w-2xl"
        >
          <SheetHeader className="border-b border-[var(--wh-border)] px-4 py-4 text-left">
            <SheetTitle className="text-[var(--wh-text-primary)]">All bins</SheetTitle>
            <SheetDescription className="text-[var(--wh-text-muted)]">
              {bins.length} {bins.length === 1 ? 'bin' : 'bins'} in this zone
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {bins.map((b) => (
                <Link
                  key={`sheet-${b.binId}`}
                  href={`/dashboard/locations/bins/${b.binId}`}
                  className="block transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wh-border)]"
                >
                  <ZoneBinStockCard bin={b} />
                </Link>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
