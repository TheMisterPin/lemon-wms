/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react'
import { FieldValues } from 'react-hook-form'

import { PaginationSelector } from '@/components/shared/PaginationSelector'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
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
  getDisplayFieldTextValue,
  getComparableDisplayFieldValue,
  getDisplayFieldRawValue,
  getProgressValues,
  isJoinPrimaryValueEmpty,
  isNullOrEmptyTextValue,
  renderDisplayFieldValue,
  isTemporalDisplayFieldType
} from '@/lib/utils/display-fields'
import { EMPTY_DISPLAY_VALUE, getValueByPath } from '@/lib/utils/get-value-by-path'
import {
  DataColumnConfig,
  GenericTableProps,
  ProgressColumnConfig,
  SortDirection,
  TableColumnConfig,
  TableRowStyleIfConfig,
  TableRowStyleIfRule
} from '@/types/components/table/generic-table.types'

function isDataColumn<T extends FieldValues>(column: TableColumnConfig<T>): column is DataColumnConfig<T> {
  return !('cell' in column)
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

  if (!isDataColumn(column)) {
    return false
  }

  return records.every((record) => isNullOrEmptyTextValue(getDisplayFieldRawValue(record, column)))
}

function rowMatchesStyleRule<T extends FieldValues>(row: T, rule: TableRowStyleIfRule<T>): boolean {
  const raw = getValueByPath(row, rule.colName)

  if (rule.whenPositive) {
    return Number(raw) > 0
  }

  if (rule.value !== undefined) {
    return raw === rule.value || String(raw) === String(rule.value)
  }

  return Boolean(raw)
}

function getRowStyleClasses<T extends FieldValues>(
  row: T,
  config?: TableRowStyleIfConfig<T>
): { bgClassName: string; textClassName: string } {
  if (!config?.rules?.length) {
    return { bgClassName: '', textClassName: '' }
  }

  for (const rule of config.rules) {
    if (rowMatchesStyleRule(row, rule)) {
      return {
        bgClassName: rule.bgClassName ?? '',
        textClassName: rule.textClassName ?? ''
      }
    }
  }

  return {
    bgClassName: config.defaultBgClassName ?? '',
    textClassName: config.defaultTextClassName ?? ''
  }
}

