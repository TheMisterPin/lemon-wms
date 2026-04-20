'use client'

import { MapPin } from 'lucide-react'

import { zoneTableColumns, type ZoneTableRow } from '@/components/configs/entities/zone/config'
import CreateZoneForm from '@/components/dashboard/features/zones/create-zone-form'
import PageWithGrid from '@/components/pages/page-with-grid'
import { useDashboardWarehouse } from '@/hooks/dashboard/use-dashboard-warehouse'

export function DashboardZonesPageView() {
  const { zones, warehouseOptions, isLoading, error } = useDashboardWarehouse()

  function handleRowClick(row: ZoneTableRow) {
    // eslint-disable-next-line no-console
    console.log('Clicked zone row:', row)
  }

  return (
    <PageWithGrid
      title="Zones"
      titleIcon={MapPin}
      entityTone="zone"
      headerActions={<CreateZoneForm warehouseList={warehouseOptions} />}
      isLoading={isLoading}
      error={error}
      tableData={{ columns: zoneTableColumns, records: zones }}
      onRowClick={handleRowClick}
    />
  )
}
