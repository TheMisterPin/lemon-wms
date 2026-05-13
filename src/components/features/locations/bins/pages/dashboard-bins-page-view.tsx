'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/bins/dashboard-bins-page-view.md
 */

import type { ReactNode } from 'react'
import { ShelvingUnit } from 'lucide-react'

import { viewBinContentsRowAction } from '@/components/configs/entities/bin/bin-table-actions'
import { binTableColumns, type BinTableRow } from '@/components/configs/entities/bin/config'
import { BinContentsModal } from '@/components/features/locations/bins/components/bin-contents-modal'
import { useBinContentsDialog } from '@/components/features/locations/shared/hooks/use-bin-contents-dialog'
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
  const contentsDialog = useBinContentsDialog()

  return (
    <>
      <PageWithGrid
        title="Bins"
        titleIcon={ShelvingUnit}
        entityTone="bin"
        headerActions={headerActions}
        isLoading={isLoading}
        error={error}
        tableData={{ columns: binTableColumns, records: bins }}
        tableActions={[viewBinContentsRowAction(contentsDialog.openContents)]}
        search={{
          placeholder: 'Search bins...',
          fields: ['code', 'name', 'type']
        }}
      />
      <BinContentsModal
        binId={contentsDialog.binId}
        open={contentsDialog.open}
        onOpenChange={contentsDialog.onOpenChange}
      />
    </>
  )
}
