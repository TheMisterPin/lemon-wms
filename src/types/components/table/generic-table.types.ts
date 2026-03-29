import { ReactNode } from 'react'

export interface BaseColumnConfig<T> {
  label: string
  className?: string
}

export interface AccessorColumnConfig<T> extends BaseColumnConfig<T> {
  accessor: keyof T & string
  accessorPath?: never
  cell?: never
}

export interface AccessorPathColumnConfig<T> extends BaseColumnConfig<T> {
  accessor?: never
  accessorPath: string
  cell?: never
}

export interface CellColumnConfig<T> extends BaseColumnConfig<T> {
  accessor?: never
  accessorPath?: never
  cell: (row: T) => ReactNode
}

export type TableColumnConfig<T> =
  | AccessorColumnConfig<T>
  | AccessorPathColumnConfig<T>
  | CellColumnConfig<T>

export interface GenericTableProps<T extends { id: string }> {
  columns: TableColumnConfig<T>[]
  records: T[]
  onRowClick?: (row: T) => void
  selectedId?: string
  emptyMessage?: string
}
