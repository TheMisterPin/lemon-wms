import type { ReactNode } from 'react'

import type { ColumnConfig, StyleCondition } from '@/types/components/table/column.types'
import type { LucideIcon } from 'lucide-react'

/** Matches {@link import('@/components/shared/PaginationSelector').PaginationPosition}. */
export type GenericTablePaginationPosition = 'header' | 'footer'

export type { ColumnConfig } from '@/types/components/table/column.types'
export type {
  BooleanTypeValues,
  ColumnStyleConfig,
  ColumnType,
  CustomCellColumnConfig,
  DataColumnConfig,
  DateTypeValues,
  IndicatorTypeValues,
  JoinValuesTypeValues,
  NumberTypeValues,
  OperationTypeValues,
  ProgressTypeValues,
  StyleCondition,
  StyleIfRule,
  TableOperation,
  TextTypeValues,
  TypeValuesMap
} from '@/types/components/table/column.types'

export type SortDirection = 'asc' | 'desc'

export type EntityTone = 'warehouse' | 'zone' | 'bin' | 'item' | 'order'

export interface RowAction<T extends { id: string }> {
  icon: ReactNode | ((row: T) => ReactNode)
  tooltip: string | ((row: T) => string)
  onClick: (row: T) => void
  className?: string | ((row: T) => string)
}

export interface TablePaginationConfig {
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  position?: GenericTablePaginationPosition
}

/** When {@link GenericTableProps.search} is omitted, search is enabled by default. */
export type GenericTableSearchConfig = {
  placeholder?: string
  fields?: string[]
}

/** Default rows per page when using built-in {@link GenericTableProps.pageSize} pagination. */
export const DEFAULT_GENERIC_TABLE_PAGE_SIZE = 10

export interface RowStyleIfRule {
  accessor: string
  condition: StyleCondition
  value?: unknown
  className: string
}

export interface RowStyleIfConfig {
  rules: RowStyleIfRule[]
  defaultClassName?: string
}

export interface GenericTableProps<T extends { id: string }> {
  columns: ColumnConfig<T>[]
  records: T[]
  onRowClick?: (row: T) => void
  selectedId?: string
  title?: string
  titleIcon?: LucideIcon
  entityTone?: EntityTone
  headerButtons?: ReactNode
  emptyMessage?: string
  actions?: RowAction<T>[]
  pagination?: TablePaginationConfig
  /**
   * Built-in page size (slices sorted rows). Ignored when {@link pagination} is set.
   * Omit for no built-in pagination (show all rows).
   */
  pageSize?: number
  rowStyleIf?: RowStyleIfConfig
  /**
   * Search is **on** when this prop is omitted. Pass `false` to disable.
   */
  search?: false | GenericTableSearchConfig
}