function getIndicatorColor(value: unknown, colorMap: Record<string, string>, fallbackColor = '#94a3b8'): string {
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

function formatTypedValue<T extends FieldValues>(row: T, column: DataColumnConfig<T>): React.ReactNode {
  if (column.type === 'progress') {
    const progressValues = getProgressValues(row, column as ProgressColumnConfig<T>)

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

  const value = getDisplayFieldRawValue(row, column)

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

  if (isTemporalDisplayFieldType(column.type)) {
    return getDisplayFieldTextValue(row, column)
  }

  if (column.type === 'indicator') {
    const color = getIndicatorColor(value, column.indicatorColorMap, column.defaultIndicatorColor)
    const displayValue = getDisplayFieldTextValue(row, column)

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

  return renderDisplayFieldValue(row, column)
}

function getCellValue<T extends FieldValues>(row: T, column: TableColumnConfig<T>): React.ReactNode {
  if (!isDataColumn(column)) {
    return column.cell(row)
  }

  return formatTypedValue(row, column)
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

  if (!isDataColumn(column)) {
    return false
  }

  return column.type === 'progress' || column.type === 'joinValues' || !!(column.accessor || column.accessorPath)
}

type EntityTone = 'warehouse' | 'zone' | 'bin' | 'item' | 'order'

function getEntityTone(tone?: EntityTone) {
  const tones = {
    warehouse: {
      iconClass: 'text-entity-warehouse',
      titleStyle: {
        backgroundImage: 'linear-gradient(to right, var(--entity-warehouse), var(--entity-warehouse-end))'
      }
    },
    zone: {
      iconClass: 'text-entity-zone',
      titleStyle: {
        backgroundImage: 'linear-gradient(to right, var(--entity-zone), var(--entity-zone-end))'
      }
    },
    bin: {
      iconClass: 'text-entity-bin',
      titleStyle: {
        backgroundImage: 'linear-gradient(to right, var(--entity-bin), var(--entity-bin-end))'
      }
    },
    item: {
      iconClass: 'text-brand-primary',
      titleStyle: {
        backgroundImage: 'linear-gradient(to right, var(--brand-primary), var(--brand-primary-end))'
      }
    },
    order: {
      iconClass: 'text-brand-primary',
      titleStyle: {
        backgroundImage: 'linear-gradient(to right, var(--brand-primary), var(--brand-primary-end))'
      }
    }
  } as const

  return tone ? tones[tone] : tones.item
}

export function GenericTable<T extends FieldValues & { id: string }>({
  columns,
  records,
  onRowClick,
  selectedId,
  emptyMessage = 'No records found.',
  actions,
  pagination,
  pageSize,
  rowStyleIf,
  toolbarExtra,
  search,
  section
}: GenericTableProps<T>) {
  const visibleColumns = useMemo(
    () => columns.filter((column) => !shouldHideColumn(column, records)),
    [columns, records]
  )

  const totalColumns = Math.max(1, visibleColumns.length + (actions?.length ? 1 : 0))
  const tone = getEntityTone(section?.entityTone)
  const [searchText, setSearchText] = useState('')
  const [internalPage, setInternalPage] = useState(0)

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

  const filteredRecords = useMemo(() => {
    if (!search?.enabled || searchText.trim() === '') {
      return records
    }

    const normalizedSearch = searchText.trim().toLowerCase()

    return records.filter((record) => {
      const searchableValues = search.fields?.length
        ? search.fields.map((fieldName) => record[fieldName])
        : visibleColumns
          .filter((column): column is DataColumnConfig<T> => isDataColumn(column))
          .map((column) => getDisplayFieldTextValue(record, column))

      return searchableValues
        .map((value) => String(value ?? '').toLowerCase())
        .some((value) => value.includes(normalizedSearch))
    })
  }, [records, search, searchText, visibleColumns])

  const sortedRecords = useMemo(() => {
    if (sortColumnIndex === null) {
      return filteredRecords
    }

    const column = visibleColumns[sortColumnIndex]
    if (!column || !isDataColumn(column)) {
      return filteredRecords
    }

    return [...filteredRecords].sort((a, b) =>
      compareValues(
        getComparableDisplayFieldValue(a, column),
        getComparableDisplayFieldValue(b, column),
        sortDirection
      )
    )
  }, [filteredRecords, visibleColumns, sortColumnIndex, sortDirection])

  const useBuiltInPagination =
    pagination === undefined && typeof pageSize === 'number' && pageSize > 0

  const builtInTotalPages = useMemo(() => {
    if (!useBuiltInPagination || !pageSize) {
      return 1
    }

    return Math.max(1, Math.ceil(sortedRecords.length / pageSize))
  }, [useBuiltInPagination, sortedRecords.length, pageSize])

  useEffect(() => {
    if (!useBuiltInPagination) {
      return
    }

    setInternalPage((previous) => Math.min(previous, builtInTotalPages - 1))
  }, [useBuiltInPagination, builtInTotalPages])

  const displayRecords = useMemo(() => {
    if (!useBuiltInPagination || !pageSize) {
      return sortedRecords
    }

    const start = internalPage * pageSize

    return sortedRecords.slice(start, start + pageSize)
  }, [useBuiltInPagination, sortedRecords, internalPage, pageSize])

  const effectivePagination = pagination
    ?? (useBuiltInPagination
      ? {
        page: internalPage,
        totalPages: builtInTotalPages,
        onPrev: () => setInternalPage((previous) => Math.max(0, previous - 1)),
        onNext: () => setInternalPage((previous) => Math.min(builtInTotalPages - 1, previous + 1)),
        position: 'footer' as const
      }
      : undefined)

  const paginationPosition = effectivePagination?.position ?? 'footer'
  const showHeaderPagination = paginationPosition === 'header'
  const showFooterPagination = paginationPosition === 'footer'

  useEffect(() => {
    if (!useBuiltInPagination) {
      return
    }

    setInternalPage(0)
  }, [useBuiltInPagination, searchText, records.length])

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
      <div className="mx-auto w-full overflow-hidden shadow-lg shadow-black/20 backdrop-blur-sm rounded-lg">
        {section?.title && (
          <div className="flex items-center justify-between gap-4 border-b border-brand-glass-border px-4 py-3">
            <div className="flex items-center gap-2">
              {section.icon ? <section.icon size={20} className={tone.iconClass} /> : null}
              <h2 className="bg-clip-text text-xl font-semibold text-transparent" style={tone.titleStyle}>
                {section.title}
              </h2>
            </div>
            {effectivePagination && showHeaderPagination && (
              <PaginationSelector
                page={effectivePagination.page}
                totalPages={effectivePagination.totalPages}
                onPrev={effectivePagination.onPrev}
                onNext={effectivePagination.onNext}
              />
            )}
          </div>
        )}
        {(search?.enabled || toolbarExtra) && (
          <div
            className={[
              'border-b border-brand-glass-border p-3 flex flex-wrap items-center gap-3',
              search?.enabled ? '' : 'justify-end'
            ].filter(Boolean).join(' ')}
          >
            {search?.enabled && (
              <div className="relative min-w-[200px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-subtle" />
                <Input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder={search.placeholder ?? 'Search records...'}
                  className="pl-9"
                  aria-label="Search records"
                />
              </div>
            )}
            {toolbarExtra ? <div className="flex shrink-0 items-center gap-2">{toolbarExtra}</div> : null}
          </div>
        )}
        {effectivePagination && showHeaderPagination && !section?.title && (
          <div className="border-b border-brand-glass-border px-4 py-3">
            <PaginationSelector
              page={effectivePagination.page}
              totalPages={effectivePagination.totalPages}
              onPrev={effectivePagination.onPrev}
              onNext={effectivePagination.onNext}
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
            {displayRecords.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={totalColumns} className="text-center text-brand-subtle py-12">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              displayRecords.map((row) => {
                const rowStyles = getRowStyleClasses(row, rowStyleIf)

                return (
                  <TableRow
                    key={row.id}
                    className={[
                      'border-b border-brand-glass-border transition-colors duration-200',
                      onRowClick ? 'cursor-pointer hover:bg-brand-glass-hover' : 'hover:bg-brand-glass-hover/50',
                      selectedId === row.id ? 'bg-brand-primary/8' : '',
                      rowStyles.bgClassName
                    ].filter(Boolean).join(' ')}
                    onClick={() => onRowClick?.(row)}
                    data-state={selectedId === row.id ? 'selected' : undefined}
                  >
                    {visibleColumns.map((column, index) => (
                      <TableCell
                        key={index}
                        className={[
                          column.cellClassName,
                          'text-center text-brand-text/90 text-sm select-none',
                          rowStyles.textClassName
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
                )
              })
            )}
          </TableBody>
        </Table>

        {effectivePagination && showFooterPagination && (
          <div className="border-t border-brand-glass-border px-4 py-3">
            <PaginationSelector
              page={effectivePagination.page}
              totalPages={effectivePagination.totalPages}
              onPrev={effectivePagination.onPrev}
              onNext={effectivePagination.onNext}
            />
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
