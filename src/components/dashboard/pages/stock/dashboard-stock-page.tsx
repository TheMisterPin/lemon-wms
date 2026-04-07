'use client'

import { useEffect, useMemo, useState } from 'react'
import { Archive, Boxes, Layers, LockKeyhole, PackageSearch, ShieldBan } from 'lucide-react'

import { DashboardInfoCards, type DashboardInfoCardItem } from '@/components/dashboard/DashboardInfoCards'
import { GenericTable } from '@/components/tables/generic-table'
import { dashboardApiClient } from '@/lib/axios'
import type { TableColumnConfig } from '@/types/components/table/generic-table.types'
import type { ApiResponse } from '@/types/responses/basic-response'

type StockItemRow = {
  id: string
  sku: string
  name: string
  uom: string
  binsCount: number
  totalAvailable: number
  totalReserved: number
  totalBlocked: number
  totalOnHand: number
}

type StockDashboardData = {
  distinctSkus: number
  occupiedBins: number
  totalOnHand: number
  totalAvailable: number
  totalReserved: number
  totalBlocked: number
  items: Array<{
    itemId: string
    sku: string
    name: string
    uom: string
    binsCount: number
    totalAvailable: number
    totalReserved: number
    totalBlocked: number
    totalOnHand: number
  }>
}

const itemColumns: TableColumnConfig<StockItemRow>[] = [
  { label: 'SKU', accessor: 'sku' },
  { label: 'Item name', accessor: 'name' },
  { label: 'Bins count', accessor: 'binsCount' },
  {
    label: 'Available',
    type: 'joinValues',
    joinValuesRef: { first: 'totalAvailable', second: 'uom' }
  },
  {
    label: 'Reserved',
    type: 'joinValues',
    joinValuesRef: { first: 'totalReserved', second: 'uom' }
  },
  {
    label: 'Blocked',
    type: 'joinValues',
    joinValuesRef: { first: 'totalBlocked', second: 'uom' }
  },
  {
    label: 'On hand',
    type: 'joinValues',
    joinValuesRef: { first: 'totalOnHand', second: 'uom' }
  }
]

function getPercent(value: number, total: number): number {
  if (total <= 0) {
    return 0
  }

  return Math.round((value / total) * 100)
}

export function DashboardStockPageView() {
  const [data, setData] = useState<StockDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadStock() {

      setIsLoading(true)
      setError(null)

      try {
        const response = await dashboardApiClient.get<ApiResponse<StockDashboardData>>('/dashboard/stock')

        if (!cancelled && response.success && response.data) {
          setData(response.data)
        }
      } catch (fetchError) {
        console.error('[DashboardStockPageView] Failed to fetch stock dashboard:', fetchError)
        if (!cancelled) {
          setError('Unable to load stock dashboard data.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadStock()

    return () => {
      cancelled = true
    }
  }, [])

  const infoCards = useMemo<DashboardInfoCardItem[]>(() => {
    if (!data) {
      return []
    }

    return [
      { label: 'Distinct SKUs', value: data.distinctSkus, icon: PackageSearch },
      { label: 'On-hand qty', value: data.totalOnHand, icon: Archive },
      { label: 'Available qty', value: data.totalAvailable, icon: Boxes },
      { label: 'Reserved qty', value: data.totalReserved, icon: LockKeyhole },
      { label: 'Blocked qty', value: data.totalBlocked, icon: ShieldBan },
      { label: 'Occupied bins', value: data.occupiedBins, icon: Layers }
    ]
  }, [data])

  const statusSplit = useMemo(() => {
    const total = data?.totalOnHand ?? 0
    const available = data?.totalAvailable ?? 0
    const reserved = data?.totalReserved ?? 0
    const blocked = data?.totalBlocked ?? 0

    return {
      total,
      available,
      reserved,
      blocked,
      availablePercent: getPercent(available, total),
      reservedPercent: getPercent(reserved, total),
      blockedPercent: getPercent(blocked, total)
    }
  }, [data])

  const itemRows = useMemo<StockItemRow[]>(() => {
    if (!data) {
      return []
    }

    return data.items.map((item) => ({
      id: item.itemId,
      ...item
    }))
  }, [data])

  return (
    <main className="flex h-full select-none flex-col overflow-hidden bg-linear-to-b from-page-bg-from to-page-bg-to">
      <div className="mx-auto flex w-full max-w-[1200px] origin-top flex-1 flex-col overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <header className="mt-2">
          <h1 className="text-2xl font-semibold text-brand-text">Stock</h1>
        </header>

        <section className="mt-2">
          {isLoading ? (
            <div className="rounded-lg border border-slate-500 bg-brand-glass/75 p-6 text-sm text-brand-muted">
              Loading stock dashboard...
            </div>
          ) : error ? (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
              {error}
            </div>
          ) : (
            <DashboardInfoCards cards={infoCards} />
          )}
        </section>

        <section className="mt-6 rounded-lg border border-slate-500 bg-brand-glass/75 p-6">
          <h2 className="text-lg font-semibold text-brand-text">Stock status split</h2>
          <p className="mt-1 text-sm text-brand-muted">Available, reserved, and blocked share of on-hand stock.</p>

          <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-brand-surface">
            <div className="flex h-full w-full">
              <div
                className="h-full bg-emerald-500/90"
                style={{ width: `${statusSplit.availablePercent}%` }}
                aria-label={`Available ${statusSplit.availablePercent}%`}
              />
              <div
                className="h-full bg-amber-500/90"
                style={{ width: `${statusSplit.reservedPercent}%` }}
                aria-label={`Reserved ${statusSplit.reservedPercent}%`}
              />
              <div
                className="h-full bg-rose-500/90"
                style={{ width: `${statusSplit.blockedPercent}%` }}
                aria-label={`Blocked ${statusSplit.blockedPercent}%`}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-brand-text sm:grid-cols-3">
            <p><span className="font-semibold text-emerald-300">Available</span>: {statusSplit.availablePercent}%</p>
            <p><span className="font-semibold text-amber-300">Reserved</span>: {statusSplit.reservedPercent}%</p>
            <p><span className="font-semibold text-rose-300">Blocked</span>: {statusSplit.blockedPercent}%</p>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-500 bg-brand-glass/75 p-6">
          <GenericTable
            columns={itemColumns}
            records={itemRows}
            section={{
              title: 'Stock by item',
              icon: PackageSearch,
              entityTone: 'item'
            }}
            search={{
              enabled: true,
              placeholder: 'Search item by SKU or name...',
              fields: ['sku', 'name', 'uom']
            }}
          />
        </section>
      </div>
    </main>
  )
}
