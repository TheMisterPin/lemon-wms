
import type { ReactNode } from 'react'
import type { GenericTableProps } from '@/types/components/table/generic-table.types'

export type DashboardDataTableProps<T extends { id: string }> = GenericTableProps<T>
export type DashboardKpiCardMetric = {
  label: string
  value: ReactNode
  tone?: 'available' | 'reserved' | 'blocked' | 'neutral'
}

export type DashboardDonutBreakdownRow = {
  id: string
  label: string
  value: number
  color: string
}

export type DashboardStatusBreakdownRow = {
  id: string
  label: string
  available: number
  reserved: number
  blocked: number
}
export type DashboardPreviewSectionProps<T> = {
  title: ReactNode
  items: T[]
  getKey: (item: T) => string
  renderItem: (item: T) => ReactNode
  emptyMessage?: ReactNode
  sheetTitle: ReactNode
  sheetDescription?: ReactNode
  previewCount: number
  sheetGridClassName?: string
}
export type DashboardEntityPreviewSectionProps<T> = Omit<DashboardPreviewSectionProps<T>, 'previewCount'>
export type DashboardActivityPreviewSectionProps<T> = Omit<DashboardPreviewSectionProps<T>, 'previewCount'>
