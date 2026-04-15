'use client'

import { useCallback, useState } from 'react'

import { MapPin, ShelvingUnit, Warehouse } from 'lucide-react'

import { binDirectoryTableColumns } from '@/components/configs/entities/bin/bin-directory-table'
import { viewBinContentsRowAction } from '@/components/configs/entities/bin/bin-table-actions'
import { DashboardInfoCards } from '@/components/dashboard/dashboard-info-card'
import { DashboardRecordListSection } from '@/components/dashboard/dashboard-record-list-section'
import { BinContentsModal } from '@/components/dashboard/features/bins/bin-contents-modal'
import { GenericTable } from '@/components/tables/generic-table'
import { useDashboardHome, type DashboardBinRecord } from '@/hooks/dashboard/use-dashboard-home'
import type { ColumnConfig } from '@/types/components/table/column.types'

const binColumns: ColumnConfig<DashboardBinRecord>[] = binDirectoryTableColumns

export function DashboardHomePageView() {
  const { infoCards, warehouses, zones, bins } = useDashboardHome()
  const [contentsBinId, setContentsBinId] = useState<string | null>(null)
  const [contentsOpen, setContentsOpen] = useState(false)

  const openContents = useCallback((binId: string) => {
    setContentsBinId(binId)
    setContentsOpen(true)
  }, [])

  const onContentsOpenChange = useCallback((open: boolean) => {
    setContentsOpen(open)
    if (!open) {
      setContentsBinId(null)
    }
  }, [])

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
            title="Bins"
            titleIcon={ShelvingUnit}
            entityTone="bin"
            pagination={{
              page: bins.page,
              totalPages: bins.totalPages,
              onPrev: bins.onPrev,
              onNext: bins.onNext,
              position: 'header'
            }}
            search={{
              placeholder: 'Search bins...',
              fields: ['code', 'name', 'type']
            }}
            actions={[viewBinContentsRowAction(openContents)]}
          />
        </section>
      </div>

      <BinContentsModal binId={contentsBinId} open={contentsOpen} onOpenChange={onContentsOpenChange} />
    </main>
  )
}
