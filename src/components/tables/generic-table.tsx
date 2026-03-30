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
    <Table className="w-10/12 mx-auto bg-dash-card border border-brand-border rounded-lg overflow-hidden">
      <TableHeader className='bg-brand-surface border border-slate-600 text-center'>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead key={index} className={[column.className, 'bg-brand-surface border select-none border-slate-600 text-center'].filter(Boolean).join(' ')}>
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.length === 0 ? (
          <TableRow className='bg-brand-surface border border-slate-600 text-center'>
            <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          records.map((row) => (
            <TableRow
              key={row.id}
              className={[
                ' border border-slate-600 text-center',

                onRowClick ? 'cursor-pointer' : '',
                selectedId === row.id ? 'bg-muted' : ''
              ].filter(Boolean).join(' ')}
              onClick={() => onRowClick?.(row)}
              data-state={selectedId === row.id ? 'selected' : undefined}
            >
              {columns.map((column, index) => (
                <TableCell key={index} className={[column.className, ' border border-slate-600 text-center select-none'].filter(Boolean).join(' ')}>
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
