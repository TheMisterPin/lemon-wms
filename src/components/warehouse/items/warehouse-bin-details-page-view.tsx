'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/warehouse/items/warehouse-bin-details-page-view.md
 */

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import {
  ArrowLeft,
  Boxes,
  ChevronDown,
  ChevronUp,
  ClipboardX,
  Package,
  SlidersHorizontal,
  Truck,
  XCircle
} from 'lucide-react'

import {
  WarehouseOverviewShellSection,
  WarehouseOverviewStatusPill,
  type WarehouseOverviewTone
} from '@/components/primitives/warehouse-overview-primitives'
import { PaginationSelector } from '@/components/shared/pagination-selector'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useBinDetails } from '@/components/warehouse/items/use-bin-details'
import { useLoadItemToTrolley } from '@/components/warehouse/items/use-load-item-to-trolley'
import AddItemToBinModal from '@/components/warehouse/modals/add-item-to-bin-modal'
import LoadItemToTrolleyModal from '@/components/warehouse/modals/load-item-to-trolley-modal'
import { WarehouseExpandableSearch } from '@/components/warehouse/primitives/warehouse-expandable-search'
import { useAuth } from '@/lib/auth/use-auth'
import type { BinContentTableRowDto } from '@/types/dto/locations/bin-contents'

const CONTENT_PAGE_SIZE = 6
const STATUS_ORDER: Record<string, number> = {
  AVAILABLE: 0,
  RESERVED: 1,
  BLOCKED: 2
}

type StockStatusFilter = 'AVAILABLE' | 'RESERVED' | 'BLOCKED'
type QuantitySort = 'desc' | 'asc'

function statusTone(status: string): WarehouseOverviewTone {
  if (status === 'AVAILABLE') {
    return 'success'
  }

  if (status === 'BLOCKED') {
    return 'danger'
  }

  if (status === 'RESERVED' || status === 'IN_TRANSIT') {
    return 'warning'
  }

  return 'neutral'
}

function formatQuantity(value: number | string): string {
  const numeric = Number(value)

  if (!Number.isFinite(numeric)) {
    return String(value)
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2
  }).format(numeric)
}

function statusColor(status: string): string {
  if (status === 'AVAILABLE') {
    return 'var(--wh-status-available)'
  }

  if (status === 'RESERVED') {
    return 'var(--wh-status-full)'
  }

  if (status === 'BLOCKED') {
    return 'var(--wh-status-blocked)'
  }

  return 'var(--wh-text-muted)'
}

function unavailableButtonStyle(status: string) {
  const color = statusColor(status)

  return {
    background: `color-mix(in srgb, ${color} 10%, transparent)`,
    borderColor: `color-mix(in srgb, ${color} 30%, var(--wh-border))`,
    color
  }
}

function sortByStatusThenQuantity(a: BinContentTableRowDto, b: BinContentTableRowDto, direction: QuantitySort) {
  const statusDelta = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99)

  if (statusDelta !== 0) {
    return statusDelta
  }

  const quantityDelta = Number(a.statusQuantity || 0) - Number(b.statusQuantity || 0)

  return direction === 'asc' ? quantityDelta : -quantityDelta
}

function nextStatusFilters(
  current: Record<StockStatusFilter, boolean>,
  status: StockStatusFilter,
  checked: boolean
): Record<StockStatusFilter, boolean> {
  const next = {
    ...current,
    [status]: checked
  }

  if (!next.AVAILABLE && !next.RESERVED && !next.BLOCKED) {
    return current
  }

  return next
}

