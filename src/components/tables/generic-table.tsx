'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { FieldValues } from 'react-hook-form'

import { PaginationSelector } from '@/components/shared/PaginationSelector'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
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
import {
  EMPTY_DISPLAY_VALUE,
  formatDisplayValue,
  getValueByPath
} from '@/lib/utils/get-value-by-path'
import {
  GenericTableProps,
  IndicatorColorMap,
  ProgressColumnConfig,
  SortDirection,
  TableColumnConfig,
  TableColumnType
} from '@/types/components/table/generic-table.types'
import { formatDateValue, parseDateValue } from '@/utils/formatters/date-utils'

function getRawValue<T extends FieldValues>(row: T, column: TableColumnConfig<T>): unknown {
  if (column.accessorPath) {
    return getValueByPath(row, column.accessorPath)
  }

  if (column.accessor) {
    return row[column.accessor]
  }

  return undefined
}

function getNumericValue(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const numericValue = Number(value)

    if (Number.isFinite(numericValue)) {
      return numericValue
    }
  }

  return undefined
}

function getProgressValues<T extends FieldValues>(
  row: T,
  column: ProgressColumnConfig<T>
): { current: number, max: number, percentage: number } | undefined {
  const current = getNumericValue(getValueByPath(row, column.progressBarRef.current))
  const max = getNumericValue(getValueByPath(row, column.progressBarRef.max))

  if (current === undefined || max === undefined || current < 0 || max < 0) {
    return undefined
  }

  if (max === 0) {
    if (current !== 0) {
      return undefined
    }

    return {
      current,
      max,
      percentage: 0
    }
  }

  return {
    current,
    max,
    percentage: Math.min(Math.max((current / max) * 100, 0), 100)
  }
}

function isTemporalColumnType(
  columnType: TableColumnType | undefined
): columnType is 'date' | 'datetime' | 'time' {
  return columnType === 'date' || columnType === 'datetime' || columnType === 'time'
}

function getComparableValue(value: unknown, columnType: TableColumnType | undefined): unknown {
  if (columnType === 'boolean') {
    return typeof value === 'boolean' ? value : undefined
  }

  if (!isTemporalColumnType(columnType)) {
    return value
  }

  if (!(value instanceof Date) && typeof value !== 'string' && typeof value !== 'number') {
    return undefined
  }

  return parseDateValue(value)?.getTime()
}

function getColumnComparableValue<T extends FieldValues>(row: T, column: TableColumnConfig<T>): unknown {
  if (column.type === 'progress') {
    return getProgressValues(row, column)?.percentage
  }

  if (column.type === 'joinValues') {
    const first = getValueByPath(row, column.joinValuesRef.first)
    const second = getValueByPath(row, column.joinValuesRef.second)

    if (isJoinPrimaryValueEmpty(first)) {
      return undefined
    }

    const separator = column.separator ?? ' '

    return `${formatDisplayValue(first)}${separator}${formatDisplayValue(second)}`
  }

  return getComparableValue(getRawValue(row, column), column.type)
}

function isNullOrEmptyTextValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true
  }

  if (typeof value === 'string') {
    return value.trim() === ''
  }

  return false
}

function isJoinPrimaryValueEmpty(value: unknown): boolean {
  if (isNullOrEmptyTextValue(value)) {
    return true
  }

  if (typeof value === 'number') {
    return value === 0
  }

  if (typeof value === 'string') {
    const numericValue = Number(value)

    if (Number.isFinite(numericValue)) {
      return numericValue === 0
    }
  }

  return false
}

function shouldHideColumn<T extends FieldValues>(column: TableColumnConfig<T>, records: T[]): boolean {
  if (records.length === 0) {
    return false
  }

  if (column.type === 'progress') {
    return records.every((record) => getProgressValues(record, column) === undefined)
  }

  if (column.type === 'joinValues') {
    return records.every((record) => {
      const first = getValueByPath(record, column.joinValuesRef.first)

      return isJoinPrimaryValueEmpty(first)
    })
  }

  if (column.cell) {
    return false
  }

  return records.every((record) => isNullOrEmptyTextValue(getRawValue(record, column)))
}

function getIndicatorColor(value: unknown, colorMap: IndicatorColorMap, fallbackColor = '#94a3b8'): string {
  const indicatorKey = String(value ?? '').trim().toLowerCase()

  if (!indicatorKey) {
    return fallbackColor
  }

  const directMatch = colorMap[indicatorKey]

  if (directMatch) {
    return directMatch
  }

  const normalizedMatch = Object.entries(colorMap).find(
    ([key]) => key.trim().toLowerCase() === indicatorKey
  )

  return normalizedMatch?.[1] ?? fallbackColor
}

