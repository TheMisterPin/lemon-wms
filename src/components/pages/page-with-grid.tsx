'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/pages/page-with-grid.md
 */


import type { ReactNode } from 'react'

import { GenericTable } from '@/components/tables/generic-table'
import type { ColumnConfig } from '@/types/components/table/column.types'
import type {
  EntityTone,
  GenericTableSearchConfig,
  RowAction,
  TablePaginationConfig
} from '@/types/components/table/generic-table.types'
import type { LucideIcon } from 'lucide-react'

export interface PageWithGridProps<T extends { id: string }> {
  title: string
  titleIcon?: LucideIcon
  entityTone?: EntityTone
  headerActions?: ReactNode
  isLoading?: boolean
  error?: string | null
  tableData: {
    columns: ColumnConfig<T>[]
    records: T[]
  }
  onRowClick?: (row: T) => void
  tableActions?: RowAction<T>[]
  tablePagination?: TablePaginationConfig
  /** Forwarded to GenericTable; omit for default search behavior. */
  search?: false | GenericTableSearchConfig
  pageSize?: number
}

export default function PageWithGrid<T extends { id: string }>(props: PageWithGridProps<T>) {
  const {
    title,
    titleIcon,
    entityTone,
    headerActions,
    isLoading,
    error,
    tableData,
    onRowClick,
    tableActions,
    tablePagination,
    search,
    pageSize
  } = props

  const scrollShell =
    'mx-auto flex w-full max-w-[1200px] origin-top flex-1 flex-col overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'

  return (
    <main className="flex h-full select-none flex-col overflow-hidden bg-linear-to-b from-page-bg-from to-page-bg-to">
      <div className={scrollShell}>
        {isLoading ? (
          <section className="mt-6 rounded-lg border border-slate-500 bg-brand-glass/75 p-6">
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <div className="size-8 animate-spin rounded-full border-2 border-brand-primary/30 border-t-brand-primary" />
              <p className="text-sm text-brand-muted">
                Loading {title.toLowerCase()}…
              </p>
            </div>
          </section>
        ) : error ? (
          <section className="mt-6 rounded-lg border border-rose-500/40 bg-rose-500/10 p-6">
            <p className="text-sm text-rose-200">{error}</p>
          </section>
        ) : (
          <section className="mt-6 rounded-lg border border-slate-500 bg-brand-glass/75 p-6">
            <GenericTable
              title={title}
              titleIcon={titleIcon}
              entityTone={entityTone}
              headerButtons={headerActions}
              columns={tableData.columns}
              records={tableData.records}
              onRowClick={onRowClick}
              actions={tableActions}
              pagination={tablePagination}
              search={search}
              pageSize={pageSize}
              emptyMessage={`No ${title.toLowerCase()} found.`}
            />
          </section>
        )}
      </div>
    </main>
  )
}
