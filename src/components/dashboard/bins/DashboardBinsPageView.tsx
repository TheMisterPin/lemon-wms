'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/bins/dashboard-bins-page-view.md
 */


import { useCallback, useState } from 'react'
import { Box } from 'lucide-react'

import { viewBinContentsRowAction } from '@/components/configs/entities/bin/bin-table-actions'
import { binTableColumns } from '@/components/configs/entities/bin/config'
import { BinContentsModal } from '@/components/dashboard/features/bins/bin-contents-modal'
import CreateBinForm from '@/components/dashboard/features/bins/create-bin-form'
import { useDashboardWarehouse } from '@/components/dashboard/warehouses/use-dashboard-warehouse'
import PageWithGrid from '@/components/pages/page-with-grid'

export function DashboardBinsPageView() {
  const { bins, zoneOptions, isLoading, error } = useDashboardWarehouse()
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
    <>
      <PageWithGrid
        title="Bins"
        titleIcon={Box}
        entityTone="bin"
        headerActions={<CreateBinForm zonesList={zoneOptions} />}
        isLoading={isLoading}
        error={error}
        tableData={{ columns: binTableColumns, records: bins }}
        tableActions={[viewBinContentsRowAction(openContents)]}
        search={{
          placeholder: 'Search bins...',
          fields: ['code', 'name', 'type']
        }}
      />
      <BinContentsModal binId={contentsBinId} open={contentsOpen} onOpenChange={onContentsOpenChange} />
    </>
  )
}
