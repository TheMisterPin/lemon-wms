import { ReactNode } from 'react'
import { FieldPath, FieldValues } from 'react-hook-form'

export type SortDirection = 'asc' | 'desc'
export type TableColumnType = 'text' | 'date' | 'datetime' | 'time' | 'boolean' | 'progress'

export interface BaseColumnConfig {
  label: string
  className?: string
  cellClassName?: string
  sortable?: boolean
}

export interface TypedValueColumnConfig {
  type?: Exclude<TableColumnType, 'progress'>
}

export interface ProgressBarRef<T extends FieldValues> {
  current: FieldPath<T>
  max: FieldPath<T>
}

export interface RowAction<T> {
  icon: ReactNode
  tooltip: string
  onClick: (row: T) => void
  className?: string
}

export interface AccessorColumnConfig<T extends FieldValues> extends BaseColumnConfig, TypedValueColumnConfig {
  accessor: Extract<keyof T, string>
  accessorPath?: never
  cell?: never
  progressBarRef?: never
}

export interface AccessorPathColumnConfig<T extends FieldValues> extends BaseColumnConfig, TypedValueColumnConfig {
  accessor?: never
  accessorPath: FieldPath<T>
  cell?: never
  progressBarRef?: never
}

export interface CellColumnConfig<T extends FieldValues> extends BaseColumnConfig {
  accessor?: never
  accessorPath?: never
  cell: (row: T) => ReactNode
  type?: never
  progressBarRef?: never
}

export interface ProgressColumnConfig<T extends FieldValues> extends BaseColumnConfig {
  accessor?: never
  accessorPath?: never
  cell?: never
  type: 'progress'
  progressBarRef: ProgressBarRef<T>
}

export type TableColumnConfig<T extends FieldValues> =
  | AccessorColumnConfig<T>
  | AccessorPathColumnConfig<T>
  | CellColumnConfig<T>
  | ProgressColumnConfig<T>

export interface GenericTableProps<T extends FieldValues & { id: string }> {
  columns: TableColumnConfig<T>[]
  records: T[]
  onRowClick?: (row: T) => void
  selectedId?: string
  emptyMessage?: string
  actions?: RowAction<T>[]
}
