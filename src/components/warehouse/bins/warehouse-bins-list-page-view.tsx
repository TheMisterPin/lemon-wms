'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import { Search, ShelvingUnit } from 'lucide-react'

import {
  WarehouseOverviewShellSection,
  WarehouseOverviewStatusPill,
  type WarehouseOverviewTone
} from '@/components/primitives/warehouse-overview-primitives'
import { PaginationSelector } from '@/components/shared/pagination-selector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { WarehouseBinRecord } from '@/components/warehouse/orders/types'
import { useWarehouseHome } from '@/components/warehouse/orders/use-warehouse-home'

type BinQuickFilter = 'all' | 'highFill' | 'empty'
type BinMetric = { label: string, value: number, filter: BinQuickFilter }

function numberValue(value: number | string | null | undefined): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)

    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

function fillPercent(bin: WarehouseBinRecord): number {
  if (typeof bin.filledPercentage === 'number' && Number.isFinite(bin.filledPercentage)) {
    return Math.min(100, Math.max(0, Math.round(bin.filledPercentage)))
  }

  const current = numberValue(bin.currentCapacity)
  const max = numberValue(bin.maxCapacity)

  if (max <= 0) {
    return 0
  }

  return Math.min(100, Math.max(0, Math.round((current / max) * 100)))
}

function statusForBin(bin: WarehouseBinRecord): { label: string, tone: WarehouseOverviewTone } {
  const fill = fillPercent(bin)

  if ('isBlocked' in bin && bin.isBlocked === true) {
    return { label: 'Blocked', tone: 'danger' }
  }

  if (fill >= 90) {
    return { label: 'Full', tone: 'warning' }
  }

  if (fill <= 0 && bin.itemsInBin <= 0) {
    return { label: 'Empty', tone: 'neutral' }
  }

  return { label: 'Available', tone: 'success' }
}

