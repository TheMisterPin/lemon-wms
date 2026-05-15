'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/features/bins/bin-contents-modal.md
 */

import { Package } from 'lucide-react'

import { BIN_CONTENT_TABLE_COLUMNS } from '@/components/features/locations/bins/lib/bin-contents-table-columns'
import { TableShell } from '@/components/primitives/tables/table-shell'
import { useTableShellController } from '@/components/primitives/tables/use-table-shell-controller'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog'
import { useBinContents } from '@/hooks/dashboard/locations/use-bin-contents'
import { cn } from '@/lib/utils'
import { DEFAULT_GENERIC_TABLE_PAGE_SIZE } from '@/types/components/table/generic-table.types'

export type BinContentsModalProps = {
  binId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BinContentsModal({ binId, open, onOpenChange }: BinContentsModalProps) {
  const { bin, error, tableRows, dialogTitle, showSpinner } = useBinContents(binId, open)

  const {
    visibleColumns,
    searchText,
    setSearchText,
    displayRecords,
    effectivePagination,
    showHeaderPagination,
    showFooterPagination,
    sortColumnIndex,
    sortDirection,
    handleSortColumnClick
  } = useTableShellController({
    columns: BIN_CONTENT_TABLE_COLUMNS,
    records: tableRows,
    pageSize: DEFAULT_GENERIC_TABLE_PAGE_SIZE,
    builtInPaginationPosition: 'header',
    search: {
      placeholder: 'Search by SKU, name, or status…',
      fields: ['sku', 'name', 'status']
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          'flex max-h-[min(90vh,calc(100vh-2rem))] w-full flex-col gap-0 overflow-hidden p-0',
          'border border-brand-glass-border bg-brand-surface shadow-lg shadow-black/10',
          'sm:max-w-4xl'
        )}
      >
        <DialogTitle className="sr-only">{dialogTitle}</DialogTitle>
        {showSpinner ? (
          <p className="text-sm text-brand-muted px-4 py-6">Loading…</p>
        ) : error ? (
          <p className="text-sm text-dash-red-text px-4 py-6">{error}</p>
        ) : bin ? (
          <div className="indicator-sync-blink min-h-0 min-w-0 flex-1 overflow-auto p-3 [-webkit-overflow-scrolling:touch]">
            <TableShell
              title={dialogTitle}
              titleIcon={Package}
              entityTone="bin"
              search={{
                placeholder: 'Search by SKU, name, or status…',
                fields: ['sku', 'name', 'status']
              }}
              searchText={searchText}
              onSearchTextChange={setSearchText}
              pagination={effectivePagination}
              showHeaderPagination={showHeaderPagination}
              showFooterPagination={showFooterPagination}
              visibleColumns={visibleColumns}
              displayRecords={displayRecords}
              sortColumnIndex={sortColumnIndex}
              sortDirection={sortDirection}
              onSortColumnClick={handleSortColumnClick}
              emptyMessage="No stock lines in this bin."
            />
          </div>
        ) : null}
        <DialogFooter className="border-t border-brand-glass-border px-4 py-3 sm:justify-end">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
