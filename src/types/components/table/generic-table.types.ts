import { ReactNode } from 'react'
import { FieldValues, FieldPath } from 'react-hook-form'

import type { PaginationPosition } from '@/components/shared/PaginationSelector'
import type {
  DisplayFieldConfig,
  IndicatorColorMap,
  ProgressDisplayFieldConfig
} from '@/types/components/shared/display-field.types'
import type { LucideIcon } from 'lucide-react'

export type SortDirection = 'asc' | 'desc'
export type TableColumnType =
  | 'text'
  | 'date'
  | 'datetime'
  | 'time'
  | 'boolean'
  | 'progress'
  | 'indicator'
  | 'joinValues'

export interface BaseColumnConfig {
  label: string
  className?: string
  cellClassName?: string
  sortable?: boolean
}

export interface CellColumnConfig<T extends FieldValues> extends BaseColumnConfig {
  accessor?: never
  accessorPath?: never
  cell: (row: T) => ReactNode
  type?: never
  progressBarRef?: never
}

export type DataColumnConfig<T extends FieldValues> = DisplayFieldConfig<T> & {
  className?: string
  cellClassName?: string
  sortable?: boolean
}

export type ProgressColumnConfig<T extends FieldValues> = ProgressDisplayFieldConfig<T> & BaseColumnConfig

export type TableColumnConfig<T extends FieldValues> = DataColumnConfig<T> | CellColumnConfig<T>

export { type IndicatorColorMap }

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

export interface TableSearchConfig<T extends FieldValues> {
  enabled?: boolean
  placeholder?: string
  fields?: Array<Extract<keyof T, string>>
}

/** Default rows per page when using built-in {@link GenericTableProps.pageSize} pagination. */
export const DEFAULT_GENERIC_TABLE_PAGE_SIZE = 10

/**
 * First matching rule wins. Use {@link colName} as a row field path (same shape as column accessors).
 * - {@link whenPositive}: matches when `Number(value) > 0`
 * - Else if {@link value} is set: matches when the field equals that value (string-coerced equality allowed)
 * - Else: matches when the value is truthy
 */
export interface TableRowStyleIfRule<T extends FieldValues = FieldValues> {
  colName: FieldPath<T>
  whenPositive?: boolean
  value?: unknown
  bgClassName?: string
  textClassName?: string
}

export interface TableRowStyleIfConfig<T extends FieldValues = FieldValues> {
  rules: TableRowStyleIfRule<T>[]
  defaultBgClassName?: string
  defaultTextClassName?: string
}

export interface GenericTableProps<T extends FieldValues & { id: string }> {
  columns: TableColumnConfig<T>[]
  records: T[]
  onRowClick?: (row: T) => void
  selectedId?: string
  emptyMessage?: string
  actions?: RowAction<T>[]
  pagination?: TablePaginationConfig
  /**
   * Built-in page size (slices sorted rows). Ignored when {@link pagination} is set.
   * Omit for no built-in pagination (show all rows).
   */
  pageSize?: number
  rowStyleIf?: TableRowStyleIfConfig<T>
  /** Rendered in the toolbar row (e.g. filter controls), beside search when enabled. */
  toolbarExtra?: ReactNode
  search?: TableSearchConfig<T>
  section?: {
    title: string
    icon?: LucideIcon
    entityTone?: 'warehouse' | 'zone' | 'bin' | 'item' | 'order'
  }
}
