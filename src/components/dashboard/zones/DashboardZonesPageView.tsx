'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/zones/dashboard-zones-page-view.md
 */

import type { ReactNode } from 'react'
import { MapPin } from 'lucide-react'

import { zoneTableColumns, type ZoneTableRow } from '@/components/configs/entities/zone/config'
import PageWithGrid from '@/components/pages/page-with-grid'

type DashboardZonesPageViewProps = {
  zones: ZoneTableRow[]
  isLoading: boolean
  error: string | null
  headerActions: ReactNode
}

export function DashboardZonesPageView({
  zones,
  isLoading,
  error,
  headerActions
}: DashboardZonesPageViewProps) {

  function handleRowClick(row: ZoneTableRow) {
    // eslint-disable-next-line no-console
    console.log('Clicked zone row:', row)
  }

  return (
    <PageWithGrid
      title="Zones"
      titleIcon={MapPin}
      entityTone="zone"
      headerActions={headerActions}
      isLoading={isLoading}
      error={error}
      tableData={{ columns: zoneTableColumns, records: zones }}
      onRowClick={handleRowClick}
    />
  )
}
