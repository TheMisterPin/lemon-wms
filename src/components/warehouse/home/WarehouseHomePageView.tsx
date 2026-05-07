'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/warehouse/home/warehouse-home-page-view.md
 */


import { useRouter } from 'next/navigation'

import { Warehouse } from 'lucide-react'

import { binDirectoryTableColumns } from '@/components/configs/entities/bin/bin-directory-table'
import { viewBinContentsRowAction } from '@/components/configs/entities/bin/bin-table-actions'
import { DashboardInfoCards } from '@/components/dashboard/dashboard-info-card'
import { DashboardRecordListSection } from '@/components/dashboard/dashboard-record-list-section'
import { GenericTable } from '@/components/tables/generic-table'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { WarehouseBinRecord } from '@/components/warehouse/home/types'
import { useWarehouseHome } from '@/components/warehouse/home/use-warehouse-home'
import { useAuth } from '@/lib/auth/use-auth'
import type { ColumnConfig } from '@/types/components/table/column.types'

const binColumns: ColumnConfig<WarehouseBinRecord>[] = binDirectoryTableColumns

export function WarehouseHomePageView() {
  const router = useRouter()
  const { warehouse } = useAuth()
  const { isLoading, error, refetch, infoCards, orders, bins } = useWarehouseHome()

  if (isLoading) {
    return (
      <main className="select-none flex flex-col h-full bg-linear-50 from-slate-800 to-slate-900 p-6 gap-4 overflow-hidden">
        <Card className="flex h-full items-center justify-center px-8 py-12">
          <p className="text-sm text-brand-muted">Loading warehouse data...</p>
        </Card>
      </main>
    )
  }

  if (error) {
    return (
      <main className="select-none flex flex-col h-full bg-linear-50 from-slate-800 to-slate-900 p-6 gap-4 overflow-hidden">
        <Card className="flex h-full flex-col items-center justify-center gap-4 px-8 py-12 text-center">
          <p className="text-lg font-semibold text-red-400">{error}</p>
          <Button type="button" onClick={refetch}>Retry</Button>
        </Card>
      </main>
    )
  }

  return (
    <main className="select-none flex flex-col h-full bg-linear-50 from-slate-800 to-slate-900 p-6 gap-4 overflow-hidden">
      <Card className=" flex-1 overflow-y-auto py-12 px-16">
        <h1 className="text-2xl font-semibold">Warehouse</h1>
        <div className="mt-1 text-sm text-brand-muted">
          {warehouse?.user ? (
            <>
              <p>Signed in as {warehouse.user.badgeNumber} ({warehouse.user.role})</p>
              <p>
                Device: {warehouse.device?.name ?? 'Unknown'}
                {warehouse.location?.zoneId ? ` · Zone ${warehouse.location.zoneId}` : ''}
              </p>
            </>
          ) : (
            <p>Signed in user context unavailable.</p>
          )}
        </div>

        <DashboardInfoCards cards={infoCards} />

        <DashboardRecordListSection
          title="Orders"
          icon={Warehouse}
          records={orders.records}
          page={orders.page}
          totalPages={orders.totalPages}
          onPrev={orders.onPrev}
          onNext={orders.onNext}
          paginationPosition="footer"
        />

        <div className="gap-4 rounded-lg bg-brand-glass/75 border border-slate-500 pb-12">
          <h2 className="text-xl font-semibold mt-8 px-4">Bins</h2>
          <GenericTable
            columns={binColumns}
            records={bins.records}
            pageSize={bins.pageSize}
            builtInPaginationPosition="header"
            actions={[
              viewBinContentsRowAction((binId) => router.push(`/warehouse/bins/${encodeURIComponent(binId)}`))
            ]}
          />
        </div>
      </Card>
    </main>
  )
}
