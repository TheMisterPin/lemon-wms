'use client'

import { MapPin, ShelvingUnit, Warehouse } from 'lucide-react'
import { DashboardInfoCards } from '@/components/dashboard/DashboardInfoCards'
import { DashboardRecordListSection } from '@/components/dashboard/DashboardRecordListSection'
import { GenericTable } from '@/components/tables/generic-table'
import { Card } from '@/components/ui/card'
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

export function DashboardHomePageView() {
  const { dashboard } = useAuth()
  const { infoCards, warehouses, zones, bins } = useDashboardHome()

  return (
    <main className="select-none flex flex-col h-full bg-linear-50 from-slate-800 to-slate-900 p-6 gap-4 overflow-hidden">
      <Card className=" glass flex-1 overflow-y-auto py-12 px-16">
        <h1 className="text-2xl font-semibold">Warehouse Dashboard</h1>
        {dashboard?.user ? (
          <p className="mt-1 text-sm text-brand-muted">
            Signed in as {dashboard.user.email ?? dashboard.user.badgeNumber} ({dashboard.user.role})
          </p>
        ) : null}

        <DashboardInfoCards cards={infoCards} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <DashboardRecordListSection
            title="Warehouses"
            icon={Warehouse}
            records={warehouses.records}
            page={warehouses.page}
            totalPages={warehouses.totalPages}
            onPrev={warehouses.onPrev}
            onNext={warehouses.onNext}
            paginationPosition="header"
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
          />
        </div>

        <div className="gap-4 rounded-lg bg-brand-glass/75 border border-slate-500 pb-12">
          <h2 className="text-xl font-semibold mt-8 px-4">Bins</h2>
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
          />
        </div>
      </Card>
    </main>
  )
}
