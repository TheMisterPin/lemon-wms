'use client'

import type { DataColumnConfig } from '@/types/components/table/column.types'

import { StyledDisplayCell } from './styled-display-cell'

export function JoinValuesCell({ row, column }: { row: unknown, column: DataColumnConfig }) {
  return <StyledDisplayCell row={row} column={column} />
}
