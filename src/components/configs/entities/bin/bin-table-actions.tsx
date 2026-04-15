'use client'

import { Package } from 'lucide-react'

import type { RowAction } from '@/types/components/table/generic-table.types'

export function viewBinContentsRowAction(onOpen: (binId: string) => void): RowAction<{ id: string }> {
  return {
    icon: <Package className="size-4" />,
    tooltip: 'View contents',
    onClick: (row) => onOpen(row.id)
  }
}