function formatTypedValue<T extends FieldValues>(
  row: T,
  value: unknown,
  column: TableColumnConfig<T>
): React.ReactNode {
  if (column.type === 'progress') {
    const progressValues = getProgressValues(row, column)

    if (!progressValues) {
      return EMPTY_DISPLAY_VALUE
    }

    const roundedPercentage = Math.round(progressValues.percentage)

    return (
      <div className="mx-auto flex w-full max-w-36 items-center gap-2">
        <Progress
          value={progressValues.percentage}
          className="flex-1"
          aria-label={`${column.label}: ${progressValues.current} of ${progressValues.max} (${roundedPercentage}%)`}
        />
        <span className="min-w-10 text-right text-xs text-brand-muted tabular-nums">
          {roundedPercentage}%
        </span>
      </div>
    )
  }

  if (column.type === 'boolean') {
    if (typeof value !== 'boolean') {
      return EMPTY_DISPLAY_VALUE
    }

    return (
      <div className="flex justify-center">
        <Checkbox
          checked={value}
          disabled
          aria-label={`${column.label}: ${value ? 'checked' : 'unchecked'}`}
          className="pointer-events-none"
        />
      </div>
    )
  }

  if (isTemporalColumnType(column.type)) {
    if (!(value instanceof Date) && typeof value !== 'string' && typeof value !== 'number') {
      return EMPTY_DISPLAY_VALUE
    }

    return formatDateValue(value, column.type) || EMPTY_DISPLAY_VALUE
  }

  if (column.type === 'indicator') {
    const color = getIndicatorColor(value, column.indicatorColorMap, column.defaultIndicatorColor)
    const displayValue = formatDisplayValue(value)

    return (
      <div className="flex justify-center">
        <span
          className="size-3.5 rounded-full animate-pulse"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}66, 0 0 14px ${color}33`
          }}
          aria-label={`${column.label}: ${displayValue}`}
        />
      </div>
    )
  }

  if (column.type === 'joinValues') {
    const first = getValueByPath(row, column.joinValuesRef.first)
    const second = getValueByPath(row, column.joinValuesRef.second)

    if (isJoinPrimaryValueEmpty(first)) {
      return EMPTY_DISPLAY_VALUE
    }

    const separator = column.separator ?? ' '

    return `${formatDisplayValue(first)}${separator}${formatDisplayValue(second)}`
  }

  return formatDisplayValue(value)
}

function getCellValue<T extends FieldValues>(row: T, column: TableColumnConfig<T>): React.ReactNode {
  if (column.cell) {
    return column.cell(row)
  }

  const value = getRawValue(row, column)

  return formatTypedValue(row, value, column)
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

  return column.type === 'progress' || column.type === 'joinValues' || !!(column.accessor || column.accessorPath)
}

export function GenericTable<T extends FieldValues & { id: string }>({
  columns,
  records,
  onRowClick,
  selectedId,
  emptyMessage = 'No records found.',
  actions,
  pagination
}: GenericTableProps<T>) {
  const visibleColumns = useMemo(
    () => columns.filter((column) => !shouldHideColumn(column, records)),
    [columns, records]
  )

  const totalColumns = Math.max(1, visibleColumns.length + (actions?.length ? 1 : 0))
  const paginationPosition = pagination?.position ?? 'footer'
  const showHeaderPagination = paginationPosition === 'header'
  const showFooterPagination = paginationPosition === 'footer'

  const [sortColumnIndex, setSortColumnIndex] = useState<number | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  useEffect(() => {
    if (sortColumnIndex === null) {
      return
    }

    if (sortColumnIndex >= visibleColumns.length) {
      setSortColumnIndex(null)
      setSortDirection('asc')
    }
  }, [sortColumnIndex, visibleColumns.length])

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

    const column = visibleColumns[sortColumnIndex]

    if (!column) {
      return records
    }

    return [...records].sort((a, b) =>
      compareValues(
        getColumnComparableValue(a, column),
        getColumnComparableValue(b, column),
        sortDirection
      )
    )
  }, [records, visibleColumns, sortColumnIndex, sortDirection])

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
      <div className="mx-auto w-10/12 overflow-hidden rounded-xl border border-brand-glass-border bg-brand-glass shadow-lg shadow-black/20 backdrop-blur-sm">
        {pagination && showHeaderPagination && (
          <div className="border-b border-brand-glass-border px-4 py-3">
            <PaginationSelector
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPrev={pagination.onPrev}
              onNext={pagination.onNext}
            />
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow className="border-b border-brand-glass-border hover:bg-transparent">
              {visibleColumns.map((column, index) => {
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
                  {visibleColumns.map((column, index) => (
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

        {pagination && showFooterPagination && (
          <div className="border-t border-brand-glass-border px-4 py-3">
            <PaginationSelector
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPrev={pagination.onPrev}
              onNext={pagination.onNext}
            />
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
