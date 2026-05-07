'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/features/bins/bin-contents-modal.md
 */


import { useCallback, useEffect, useMemo, useState } from 'react'

import { Package } from 'lucide-react'

import { TableShell } from '@/components/tables/table-shell'
import { useTableShellController } from '@/components/tables/use-table-shell-controller'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog'
import { dashboardApiClient } from '@/lib/axios'
import type { BinWithContent } from '@/lib/locations'
import { cn } from '@/lib/utils'
import type { ColumnConfig } from '@/types/components/table/column.types'
import { DEFAULT_GENERIC_TABLE_PAGE_SIZE } from '@/types/components/table/generic-table.types'
import type { BinItemStatus } from '@/types/models/enums'
import type { ApiResponse } from '@/types/responses/basic-response'

type ContentLine = BinWithContent['content'][number]

export type BinContentTableRow = ContentLine & {
  statusQuantity: number
}

function quantityForBinItemStatus(line: ContentLine): number {
  switch (line.status as BinItemStatus) {
  case 'AVAILABLE':
    return line.quantityAvailable
  case 'RESERVED':
    return line.quantityReserved
  case 'BLOCKED':
    return line.quantityBlocked
  case 'IN_TRANSIT':
    return line.quantityAvailable
  default:
    return line.quantityAvailable
  }
}

function toContentTableRows(lines: ContentLine[]): BinContentTableRow[] {
  return lines.map((line) => ({
    ...line,
    statusQuantity: quantityForBinItemStatus(line)
  }))
}

const contentColumns: ColumnConfig<BinContentTableRow>[] = [
  { label: 'SKU', accessor: 'sku' },
  { label: 'Name', accessor: 'name' },
  {
    label: 'Status',
    accessor: 'status',
    type: 'indicator',
    typeValues: {
      syncBlink: true,
      conditions: {
        available: '#16a34a',
        reserved: '#d97706',
        blocked: '#dc2626',
        in_transit: '#2563eb'
      },
      defaultColor: '#64748b'
    }
  },
  {
    label: 'Quantity',
    accessor: 'statusQuantity',
    type: 'joinValues',
    typeValues: { values: ['statusQuantity', 'uom'] }
  }
]

export type BinContentsModalProps = {
  binId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BinContentsModal({ binId, open, onOpenChange }: BinContentsModalProps) {
  const [bin, setBin] = useState<BinWithContent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!binId) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await dashboardApiClient.get<ApiResponse<BinWithContent>>(`/dashboard/bins/${binId}`)
      if (res.success && res.data) {
        setBin(res.data)
      } else {
        setBin(null)
        setError(res.message ?? 'Could not load bin.')
      }
    } catch {
      setBin(null)
      setError('Could not load bin.')
    } finally {
      setLoading(false)
    }
  }, [binId])

  useEffect(() => {
    if (!open || !binId) {
      setBin(null)
      setError(null)

      return
    }

    void load()
  }, [open, binId, load])

  const tableRows = useMemo(() => (bin ? toContentTableRows(bin.content) : []), [bin])

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
    columns: contentColumns,
    records: tableRows,
    pageSize: DEFAULT_GENERIC_TABLE_PAGE_SIZE,
    builtInPaginationPosition: 'header',
    search: {
      placeholder: 'Search by SKU, name, or status…',
      fields: ['sku', 'name', 'status']
    }
  })

  const dialogTitle = bin ? `${bin.name} (${bin.code})` : 'Bin contents'
  const showSpinner = loading || (Boolean(open && binId && !bin && !error))

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
