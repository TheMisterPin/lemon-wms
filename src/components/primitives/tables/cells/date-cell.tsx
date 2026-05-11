'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/tables/cells/date-cell.md
 */


import type { DataColumnConfig } from '@/types/components/table/column.types'

import { StyledDisplayCell } from './styled-display-cell'

export function DateCell({ row, column }: { row: unknown, column: DataColumnConfig }) {
  return <StyledDisplayCell row={row} column={column} />
}
