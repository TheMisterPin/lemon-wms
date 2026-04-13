/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'

import { TableShell } from '@/components/tables/table-shell'
import {
  filterRowsBySearch,
  isDataColumn,
  shouldHideColumnWhenAllCellsEmpty,
  sortRowsByDataColumn
} from '@/lib/utils/table'
import type { DataColumnConfig } from '@/types/components/table/column.types'
import type { GenericTableProps, SortDirection } from '@/types/components/table/generic-table.types'

export function GenericTable<T extends { id: string }>({
  columns,
  records,
  onRowClick,
  selectedId,
  title,
  titleIcon,
  entityTone,
  headerButtons,
  emptyMessage = 'No records found.',
  actions,
  pagination,
  pageSize,
  rowStyleIf,
  search
}: GenericTableProps<T>) {
  const visibleColumns = useMemo(
    () => columns.filter(column => !shouldHideColumnWhenAllCellsEmpty(column, records)),
    [columns, records]
  )

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

  function handleSortColumnClick(index: number) {
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

  const filteredRecords = useMemo(
    () => filterRowsBySearch(records, visibleColumns, searchText, search),
    [records, visibleColumns, searchText, search]
  )

  const sortedRecords = useMemo(() => {
    if (sortColumnIndex === null) {
      return filteredRecords
    }

    const column = visibleColumns[sortColumnIndex]

    if (!column || !isDataColumn(column)) {
      return filteredRecords
    }

    return sortRowsByDataColumn(filteredRecords, column as DataColumnConfig, sortDirection)
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

    setInternalPage(previous => Math.min(previous, builtInTotalPages - 1))
  }, [useBuiltInPagination, builtInTotalPages])

  const displayRecords = useMemo(() => {
    if (!useBuiltInPagination || !pageSize) {
      return sortedRecords
    }

    const start = internalPage * pageSize

    return sortedRecords.slice(start, start + pageSize)
  }, [useBuiltInPagination, sortedRecords, internalPage, pageSize])

  const effectivePagination =
    pagination ??
    (useBuiltInPagination
      ? {
        page: internalPage,
        totalPages: builtInTotalPages,
        onPrev: () => setInternalPage(previous => Math.max(0, previous - 1)),
        onNext: () => setInternalPage(previous =>
          Math.min(builtInTotalPages - 1, previous + 1)
        ),
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

  return (
    <TableShell
      title={title}
      titleIcon={titleIcon}
      entityTone={entityTone}
      headerButtons={headerButtons}
      search={search}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      pagination={effectivePagination}
      showHeaderPagination={showHeaderPagination}
      showFooterPagination={showFooterPagination}
      visibleColumns={visibleColumns}
      displayRecords={displayRecords}
      sortColumnIndex={sortColumnIndex}
      sortDirection={sortDirection}
      onSortColumnClick={handleSortColumnClick}
      emptyMessage={emptyMessage}
      actions={actions}
      onRowClick={onRowClick}
      selectedId={selectedId}
      rowStyleIf={rowStyleIf}
    />
  )
}
