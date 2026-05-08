'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/_dashboard-standardization-plan.md
 */

import { GenericTable } from '@/components/tables/generic-table'
import type { GenericTableProps } from '@/types/components/table/generic-table.types'

export type DashboardDataTableProps<T extends { id: string }> = GenericTableProps<T>

export function DashboardDataTable<T extends { id: string }>(props: DashboardDataTableProps<T>) {
  return (
    <div
      className="rounded-2xl border p-1"
      style={{
        background: 'var(--wh-card-bg)',
        borderColor: 'var(--wh-border)'
      }}
    >
      <GenericTable {...props} />
    </div>
  )
}
