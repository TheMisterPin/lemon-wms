/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/warehouses/components/bin-grid.md
 */

/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import { PackageOpen } from 'lucide-react'

import { PaginationSelector } from '@/components/shared/pagination-selector'
import { DEFAULT_GENERIC_TABLE_PAGE_SIZE } from '@/types/components/table/generic-table.types'
import type { BinRecord } from './dashboard-types'

function getBinStatus(bin: BinRecord) {
  if (!bin.active) {
    return {
      label: 'Inactive',
      dot: 'var(--wh-text-muted)',
      text: 'var(--wh-text-secondary)'
    }
  }

  if (bin.isBlocked) {
    return {
      label: 'Blocked',
      dot: 'var(--wh-status-blocked)',
      text: 'var(--wh-status-blocked)'
    }
  }

  if (bin.filledPercentage >= 90) {
    return { label: 'Full', dot: 'var(--wh-status-full)', text: 'var(--wh-status-full)' }
  }

  return {
    label: 'Available',
    dot: 'var(--wh-status-available)',
    text: 'var(--wh-status-available)'
  }
}

function getFillBarStyle(bin: BinRecord) {
  if (bin.isBlocked) {
    return { background: 'var(--wh-status-blocked)' }
  }
  if (bin.filledPercentage >= 90) {
    return { background: 'var(--wh-fill-high)' }
  }
  if (bin.filledPercentage >= 60) {
    return { background: 'var(--wh-fill-mid)' }
  }
  if (bin.filledPercentage > 0) {
    return { background: 'var(--wh-fill-low)' }
  }

  return { background: 'var(--wh-text-muted)' }
}

function BinCard({ bin, onViewContents }: { bin: BinRecord; onViewContents?: (binId: string) => void }) {
  const status = getBinStatus(bin)

  const handleClick = () => {
    onViewContents?.(bin.id)
  }

  return (
    <div
      className="group rounded-2xl transition-transform duration-200 hover:-translate-y-0.5"
      style={{
        background: 'var(--wh-card-bg)',
        boxShadow: '0 8px 22px rgba(0,0,0,0.24)',
        border: '1px solid var(--wh-border)'
      }}
    >
      <div className="p-4 xl:p-[18px]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div
              className="text-[17px] font-semibold xl:text-lg"
              style={{ color: 'var(--wh-text-primary)' }}
            >
              {bin.name}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center gap-2 text-xs xl:text-sm"
              style={{ color: status.text }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: status.dot }} />
              <span>{status.label}</span>
            </div>

            <div
              className="rounded-full px-2.5 py-1 text-[11px] xl:text-xs"
              style={{ background: 'var(--wh-card-bg-soft)', color: 'var(--wh-text-secondary)' }}
            >
              {bin.type}
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div
            className="mb-1.5 flex justify-between text-[11px] xl:text-xs"
            style={{ color: 'var(--wh-text-secondary)' }}
          >
            <span>Fill</span>
            <span>{bin.filledPercentage}% · {bin.itemsInBin}</span>
          </div>
          <div className="h-2 rounded-full" style={{ background: 'var(--wh-fill-track)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${bin.filledPercentage}%`, ...getFillBarStyle(bin) }}
            />
          </div>
        </div>

        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={handleClick}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition-all duration-300 opacity-100 md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
            style={{
              background: 'var(--wh-action-bg)',
              border: '1px solid var(--wh-action-border)',
              color: 'var(--wh-action-text)'
            }}
          >
            <PackageOpen size={14} />
            View contents
          </button>
        </div>
      </div>
    </div>
  )
}

function SectionBlock({
  title,
  children,
  action,
  headerRight
}: {
  title: string
  children: React.ReactNode
  action?: string
  headerRight?: React.ReactNode
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
        <div
          className="min-w-0 text-sm font-semibold xl:text-base"
          style={{ color: 'var(--wh-text-primary)' }}
        >
          {title}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action ? (
            <div className="text-[11px] xl:text-xs" style={{ color: 'var(--wh-text-muted)' }}>
              {action}
            </div>
          ) : null}
          {headerRight}
        </div>
      </div>

      <div className="p-4 xl:p-5">{children}</div>
    </section>
  )
}

export function BinGrid({
  bins,
  pageSize: pageSizeProp,
  onViewContents
}: {
  bins: BinRecord[]
  pageSize?: number
  onViewContents?: (binId: string) => void
}) {
  const pageSize = pageSizeProp ?? DEFAULT_GENERIC_TABLE_PAGE_SIZE
  const [page, setPage] = useState(0)

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(bins.length / pageSize)),
    [bins.length, pageSize]
  )

  const safePage = Math.min(page, totalPages - 1)

  useEffect(() => {
    setPage(0)
  }, [bins])

  const visibleBins = useMemo(
    () => bins.slice(safePage * pageSize, safePage * pageSize + pageSize),
    [bins, pageSize, safePage]
  )

  const sectionAction =
    bins.length > 0 ? `${bins.length} total` : 'Storage grid preview'

  return (
    <SectionBlock
      title="Bins"
      action={sectionAction}
      headerRight={
        pageSize > 0 && totalPages > 1 ? (
          <PaginationSelector
            page={safePage}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(0, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          />
        ) : null
      }
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 xl:gap-4">
        {visibleBins.map((bin) => (
          <BinCard key={bin.id} bin={bin} onViewContents={onViewContents} />
        ))}
      </div>
    </SectionBlock>
  )
}
