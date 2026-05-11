'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/items/dashboard-items-page-view.md
 */

import { MapPin, Warehouse } from 'lucide-react'
import { useDashboardHome, type DashboardBinRecord } from '@/components/features/home/use-dashboard-home'
import { DashboardHomeSearchBar } from '@/components/dashboard/primitives/dashboard-home-search-bar'
import { DashboardInfoCards } from '@/components/dashboard/primitives/dashboard-info-card'
import { DashboardRecordListSection } from '@/components/dashboard/primitives/dashboard-record-list-section'
import { GenericTable } from '@/components/primitives/tables/generic-table'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/lib/auth/use-auth'
import type { ColumnConfig } from '@/types/components/table/column.types'

const binColumns: ColumnConfig<DashboardBinRecord>[] = [
  { label: 'Name', accessor: 'name' },
  { label: 'Type', accessor: 'type' },
  { label: 'Status', accessor: 'active', type: 'boolean' },
  {
    label: 'Progress',
    accessor: 'currentCapacity',
    type: 'progress',
    typeValues: { max: 'maxCapacity', current: 'currentCapacity' }
  }
]

export function DashboardItemsPageView() {
  const { dashboard } = useAuth()
  const {
    isLoading,
    error,
    refetch,
    infoCards,
    warehouses,
    zones,
    bins,
    search
  } = useDashboardHome()

  return (
    <main className="flex h-full select-none flex-col overflow-hidden bg-linear-to-b from-slate-800 to-slate-900 p-6">
      <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8 md:px-12 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <header>
          <h1 className="text-2xl font-semibold text-brand-text">Warehouse Dashboard</h1>
          {dashboard?.user ? (
            <p className="mt-1 text-sm text-brand-muted">
              Signed in as {dashboard.user.email ?? dashboard.user.badgeNumber} ({dashboard.user.role})
            </p>
          ) : null}
        </header>

        {isLoading ? (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Skeleton className="h-24 rounded-lg bg-slate-700/80" />
              <Skeleton className="h-24 rounded-lg bg-slate-700/80" />
              <Skeleton className="h-24 rounded-lg bg-slate-700/80" />
            </div>
            <Skeleton className="h-11 w-full max-w-md rounded-lg bg-slate-700/80" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Skeleton className="min-h-80 rounded-lg bg-slate-700/80" />
              <Skeleton className="min-h-80 rounded-lg bg-slate-700/80" />
            </div>
            <Skeleton className="min-h-72 rounded-lg bg-slate-700/80" />
          </div>
        ) : error ? (
          <div
            className="mt-6 flex flex-col gap-3 rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            role="alert"
          >
            <p className="text-sm text-red-200">{error}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="shrink-0 rounded-md bg-red-900/80 px-3 py-2 text-sm font-medium text-red-100 hover:bg-red-900"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="mt-6">
              <DashboardInfoCards cards={infoCards} />
            </div>

            <DashboardHomeSearchBar search={search} />

            <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <DashboardRecordListSection
                title="Warehouses"
                icon={Warehouse}
                records={warehouses.records}
                page={warehouses.page}
                totalPages={warehouses.totalPages}
                onPrev={warehouses.onPrev}
                onNext={warehouses.onNext}
                paginationPosition="header"
                selectedRecordId={warehouses.selectedId}
                onRecordClick={(record) => warehouses.onSelect(record.id)}
              />
              <DashboardRecordListSection
                title="Zones"
                icon={MapPin}
                records={zones.records}
                page={zones.page}
                totalPages={zones.totalPages}
                onPrev={zones.onPrev}
                onNext={zones.onNext}
                paginationPosition="header"
                selectedRecordId={zones.selectedId}
                onRecordClick={(record) => zones.onSelect(record.id)}
              />
            </section>

            <section className="mt-6 rounded-lg border border-slate-500 bg-brand-glass/75">
              <GenericTable
                title="Bins"
                columns={binColumns}
                records={bins.records}
                pageSize={bins.pageSize}
                builtInPaginationPosition="header"
                search={false}
              />
            </section>
          </>
        )}
      </div>
    </main>
  )
}
