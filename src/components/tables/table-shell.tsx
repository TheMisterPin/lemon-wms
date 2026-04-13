'use client'

import type { ReactNode } from 'react'

import { Search } from 'lucide-react'

import { PaginationSelector } from '@/components/shared/PaginationSelector'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableHeader
} from '@/components/ui/table'
import {
  TooltipProvider
} from '@/components/ui/tooltip'
import type { ColumnConfig } from '@/types/components/table/column.types'

import type {
  EntityTone,
  GenericTableSearchConfig,
  RowAction,
  RowStyleIfConfig,
  SortDirection,
  TablePaginationConfig
} from '@/types/components/table/generic-table.types'

import { getEntityTone } from './entity-tone'
import { TableBodyRows } from './table-body'
import { TableHeaderRow } from './table-header'
import type { LucideIcon } from 'lucide-react'

export interface TableShellProps<T extends { id: string }> {
  title?: string
  titleIcon?: LucideIcon
  entityTone?: EntityTone
  headerButtons?: ReactNode
  search?: false | GenericTableSearchConfig
  searchText: string
  onSearchTextChange: (value: string) => void
  pagination?: TablePaginationConfig
  showHeaderPagination: boolean
  showFooterPagination: boolean
  visibleColumns: ColumnConfig<T>[]
  displayRecords: T[]
  sortColumnIndex: number | null
  sortDirection: SortDirection
  onSortColumnClick: (visibleColumnIndex: number) => void
  emptyMessage?: string
  actions?: RowAction<T>[]
  onRowClick?: (row: T) => void
  selectedId?: string
  rowStyleIf?: RowStyleIfConfig
}

export function TableShell<T extends { id: string }>({
  title,
  titleIcon: TitleIcon,
  entityTone,
  headerButtons,
  search,
  searchText,
  onSearchTextChange,
  pagination: effectivePagination,
  showHeaderPagination,
  showFooterPagination,
  visibleColumns,
  displayRecords,
  sortColumnIndex,
  sortDirection,
  onSortColumnClick,
  emptyMessage,
  actions,
  onRowClick,
  selectedId,
  rowStyleIf
}: TableShellProps<T>) {
  const searchEnabled = search !== false
  const hasSearchRow = searchEnabled || Boolean(headerButtons)
  const tone = getEntityTone(entityTone)
  const searchConfig = searchEnabled && typeof search === 'object' ? search : undefined

  return (
    <TooltipProvider>
      <div className="mx-auto w-full overflow-hidden shadow-lg shadow-black/20 backdrop-blur-sm rounded-lg">
        {title ? (
          <div className="flex items-center justify-between gap-4 border-b border-brand-glass-border px-4 py-3">
            <div className="flex items-center gap-2">
              {TitleIcon ? <TitleIcon size={20} className={tone.iconClass} /> : null}
              <h2
                className="bg-clip-text text-xl font-semibold text-transparent"
                style={tone.titleStyle}
              >
                {title}
              </h2>
            </div>
            {effectivePagination && showHeaderPagination ? (
              <PaginationSelector
                page={effectivePagination.page}
                totalPages={effectivePagination.totalPages}
                onPrev={effectivePagination.onPrev}
                onNext={effectivePagination.onNext}
              />
            ) : null}
          </div>
        ) : null}

        {hasSearchRow ? (
          <div
            className={[
              'border-b border-brand-glass-border p-3 flex flex-wrap items-center gap-3',
              searchEnabled ? '' : 'justify-end'
            ].filter(Boolean).join(' ')}
          >
            {searchEnabled ? (
              <div className="relative min-w-[200px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-subtle" />
                <Input
                  value={searchText}
                  onChange={event => onSearchTextChange(event.target.value)}
                  placeholder={searchConfig?.placeholder ?? 'Search records...'}
                  className="pl-9"
                  aria-label="Search records"
                />
              </div>
            ) : null}
            {headerButtons ? (
              <div className="flex shrink-0 items-center gap-2">{headerButtons}</div>
            ) : null}
          </div>
        ) : null}

        {effectivePagination && showHeaderPagination && !title ? (
          <div className="border-b border-brand-glass-border px-4 py-3">
            <PaginationSelector
              page={effectivePagination.page}
              totalPages={effectivePagination.totalPages}
              onPrev={effectivePagination.onPrev}
              onNext={effectivePagination.onNext}
            />
          </div>
        ) : null}

        <Table>
          <TableHeader>
            <TableHeaderRow
              visibleColumns={visibleColumns}
              sortColumnIndex={sortColumnIndex}
              sortDirection={sortDirection}
              onSortColumnClick={onSortColumnClick}
              actions={actions}
            />
          </TableHeader>
          <TableBodyRows
            visibleColumns={visibleColumns}
            displayRecords={displayRecords}
            emptyMessage={emptyMessage}
            actions={actions}
            onRowClick={onRowClick}
            selectedId={selectedId}
            rowStyleIf={rowStyleIf}
          />
        </Table>

        {effectivePagination && showFooterPagination ? (
          <div className="border-t border-brand-glass-border px-4 py-3">
            <PaginationSelector
              page={effectivePagination.page}
              totalPages={effectivePagination.totalPages}
              onPrev={effectivePagination.onPrev}
              onNext={effectivePagination.onNext}
            />
          </div>
        ) : null}
      </div>
    </TooltipProvider>
  )
}
