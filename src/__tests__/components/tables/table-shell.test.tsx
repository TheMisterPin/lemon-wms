// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { TableShell } from '@/components/primitives/tables/table-shell'
import type { ColumnConfig } from '@/types/components/table/column.types'

type Row = { id: string, name: string }

describe('TableShell', () => {
  const columns: ColumnConfig<Row>[] = [{ label: 'Name', accessor: 'name' }]
  const records: Row[] = [{ id: '1', name: 'Ada' }]

  it('invokes onSortColumnClick when sortable header clicked', () => {
    const onSort = vi.fn()

    render(
      <TableShell
        search={false}
        searchText=""
        onSearchTextChange={vi.fn()}
        showHeaderPagination={false}
        showFooterPagination={false}
        visibleColumns={columns}
        displayRecords={records}
        sortColumnIndex={null}
        sortDirection="asc"
        onSortColumnClick={onSort}
      />
    )

    fireEvent.click(screen.getByText('Name'))

    expect(onSort).toHaveBeenCalledWith(0)
  })

  it('calls onSearchTextChange when typing in search', () => {
    const onSearch = vi.fn()

    render(
      <TableShell
        search={{}}
        searchText=""
        onSearchTextChange={onSearch}
        showHeaderPagination={false}
        showFooterPagination={false}
        visibleColumns={columns}
        displayRecords={records}
        sortColumnIndex={null}
        sortDirection="asc"
        onSortColumnClick={vi.fn()}
      />
    )

    fireEvent.change(screen.getByLabelText('Search records'), {
      target: { value: 'a' }
    })

    expect(onSearch).toHaveBeenCalledWith('a')
  })
})
