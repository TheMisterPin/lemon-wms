'use client'

import { MapPin, Warehouse } from 'lucide-react'
import { DashboardHomeSearchBar } from '@/components/dashboard/dashboard-home-search-bar'
import { DashboardInfoCards } from '@/components/dashboard/dashboard-info-card'
import { DashboardRecordListSection } from '@/components/dashboard/dashboard-record-list-section'
import { useDashboardHome, type DashboardBinRecord } from '@/components/dashboard/home/use-dashboard-home'
import { GenericTable } from '@/components/tables/generic-table'
import { useAuth } from '@/hooks/auth/use-auth'
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
  const { infoCards, warehouses, zones, bins, search } = useDashboardHome()

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
      </div>
    </main>
  )
}
