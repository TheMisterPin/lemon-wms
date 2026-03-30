'use client'

import { FieldValues } from 'react-hook-form'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { formatDisplayValue, getValueByPath } from '@/lib/utils/get-value-by-path'
import { GenericTableProps, TableColumnConfig } from '@/types/components/table/generic-table.types'

function getCellValue<T extends FieldValues>(row: T, column: TableColumnConfig<T>): React.ReactNode {
  if (column.cell) {
    return column.cell(row)
  }
  if (column.accessorPath) {
    return formatDisplayValue(getValueByPath(row, column.accessorPath))
  }
  if (column.accessor) {
    return formatDisplayValue(row[column.accessor])
  }

  return '—'
}

export function GenericTable<T extends FieldValues & { id: string }>({
  columns,
  records,
  onRowClick,
  selectedId,
  emptyMessage = 'No records found.'
}: GenericTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead key={index} className={column.className}>
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          records.map((row) => (
            <TableRow
              key={row.id}
              className={[
                onRowClick ? 'cursor-pointer' : '',
                selectedId === row.id ? 'bg-muted' : ''
              ].filter(Boolean).join(' ')}
              onClick={() => onRowClick?.(row)}
              data-state={selectedId === row.id ? 'selected' : undefined}
            >
              {columns.map((column, index) => (
                <TableCell key={index} className={column.className}>
                  {getCellValue(row, column)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
