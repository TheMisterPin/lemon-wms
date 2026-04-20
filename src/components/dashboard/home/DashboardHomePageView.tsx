'use client'

import { useCallback, useState } from 'react'
import { MapPin, Warehouse } from 'lucide-react'

import { binDirectoryTableColumns } from '@/components/configs/entities/bin/bin-directory-table'
import { viewBinContentsRowAction } from '@/components/configs/entities/bin/bin-table-actions'
import { DashboardHomeSearchBar } from '@/components/dashboard/dashboard-home-search-bar'
import { DashboardInfoCards } from '@/components/dashboard/dashboard-info-card'
import { DashboardRecordListSection } from '@/components/dashboard/dashboard-record-list-section'
import { BinContentsModal } from '@/components/dashboard/features/bins/bin-contents-modal'
import { useDashboardHome, type DashboardBinRecord } from '@/components/dashboard/home/use-dashboard-home'
import { GenericTable } from '@/components/tables/generic-table'
import type { ColumnConfig } from '@/types/components/table/column.types'

const binColumns: ColumnConfig<DashboardBinRecord>[] = binDirectoryTableColumns

export function DashboardHomePageView() {
  const { infoCards, warehouses, zones, bins, search } = useDashboardHome()
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
    <main className="flex h-full select-none flex-col overflow-hidden bg-linear-to-b from-page-bg-from to-page-bg-to">
      <div className="mx-auto flex h-full  w-[95%] flex-1 flex-col gap-6 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <DashboardInfoCards cards={infoCards} />

        <DashboardHomeSearchBar search={search} />

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 min-h-3/8 max-h-3/8">
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
          />
        </section>

        <section className="min-h-3/8 max-h-3/8">
          <GenericTable
            columns={binColumns}
            records={bins.records}
            title="Bins"
            entityTone="bin"
            pageSize={bins.pageSize}
            builtInPaginationPosition="header"
            search={false}
            actions={[viewBinContentsRowAction(openContents)]}
          />
        </section>

      </div>

      <BinContentsModal binId={contentsBinId} open={contentsOpen} onOpenChange={onContentsOpenChange} />
    </main>
  )
}
