'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { FieldValues } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { formatDisplayValue, getValueByPath } from '@/lib/utils/get-value-by-path'
import { GenericTableProps, SortDirection, TableColumnConfig } from '@/types/components/table/generic-table.types'

function getRawValue<T extends FieldValues>(row: T, column: TableColumnConfig<T>): unknown {
  if (column.accessorPath) {
    return getValueByPath(row, column.accessorPath)
  }

  if (column.accessor) {
    return row[column.accessor]
  }

  return undefined
}

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

function compareValues(a: unknown, b: unknown, direction: SortDirection): number {
  if (a === null && b === null) {
    return 0
  }

  if (a === undefined && b === undefined) {
    return 0
  }

  if (a === null || a === undefined) {
    return 1
  }

  if (b === null || b === undefined) {
    return -1
  }

  const modifier = direction === 'asc' ? 1 : -1

  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b) * modifier
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return (a - b) * modifier
  }

  if (a instanceof Date && b instanceof Date) {
    return (a.getTime() - b.getTime()) * modifier
  }

  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return (Number(a) - Number(b)) * modifier
  }

  return String(a).localeCompare(String(b)) * modifier
}

function isSortable<T extends FieldValues>(column: TableColumnConfig<T>): boolean {
  if (column.sortable === false) {
    return false
  }

  return !!(column.accessor || column.accessorPath)
}

export function GenericTable<T extends FieldValues & { id: string }>({
  columns,
  records,
  onRowClick,
  selectedId,
  emptyMessage = 'No records found.',
  actions
}: GenericTableProps<T>) {
  const totalColumns = columns.length + (actions?.length ? 1 : 0)

  const [sortColumnIndex, setSortColumnIndex] = useState<number | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  function handleSort(index: number) {
    if (sortColumnIndex === index) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else {
        setSortColumnIndex(null)
        setSortDirection('asc')
      }
    } else {
      setSortColumnIndex(index)
      setSortDirection('asc')
    }
  }

  const sortedRecords = useMemo(() => {
    if (sortColumnIndex === null) {
      return records
    }

    const column = columns[sortColumnIndex]

    return [...records].sort((a, b) =>
      compareValues(getRawValue(a, column), getRawValue(b, column), sortDirection)
    )
  }, [records, columns, sortColumnIndex, sortDirection])

  function getSortIcon(index: number) {
    if (sortColumnIndex !== index) {
      return <ArrowUpDown className="size-3.5 opacity-30" />
    }

    if (sortDirection === 'asc') {
      return <ArrowUp className="size-3.5 text-brand-primary" />
    }

    return <ArrowDown className="size-3.5 text-brand-primary" />
  }

  return (
    <TooltipProvider>
      <div className="w-10/12 mx-auto rounded-xl border border-brand-glass-border bg-brand-glass backdrop-blur-sm overflow-hidden shadow-lg shadow-black/20">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-brand-glass-border hover:bg-transparent">
              {columns.map((column, index) => {
                const sortable = isSortable(column)
                const isActive = sortColumnIndex === index

                return (
                  <TableHead
                    key={index}
                    className={[
                      column.className,
                      'bg-brand-surface/80 text-brand-muted text-xs font-semibold uppercase tracking-wider text-center select-none transition-colors duration-200',
                      sortable ? 'cursor-pointer hover:text-brand-text hover:bg-brand-glass-hover' : '',
                      isActive ? 'bg-brand-primary/8 text-brand-primary' : ''
                    ].filter(Boolean).join(' ')}
                    onClick={sortable ? () => handleSort(index) : undefined}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      {column.label}
                      {sortable && getSortIcon(index)}
                    </div>
                  </TableHead>
                )
              })}
              {actions?.length && (
                <TableHead className='bg-brand-surface/80 text-brand-muted text-xs font-semibold uppercase tracking-wider text-center select-none'>
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRecords.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={totalColumns} className="text-center text-brand-subtle py-12">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              sortedRecords.map((row) => (
                <TableRow
                  key={row.id}
                  className={[
                    'border-b border-brand-glass-border transition-colors duration-200',
                    onRowClick ? 'cursor-pointer hover:bg-brand-glass-hover' : 'hover:bg-brand-glass-hover/50',
                    selectedId === row.id ? 'bg-brand-primary/8' : ''
                  ].filter(Boolean).join(' ')}
                  onClick={() => onRowClick?.(row)}
                  data-state={selectedId === row.id ? 'selected' : undefined}
                >
                  {columns.map((column, index) => (
                    <TableCell
                      key={index}
                      className={[
                        column.cellClassName,
                        'text-center text-brand-text/90 text-sm select-none'
                      ].filter(Boolean).join(' ')}
                    >
                      {getCellValue(row, column)}
                    </TableCell>
                  ))}
                  {actions?.length && (
                    <TableCell className='text-center'>
                      <div className='flex items-center justify-center gap-1'>
                        {actions.map((action, index) => (
                          <Tooltip key={index}>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={[
                                  'size-8 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-glass-hover transition-colors duration-200',
                                  action.className
                                ].filter(Boolean).join(' ')}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  action.onClick(row)
                                }}
                              >
                                {action.icon}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {action.tooltip}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}
