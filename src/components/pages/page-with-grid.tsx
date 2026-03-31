/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react'

import { TableColumnConfig } from '@/types/components/table/generic-table.types'

import { GenericTable } from '../tables/generic-table'

interface PageWithGridProps {
    title: string
    headerActions?: React.ReactNode
    isLoading?: boolean
    error?: string | null
    tableData: {
        columns: TableColumnConfig<any>[]
        records: any[]
    }
    onRowClick?: (row: any) => void
}

export default function PageWithGrid(props: PageWithGridProps) {
  const { title, headerActions, isLoading, error, tableData, onRowClick } = props

  return (
    <main className="h-full rounded-xl bg-brand-content-bg p-6">
      <div className="flex items-center justify-between mb-6 px-20">
        <h1 className="bg-linear-to-r from-brand-accent via-brand-accent-mid to-brand-accent-end bg-clip-text text-2xl font-black tracking-tight text-transparent">
          {title}
        </h1>
        <div className="flex items-center gap-2">
          {headerActions}
        </div>
      </div>

      <div className="mx-20 mb-6 h-px bg-linear-to-r from-transparent via-brand-border to-transparent" />

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 rounded-full border-2 border-brand-primary/30 border-t-brand-primary animate-spin" />
            <p className="text-sm text-brand-muted">
              Loading {title.toLowerCase()} data...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="mx-20 rounded-xl border border-dash-red/20 bg-dash-red-dim p-4">
          <p className="text-sm text-dash-red-text">{error}</p>
        </div>
      ) : (
        <GenericTable
          columns={tableData.columns}
          records={tableData.records}
          onRowClick={onRowClick}
          emptyMessage={`No ${title.toLowerCase()} found.`}
        />
      )}
    </main>
  )
}
