import { ReactNode } from 'react'
import { FieldPath, FieldValues } from 'react-hook-form'

export interface BaseColumnConfig {
  label: string
  className?: string
}

export interface AccessorColumnConfig<T extends FieldValues> extends BaseColumnConfig {
  accessor: Extract<keyof T, string>
  accessorPath?: never
  cell?: never
}

export interface AccessorPathColumnConfig<T extends FieldValues> extends BaseColumnConfig {
  accessor?: never
  accessorPath: FieldPath<T>
  cell?: never
}

export interface CellColumnConfig<T extends FieldValues> extends BaseColumnConfig {
  accessor?: never
  accessorPath?: never
  cell: (row: T) => ReactNode
}

export type TableColumnConfig<T extends FieldValues> =
  | AccessorColumnConfig<T>
  | AccessorPathColumnConfig<T>
  | CellColumnConfig<T>

export interface GenericTableProps<T extends FieldValues & { id: string }> {
  columns: TableColumnConfig<T>[]
  records: T[]
  onRowClick?: (row: T) => void
  selectedId?: string
  emptyMessage?: string
}
