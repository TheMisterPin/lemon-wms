'use client'

import { MapPin, ShelvingUnit, Warehouse } from 'lucide-react'
import { DashboardInfoCards } from '@/components/dashboard/DashboardInfoCards'
import { DashboardRecordListSection } from '@/components/dashboard/DashboardRecordListSection'
import { GenericTable } from '@/components/tables/generic-table'
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

export function DashboardHomePageView() {
  const { infoCards, warehouses, zones, bins } = useDashboardHome()

  return (
    <main className="flex h-full select-none flex-col overflow-hidden  bg-linear-to-b from-page-bg-from to-page-bg-to">
      <div className=" mx-auto flex w-full max-w-[1200px] origin-top flex-1 flex-col overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

        <div className="mt-2">
          <DashboardInfoCards cards={infoCards} />
        </div>

        <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <DashboardRecordListSection
            title="Warehouses"
            entityTone="warehouse"
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
            entityTone="zone"
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

        <section className="mt-6 rounded-lg border border-slate-500 bg-brand-glass/75 p-6">
          <GenericTable
            columns={binColumns}
            records={bins.records}
            section={{
              title: 'Bins',
              icon: ShelvingUnit,
              entityTone: 'bin'
            }}
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