function BinFillBar({ bin }: { bin: WarehouseBinRecord }) {
  const fill = fillPercent(bin)
  const tone = fill >= 90 ? 'var(--wh-status-full)' : 'var(--wh-status-available)'

  return (
    <div className="mt-3">
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
        <span style={{ color: 'var(--wh-text-muted)' }}>Fill</span>
        <span className="font-mono" style={{ color: 'var(--wh-text-secondary)' }}>
          {fill}%
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full"
        style={{ background: 'var(--wh-card-bg-soft)' }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${fill}%`, background: tone }}
        />
      </div>
    </div>
  )
}

function BinCard({ bin }: { bin: WarehouseBinRecord }) {
  const status = statusForBin(bin)

  return (
    <Link
      href={`/warehouse/bins/${encodeURIComponent(bin.id)}`}
      className="block rounded-xl border p-4 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wh-border)]"
      style={{
        background: 'var(--wh-card-bg)',
        borderColor: 'var(--wh-border)'
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold leading-tight" style={{ color: 'var(--wh-text-primary)' }}>
            {bin.name}
          </h3>
          <p className="mt-1 truncate font-mono text-xs" style={{ color: 'var(--wh-text-muted)' }}>
            {bin.code}
          </p>
        </div>
        <WarehouseOverviewStatusPill tone={status.tone}>{status.label}</WarehouseOverviewStatusPill>
      </div>

      <BinFillBar bin={bin} />

      <div className="mt-3 flex items-center justify-between gap-3 text-sm">
        <span style={{ color: 'var(--wh-text-muted)' }}>{bin.type}</span>
        <span className="font-medium tabular-nums" style={{ color: 'var(--wh-text-secondary)' }}>
          {bin.itemsInBin.toLocaleString()} SKUs
        </span>
      </div>
    </Link>
  )
}

function getResponsivePageSize(): number {
  if (typeof window === 'undefined') {
    return 9
  }

  if (window.matchMedia('(min-width: 1280px)').matches) {
    return 9
  }

  if (window.matchMedia('(min-width: 768px)').matches) {
    return 6
  }

  return 3
}

export function WarehouseBinsListPageView() {
  const { isLoading, error, refetch, bins, warehouseInfo } = useWarehouseHome()
  const [searchText, setSearchText] = useState('')
  const [quickFilter, setQuickFilter] = useState<BinQuickFilter>('all')
  const [pageSize, setPageSize] = useState(9)
  const [page, setPage] = useState(0)

  useEffect(() => {
    const updatePageSize = () => {
      const nextPageSize = getResponsivePageSize()

      setPageSize((currentPageSize) => {
        if (currentPageSize === nextPageSize) {
          return currentPageSize
        }

        setPage(0)

        return nextPageSize
      })
    }

    updatePageSize()
    window.addEventListener('resize', updatePageSize)

    return () => window.removeEventListener('resize', updatePageSize)
  }, [])

  const filteredBins = useMemo(() => {
    const query = searchText.trim().toLowerCase()
    const quickFiltered = bins.records.filter((bin) => {
      if (quickFilter === 'highFill') {
        return fillPercent(bin) >= 90
      }

      if (quickFilter === 'empty') {
        return fillPercent(bin) <= 0 && bin.itemsInBin <= 0
      }

      return true
    })

    if (!query) {
      return quickFiltered
    }

    return quickFiltered.filter((bin) => {
      const haystack = `${bin.code} ${bin.name} ${bin.type}`.toLowerCase()

      return haystack.includes(query)
    })
  }, [bins.records, quickFilter, searchText])

  const summary = useMemo(() => {
    const highFill = bins.records.filter((bin) => fillPercent(bin) >= 90).length
    const empty = bins.records.filter((bin) => fillPercent(bin) <= 0 && bin.itemsInBin <= 0).length

    return {
      total: bins.records.length,
      highFill,
      empty
    }
  }, [bins.records])
  const totalPages = Math.max(1, Math.ceil(filteredBins.length / pageSize))
  const safePage = Math.min(page, totalPages - 1)
  const pagedBins = useMemo(
    () => filteredBins.slice(safePage * pageSize, (safePage + 1) * pageSize),
    [filteredBins, safePage, pageSize]
  )
  const metrics = useMemo<BinMetric[]>(
    () => [
      { label: 'Total', value: summary.total, filter: 'all' },
      { label: 'High fill', value: summary.highFill, filter: 'highFill' },
      { label: 'Empty', value: summary.empty, filter: 'empty' }
    ],
    [summary]
  )

  if (isLoading) {
    return (
      <main className="min-h-screen p-4 xl:p-6" style={{ background: 'var(--wh-page-bg)' }}>
        <div
          className="mx-auto max-w-7xl rounded-xl border px-6 py-10 text-center text-sm"
          style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)', color: 'var(--wh-text-muted)' }}
        >
          Loading bins...
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen p-4 xl:p-6" style={{ background: 'var(--wh-page-bg)' }}>
        <div
          className="mx-auto max-w-lg rounded-xl border px-6 py-10 text-center"
          style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--wh-status-blocked)' }}>{error}</p>
          <Button type="button" className="mt-4" onClick={refetch}>
            Retry
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen p-4 pb-20 xl:p-6 xl:pb-20"
      style={{
        background: 'var(--wh-page-bg)',
        color: 'var(--wh-text-primary)'
      }}
    >
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--wh-text-muted)' }}>
              <ShelvingUnit className="size-4" />
              <span>{warehouseInfo?.zoneName || 'Current zone'}</span>
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Bins</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--wh-text-muted)' }}>
              Open a bin to view contents, load items to trolley, or unload trolley stock.
            </p>
          </div>
          <WarehouseOverviewStatusPill tone="success">
            {summary.total} total
          </WarehouseOverviewStatusPill>
        </header>

        <div className="grid grid-cols-3 gap-3">
          {metrics.map((metric) => (
            <button
              key={metric.label}
              type="button"
              className="rounded-xl border p-3 text-left transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wh-border)]"
              aria-pressed={quickFilter === metric.filter}
              onClick={() => {
                setQuickFilter(metric.filter)
                setPage(0)
              }}
              style={{
                background: quickFilter === metric.filter ? 'var(--wh-card-bg)' : 'var(--wh-card-bg-soft)',
                borderColor: quickFilter === metric.filter ? 'var(--wh-status-available)' : 'var(--wh-border)'
              }}
            >
              <p className="text-2xl font-semibold tabular-nums">{metric.value}</p>
              <p className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>{metric.label}</p>
            </button>
          ))}
        </div>

        <WarehouseOverviewShellSection
          title={quickFilter === 'all' ? 'Zone bins' : quickFilter === 'highFill' ? 'High fill bins' : 'Empty bins'}
          action={
            <div className="relative w-48 sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" style={{ color: 'var(--wh-text-muted)' }} />
              <Input
                value={searchText}
                onChange={(event) => {
                  setSearchText(event.target.value)
                  setPage(0)
                }}
                placeholder="Search bins..."
                aria-label="Search bins"
                className="h-9 pl-9"
              />
            </div>
          }
        >
          {filteredBins.length === 0 ? (
            <div
              className="rounded-xl border border-dashed px-4 py-8 text-center text-sm"
              style={{ borderColor: 'var(--wh-border)', color: 'var(--wh-text-muted)' }}
            >
              No bins match this search.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {pagedBins.map((bin) => (
                  <BinCard key={bin.id} bin={bin} />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4" style={{ borderColor: 'var(--wh-border)' }}>
                <p className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                  Showing {pagedBins.length} of {filteredBins.length}
                </p>
                <PaginationSelector
                  page={safePage}
                  totalPages={totalPages}
                  onPrev={() => setPage((currentPage) => Math.max(0, currentPage - 1))}
                  onNext={() => setPage((currentPage) => Math.min(totalPages - 1, currentPage + 1))}
                />
              </div>
            </>
          )}
        </WarehouseOverviewShellSection>
      </div>
    </main>
  )
}
