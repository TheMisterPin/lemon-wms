'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/bins/dashboard-bins-page-view.md
 */

import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { Box } from 'lucide-react'

import { viewBinContentsRowAction } from '@/components/configs/entities/bin/bin-table-actions'
import { binTableColumns, type BinTableRow } from '@/components/configs/entities/bin/config'
import { BinContentsModal } from '@/components/features/locations/components/bin-contents-modal'
import PageWithGrid from '@/components/pages/page-with-grid'

type DashboardBinsPageViewProps = {
  bins: BinTableRow[]
  isLoading: boolean
  error: string | null
  headerActions: ReactNode
}

export function DashboardBinsPageView({
  bins,
  isLoading,
  error,
  headerActions
}: DashboardBinsPageViewProps) {
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
        headerActions={headerActions}
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
