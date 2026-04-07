import { ReactNode } from 'react'
import { FieldValues } from 'react-hook-form'
import type { LucideIcon } from 'lucide-react'

import type { PaginationPosition } from '@/components/shared/PaginationSelector'
import type {
  DisplayFieldConfig,
  IndicatorColorMap,
  ProgressDisplayFieldConfig
} from '@/types/components/shared/display-field.types'

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

export interface GenericTableProps<T extends FieldValues & { id: string }> {
  columns: TableColumnConfig<T>[]
  records: T[]
  onRowClick?: (row: T) => void
  selectedId?: string
  emptyMessage?: string
  actions?: RowAction<T>[]
  pagination?: TablePaginationConfig
  search?: TableSearchConfig<T>
  section?: {
    title: string
    icon?: LucideIcon
    entityTone?: 'warehouse' | 'zone' | 'bin' | 'item' | 'order'
  }
}
