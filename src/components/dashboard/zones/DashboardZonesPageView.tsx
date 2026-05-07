'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/zones/dashboard-zones-page-view.md
 */


import { MapPin } from 'lucide-react'

import { zoneTableColumns, type ZoneTableRow } from '@/components/configs/entities/zone/config'
import CreateZoneForm from '@/components/dashboard/features/zones/create-zone-form'
import { useDashboardWarehouse } from '@/components/dashboard/warehouses/use-dashboard-warehouse'
import PageWithGrid from '@/components/pages/page-with-grid'

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
