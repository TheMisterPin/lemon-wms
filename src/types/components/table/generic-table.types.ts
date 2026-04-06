import { ReactNode } from 'react'
import { FieldPath, FieldValues } from 'react-hook-form'

import type { PaginationPosition } from '@/components/shared/PaginationSelector'

export type SortDirection = 'asc' | 'desc'
export type TableColumnType = 'text' | 'date' | 'datetime' | 'time' | 'boolean' | 'progress' | 'indicator' | 'joinValues'

export interface BaseColumnConfig {
  label: string
  className?: string
  cellClassName?: string
  sortable?: boolean
}

export interface TypedValueColumnConfig {
  type?: Exclude<TableColumnType, 'progress' | 'indicator' | 'joinValues'>
}

export interface ProgressBarRef<T extends FieldValues> {
  current: FieldPath<T>
  max: FieldPath<T>
}

export interface JoinValuesRef<T extends FieldValues> {
  first: FieldPath<T>
  second: FieldPath<T>
}

export interface IndicatorColorMap {
  [value: string]: string
}

export interface RowAction<T> {
  icon: ReactNode
  tooltip: string
  onClick: (row: T) => void
  className?: string
}

export interface TablePaginationConfig {
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  position?: PaginationPosition
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

export interface AccessorIndicatorColumnConfig<T extends FieldValues> extends BaseColumnConfig {
  accessor: Extract<keyof T, string>
  accessorPath?: never
  cell?: never
  type: 'indicator'
  indicatorColorMap: IndicatorColorMap
  defaultIndicatorColor?: string
}

export interface AccessorPathIndicatorColumnConfig<T extends FieldValues> extends BaseColumnConfig {
  accessor?: never
  accessorPath: FieldPath<T>
  cell?: never
  type: 'indicator'
  indicatorColorMap: IndicatorColorMap
  defaultIndicatorColor?: string
}

export interface JoinValuesColumnConfig<T extends FieldValues> extends BaseColumnConfig {
  accessor?: never
  accessorPath?: never
  cell?: never
  type: 'joinValues'
  joinValuesRef: JoinValuesRef<T>
  separator?: string
}

export type TableColumnConfig<T extends FieldValues> =
  | AccessorColumnConfig<T>
  | AccessorPathColumnConfig<T>
  | CellColumnConfig<T>
  | ProgressColumnConfig<T>
  | AccessorIndicatorColumnConfig<T>
  | AccessorPathIndicatorColumnConfig<T>
  | JoinValuesColumnConfig<T>

export interface GenericTableProps<T extends FieldValues & { id: string }> {
  columns: TableColumnConfig<T>[]
  records: T[]
  onRowClick?: (row: T) => void
  selectedId?: string
  emptyMessage?: string
  actions?: RowAction<T>[]
  pagination?: TablePaginationConfig
}