export function WarehouseBinDetailsPageView() {
  const params = useParams<{ id: string }>()
  const binId = params?.id ?? ''
  const { warehouse } = useAuth()
  const { bin, items, contentRows, isLoading, error, occupancy, refresh } = useBinDetails(binId)
  const loadModal = useLoadItemToTrolley(binId, refresh)
  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(0)
  const [isKpiOpen, setIsKpiOpen] = useState(false)
  const [quantitySort, setQuantitySort] = useState<QuantitySort>('desc')
  const [statusFilters, setStatusFilters] = useState<Record<StockStatusFilter, boolean>>({
    AVAILABLE: true,
    RESERVED: true,
    BLOCKED: true
  })
  const canManuallyAddItems = warehouse?.user.role === 'OWNER' || warehouse?.user.role === 'WAREHOUSE_MANAGER'
  const allStatusesSelected = statusFilters.AVAILABLE && statusFilters.RESERVED && statusFilters.BLOCKED

  const visibleRows = useMemo(
    () => contentRows.filter((row) => row.status !== 'IN_TRANSIT'),
    [contentRows]
  )

  const filteredRows = useMemo(() => {
    const query = searchText.trim().toLowerCase()

    const statusFiltered = visibleRows.filter((row) => (
      row.status === 'AVAILABLE' || row.status === 'RESERVED' || row.status === 'BLOCKED'
        ? statusFilters[row.status]
        : false
    ))

    const searchFiltered = query
      ? statusFiltered.filter((row) => (
        `${row.sku} ${row.name} ${row.status} ${row.uom}`.toLowerCase().includes(query)
      ))
      : statusFiltered

    return [...searchFiltered].sort((a, b) => sortByStatusThenQuantity(a, b, quantitySort))
  }, [quantitySort, searchText, statusFilters, visibleRows])

  const totalQuantity = useMemo(() => (
    visibleRows.reduce((sum, row) => sum + Number(row.statusQuantity || 0), 0)
  ), [visibleRows])
  const quantityTotalsByStatus = useMemo(() => {
    const totals = { AVAILABLE: 0, RESERVED: 0, BLOCKED: 0 }

    for (const row of visibleRows) {
      if (row.status === 'AVAILABLE' || row.status === 'RESERVED' || row.status === 'BLOCKED') {
        totals[row.status] += Number(row.statusQuantity || 0)
      }
    }

    return totals
  }, [visibleRows])
  const uniqueSkuCount = useMemo(
    () => new Set(visibleRows.map((row) => row.sku)).size,
    [visibleRows]
  )
  const fillPercent = useMemo(() => {
    if (!bin) {
      return 0
    }

    const current = Number(bin.currentCapacity) || 0
    const max = Number(bin.maxCapacity) || 0

    if (max <= 0) {
      return 0
    }

    return Math.min(100, Math.max(0, Math.round((current / max) * 100)))
  }, [bin])
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / CONTENT_PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pagedRows = useMemo(
    () => filteredRows.slice(safePage * CONTENT_PAGE_SIZE, (safePage + 1) * CONTENT_PAGE_SIZE),
    [filteredRows, safePage]
  )

  const openLoadForRow = (row: BinContentTableRowDto) => {
    const stock = items.find((item) => item.id === row.id)
    if (stock) {
      loadModal.openForItem(stock)
    }
  }

  if (isLoading && !error) {
    return (
      <main className="flex min-h-0 flex-1 flex-col gap-4 p-4 xl:p-6" style={{ background: 'var(--wh-page-bg)' }}>
        <div
          className="rounded-xl border px-6 py-10 text-center text-sm"
          style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)', color: 'var(--wh-text-muted)' }}
        >
          Loading bin…
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-0 flex-1 flex-col gap-4 p-4 xl:p-6" style={{ background: 'var(--wh-page-bg)' }}>
        <div
          className="rounded-xl border px-6 py-10 text-center"
          style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--wh-status-blocked)' }}>{error}</p>
          <Button type="button" className="mt-4" onClick={refresh}>
            Retry
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main
      className="flex h-full min-h-0 flex-1 flex-col gap-4 overflow-auto p-4 pb-20 md:overflow-hidden md:pb-4 xl:p-6 xl:pb-6"
      style={{ background: 'var(--wh-page-bg)', color: 'var(--wh-text-primary)' }}
    >
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-4">
        <header className="shrink-0 rounded-2xl border px-4 py-4 sm:px-5" style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="mb-3 min-h-9 cursor-pointer"
                style={{ color: 'var(--wh-text-muted)' }}
              >
                <Link href="/warehouse/bins">
                  <ArrowLeft className="size-4" />
                  Back to bins
                </Link>
              </Button>
              {bin && (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">{bin.name}</h1>
                    <WarehouseOverviewStatusPill tone={bin.isBlocked ? 'danger' : 'success'}>
                      {bin.isBlocked ? 'Blocked' : 'Available'}
                    </WarehouseOverviewStatusPill>
                  </div>
                  <p className="mt-1 text-sm" style={{ color: 'var(--wh-text-muted)' }}>
                    {bin.code} · {bin.type}
                  </p>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {canManuallyAddItems ? (
                <AddItemToBinModal binId={binId} onSuccess={refresh} />
              ) : null}
            </div>
          </div>

          {bin && (
            <>
              <button
                type="button"
                className="mt-4 flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left sm:hidden"
                style={{ background: 'var(--wh-card-bg)', borderColor: 'var(--wh-border)' }}
                onClick={() => setIsKpiOpen((current) => !current)}
              >
                <span>
                  <span className="block text-xs font-medium uppercase" style={{ color: 'var(--wh-text-muted)' }}>Bin summary</span>
                  <span className="mt-1 block text-sm font-medium">
                    {occupancy} · {formatQuantity(totalQuantity)} total
                  </span>
                </span>
                {isKpiOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
              <div className={`${isKpiOpen ? 'grid' : 'hidden'} mt-4 gap-2 sm:grid sm:grid-cols-2`}>
                <div className="rounded-xl border px-4 py-4" style={{ background: 'var(--wh-card-bg)', borderColor: 'var(--wh-border)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase" style={{ color: 'var(--wh-text-muted)' }}>Fill</p>
                      <p className="mt-1 text-3xl font-semibold tabular-nums">{occupancy}</p>
                    </div>
                    <p className="text-sm tabular-nums" style={{ color: 'var(--wh-text-muted)' }}>
                      {formatQuantity(bin.currentCapacity)} / {formatQuantity(bin.maxCapacity)}
                    </p>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full" style={{ background: 'var(--wh-card-bg-soft)' }}>
                    <div
                      className="h-full rounded-full transition-[width] duration-300"
                      style={{
                        width: `${fillPercent}%`,
                        background: fillPercent >= 90 ? 'var(--wh-status-full)' : 'var(--wh-status-available)'
                      }}
                    />
                  </div>
                </div>
                <div className="rounded-xl border px-4 py-4" style={{ background: 'var(--wh-card-bg)', borderColor: 'var(--wh-border)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-medium uppercase" style={{ color: 'var(--wh-text-muted)' }}>Quantity</p>
                    <p className="text-right text-sm leading-snug" style={{ color: 'var(--wh-text-muted)' }}>
                      {uniqueSkuCount.toLocaleString()} unique SKUs · {visibleRows.length.toLocaleString()} stock lines
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
                    <p className="shrink-0 text-3xl font-semibold tabular-nums">{formatQuantity(totalQuantity)}</p>
                    <div className="flex min-w-0 flex-1 flex-wrap justify-end gap-x-4 gap-y-2 sm:gap-x-6">
                      {([
                        ['Available', 'AVAILABLE'],
                        ['Reserved', 'RESERVED'],
                        ['Blocked', 'BLOCKED']
                      ] as const).map(([label, status]) => (
                        <div key={status} className="text-right">
                          <p className="text-[10px] font-medium uppercase tracking-wide sm:text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                            {label}
                          </p>
                          <p className="mt-0.5 text-lg font-semibold tabular-nums sm:text-xl" style={{ color: statusColor(status) }}>
                            {formatQuantity(quantityTotalsByStatus[status])}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {bin?.blockReason ? (
            <div className="mt-3 rounded-xl border px-3 py-2 text-sm" style={{ borderColor: 'var(--wh-border)', color: 'var(--wh-status-blocked)' }}>
              {bin.blockReason}
            </div>
          ) : null}
        </header>

        <WarehouseOverviewShellSection
          className="min-h-0 flex-1 overflow-hidden"
          title={
            <span className="inline-flex items-center gap-2">
              <Package className="size-4" />
              Bin contents
            </span>
          }
          action={
            <>
              <PaginationSelector
                page={safePage}
                totalPages={totalPages}
                onPrev={() => setPage((currentPage) => Math.max(0, currentPage - 1))}
                onNext={() => setPage((currentPage) => Math.min(totalPages - 1, currentPage + 1))}
              />
              <WarehouseExpandableSearch
                value={searchText}
                onChange={(value) => {
                  setSearchText(value)
                  setPage(0)
                }}
                placeholder="Search stock"
                openButtonAriaLabel="Search stock"
                closeButtonAriaLabel="Close stock search"
              />
            </>
          }
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="min-h-9 cursor-pointer">
                  <SlidersHorizontal className="size-4" />
                    Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-56 border-dash-border bg-dash-shell p-3">
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={allStatusesSelected}
                      onCheckedChange={(checked) => {
                        const enabled = checked === true

                        setStatusFilters({
                          AVAILABLE: enabled,
                          RESERVED: enabled,
                          BLOCKED: enabled
                        })
                        setPage(0)
                      }}
                    />
                      Show all
                  </label>
                  {([
                    ['AVAILABLE', 'Show available'],
                    ['RESERVED', 'Show reserved'],
                    ['BLOCKED', 'Show blocked']
                  ] as const).map(([status, label]) => (
                    <label key={status} className="flex cursor-pointer items-center gap-2 text-sm">
                      <Checkbox
                        checked={statusFilters[status]}
                        onCheckedChange={(checked) => {
                          setStatusFilters((current) => nextStatusFilters(current, status, checked === true))
                          setPage(0)
                        }}
                      />
                      <span style={{ color: statusColor(status) }}>{label}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Select value={quantitySort} onValueChange={(value) => {
              setQuantitySort(value as QuantitySort)
              setPage(0)
            }}>
              <SelectTrigger className="h-9 w-36 rounded-xl border text-sm" style={{ background: 'var(--wh-card-bg)', borderColor: 'var(--wh-border)' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Qty desc</SelectItem>
                <SelectItem value="asc">Qty asc</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {!bin ? null : filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl px-4 py-10 text-center" style={{ background: 'var(--wh-card-bg)' }}>
              <Boxes className="size-8" style={{ color: 'var(--wh-text-muted)' }} />
              <p className="mt-3 text-sm font-medium">No stock lines found</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--wh-text-muted)' }}>
                Try a different SKU, name, or status.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {pagedRows.map((row) => (
                <article
                  key={`${row.id}-${row.status}`}
                  className="min-w-0 rounded-xl border p-4"
                  style={{
                    background: 'var(--wh-card-bg)',
                    borderColor: 'var(--wh-border)',
                    boxShadow: `inset 3px 0 0 ${statusColor(row.status)}`
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold sm:text-lg">{row.name}</h2>
                      <p className="mt-1 text-sm" style={{ color: 'var(--wh-text-muted)' }}>{row.sku}</p>
                    </div>
                    <WarehouseOverviewStatusPill tone={statusTone(row.status)}>
                      {row.status.replaceAll('_', ' ')}
                    </WarehouseOverviewStatusPill>
                  </div>

                  <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase" style={{ color: 'var(--wh-text-muted)' }}>Quantity</p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums">
                        {formatQuantity(row.statusQuantity)}
                        <span className="ml-1 text-sm font-medium" style={{ color: 'var(--wh-text-muted)' }}>{row.uom}</span>
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="min-h-10 cursor-pointer disabled:opacity-100"
                      disabled={row.status !== 'AVAILABLE'}
                      style={row.status === 'AVAILABLE' ? undefined : unavailableButtonStyle(row.status)}
                      onClick={() => openLoadForRow(row)}
                    >
                      {row.status === 'BLOCKED' ? (
                        <ClipboardX className="size-4" />
                      ) : row.status === 'RESERVED' ? (
                        <XCircle className="size-4" />
                      ) : (
                        <Truck className="size-4" />
                      )}
                      {row.status === 'AVAILABLE' ? 'Load' : row.status.toLowerCase()}
                    </Button>
                  </div>

                  {(row.lotId || row.boxId || row.serialNumberId) ? (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                      {row.lotId ? <span className="rounded-full border px-2 py-1" style={{ borderColor: 'var(--wh-border)' }}>Lot {row.lotId}</span> : null}
                      {row.boxId ? <span className="rounded-full border px-2 py-1" style={{ borderColor: 'var(--wh-border)' }}>Box {row.boxId}</span> : null}
                      {row.serialNumberId ? <span className="rounded-full border px-2 py-1" style={{ borderColor: 'var(--wh-border)' }}>Serial {row.serialNumberId}</span> : null}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </WarehouseOverviewShellSection>
      </div>

      <LoadItemToTrolleyModal
        isOpen={loadModal.isOpen}
        onOpenChange={loadModal.onOpenChange}
        selectedItem={loadModal.selectedItem}
        quantity={loadModal.quantity}
        onQuantityChange={loadModal.setQuantity}
        onSubmit={loadModal.submit}
        isSubmitting={loadModal.isSubmitting}
        error={loadModal.error}
      />
    </main>
  )
}
