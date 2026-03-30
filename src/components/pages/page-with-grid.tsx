/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react'
import { TableColumnConfig } from '@/types/components/table/generic-table.types'
import { GenericTable } from '../tables/generic-table'
import { Separator } from '../ui/separator'

interface PageWithGridProps {
    title : string,
    headerActions?: React.ReactNode
    isLoading?: boolean
    error?: string | null
tableData: {
    columns: TableColumnConfig<any>[]
    records: any[]
}
onRowClick?: (row : any) => void
}

export default function PageWithGrid( props: PageWithGridProps) {
  const { title, headerActions, isLoading, error, tableData, onRowClick } = props

  return (
    <main className="h-full rounded bg-brand-content-bg p-6">
      <div className="flex items-center justify-between mb-6 px-20 ">
        <h1 className="bg-linear-to-r from-brand-accent via-brand-accent-mid to-brand-accent-end bg-clip-text text-2xl font-black tracking-tight text-transparent">
          {title}
        </h1>
        <div className="flex items-center gap-2">
          {headerActions}
        </div>
      </div>
      <Separator className="mb-6 bg-slate-600" />

      {isLoading ? (
        <p className="mt-4 text-sm text-zinc-400">
            Loading {title.toLowerCase()} data...
        </p>
      ) : error ? (
        <p className="mt-4 text-sm text-red-400">{error}</p>
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
