'use client'

import { MapPin, Warehouse } from 'lucide-react'
import { DashboardInfoCards } from '@/components/dashboard/DashboardInfoCards'
import { DashboardRecordListSection } from '@/components/dashboard/DashboardRecordListSection'
import { GenericTable } from '@/components/tables/generic-table'
import { useAuth } from '@/hooks/auth/use-auth'
import { useDashboardHome, type DashboardBinRecord } from '@/hooks/dashboard/use-dashboard-home'
import type { TableColumnConfig } from '@/types/components/table/generic-table.types'

const binColumns: TableColumnConfig<DashboardBinRecord>[] = [
  { label: 'Name', accessor: 'name' },
  { label: 'Type', accessor: 'type' },
  { label: 'Status', accessor: 'active', type: 'boolean' },
  {
    label: 'Progress',
    type: 'progress',
    progressBarRef: { max: 'maxCapacity', current: 'currentCapacity' }
  }
]

export function DashboardItemsPageView() {
  const { dashboard } = useAuth()
  const { infoCards, warehouses, zones, bins } = useDashboardHome()

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
            searchValue={warehouses.search}
            onSearchChange={warehouses.onSearch}
            searchPlaceholder="Search warehouses..."
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
            searchValue={zones.search}
            onSearchChange={zones.onSearch}
            searchPlaceholder="Search zones..."
          />
        </section>

        <section className="mt-6 rounded-lg border border-slate-500 bg-brand-glass/75">
          <div className="px-4 pt-5 sm:px-6">
            <h2 className="text-xl font-semibold">Bins</h2>
          </div>
          <GenericTable
            columns={binColumns}
            records={bins.records}
            pagination={{
              page: bins.page,
              totalPages: bins.totalPages,
              onPrev: bins.onPrev,
              onNext: bins.onNext,
              position: 'header'
            }}
            search={{
              enabled: true,
              placeholder: 'Search bins...',
              fields: ['name', 'type']
            }}
          />
        </section>
      </div>
    </main>
  )
}
