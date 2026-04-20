'use client'

import { TableShell } from '@/components/tables/table-shell'
import { useTableShellController } from '@/hooks/table/use-table-shell-controller'
import type { GenericTableProps } from '@/types/components/table/generic-table.types'

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
  builtInPaginationPosition = 'footer',
  rowStyleIf,
  search
}: GenericTableProps<T>) {
  const {
    visibleColumns,
    searchText,
    setSearchText,
    displayRecords,
    effectivePagination,
    showHeaderPagination,
    showFooterPagination,
    sortColumnIndex,
    sortDirection,
    handleSortColumnClick
  } = useTableShellController({
    columns,
    records,
    pagination,
    pageSize,
    builtInPaginationPosition,
    search
  })

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
