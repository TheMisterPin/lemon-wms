// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { GenericTable } from '@/components/tables/generic-table'
import type { TableColumnConfig } from '@/types/components/table/generic-table.types'

type TestRow = {
  id: string
  name: string
  status: string
  hiddenValue?: string | null
  uom: string
  createdAt: string
  lastSeenAt: string
  isActive: boolean
  currentCapacity: number
  maxCapacity: number
}

describe('GenericTable', () => {
  it('formats temporal columns and renders boolean columns as checkboxes', () => {
    const columns: TableColumnConfig<TestRow>[] = [
      { label: 'Name', accessor: 'name' },
      {
        label: 'Status',
        accessor: 'status',
        type: 'indicator',
        indicatorColorMap: {
          active: '#4ade80',
          inactive: '#f87171'
        }
      },
      { label: 'Created', accessor: 'createdAt', type: 'date' },
      { label: 'Last seen', accessor: 'lastSeenAt', type: 'time' },
      { label: 'Active', accessor: 'isActive', type: 'boolean' },
      {
        label: 'Progress',
        type: 'progress',
        progressBarRef: {
          current: 'currentCapacity',
          max: 'maxCapacity'
        }
      },
      {
        label: 'Capacity',
        type: 'joinValues',
        joinValuesRef: {
          first: 'currentCapacity',
          second: 'uom'
        }
      }
    ]

    render(
      <GenericTable
        columns={columns}
        records={[
          {
            id: 'warehouse-1',
            name: 'North Hub',
            status: 'active',
            uom: 'EA',
            createdAt: '2025-03-15T00:00:00Z',
            lastSeenAt: '2025-03-15T09:45:00Z',
            isActive: true,
            currentCapacity: 25,
            maxCapacity: 100
          },
          {
            id: 'warehouse-2',
            name: 'South Hub',
            status: 'inactive',
            uom: 'EA',
            createdAt: '2025-03-16T00:00:00Z',
            lastSeenAt: '2025-03-15T18:05:00Z',
            isActive: false,
            currentCapacity: 80,
            maxCapacity: 100
          }
        ]}
      />
    )

    expect(screen.getByText(/march 15/i)).toBeTruthy()
    expect(screen.getByText(/09:45|9:45/)).toBeTruthy()
    expect(screen.getByLabelText('Status: active')).toBeTruthy()
    expect(screen.getByLabelText('Status: inactive')).toBeTruthy()
    expect(screen.getByText('25 EA')).toBeTruthy()
    expect(screen.getByText('80 EA')).toBeTruthy()

    const checkboxes = screen.getAllByRole('checkbox')
    const progressBars = screen.getAllByRole('progressbar')

    expect(checkboxes).toHaveLength(2)
    expect(checkboxes[0].getAttribute('data-state')).toBe('checked')
    expect(checkboxes[1].getAttribute('data-state')).toBe('unchecked')
    expect(progressBars).toHaveLength(2)
    expect(screen.getByText('25%')).toBeTruthy()
    expect(screen.getByText('80%')).toBeTruthy()
  })

  it('renders shared pagination controls when pagination config is provided', () => {
    const onPrev = vi.fn()
    const onNext = vi.fn()
    const columns: TableColumnConfig<TestRow>[] = [
      { label: 'Name', accessor: 'name' }
    ]

    render(
      <GenericTable
        columns={columns}
        records={[
          {
            id: 'warehouse-1',
            name: 'North Hub',
            status: 'active',
            uom: 'EA',
            createdAt: '2025-03-15T00:00:00Z',
            lastSeenAt: '2025-03-15T09:45:00Z',
            isActive: true,
            currentCapacity: 25,
            maxCapacity: 100
          }
        ]}
        pagination={{
          page: 1,
          totalPages: 3,
          onPrev,
          onNext,
          position: 'footer'
        }}
      />
    )

    expect(screen.getByText('2 / 3')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /previous page/i }))
    fireEvent.click(screen.getByRole('button', { name: /next page/i }))

    expect(onPrev).toHaveBeenCalledTimes(1)
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('hides columns when all values are null or empty strings', () => {
    const columns: TableColumnConfig<TestRow>[] = [
      { label: 'Name', accessor: 'name' },
      { label: 'Hidden Column', accessor: 'hiddenValue' }
    ]

    render(
      <GenericTable
        columns={columns}
        records={[
          {
            id: 'warehouse-1',
            name: 'North Hub',
            status: 'active',
            hiddenValue: null,
            uom: 'EA',
            createdAt: '2025-03-15T00:00:00Z',
            lastSeenAt: '2025-03-15T09:45:00Z',
            isActive: true,
            currentCapacity: 25,
            maxCapacity: 100
          },
          {
            id: 'warehouse-2',
            name: 'South Hub',
            status: 'inactive',
            hiddenValue: '',
            uom: 'EA',
            createdAt: '2025-03-16T00:00:00Z',
            lastSeenAt: '2025-03-15T18:05:00Z',
            isActive: false,
            currentCapacity: 80,
            maxCapacity: 100
          }
        ]}
      />
    )

    expect(screen.getByText('Name')).toBeTruthy()
    expect(screen.queryByText('Hidden Column')).toBeNull()
  })

  it('renders joinValues as empty when first value is zero', () => {
    const columns: TableColumnConfig<TestRow>[] = [
      { label: 'Name', accessor: 'name' },
      {
        label: 'Capacity',
        type: 'joinValues',
        joinValuesRef: {
          first: 'currentCapacity',
          second: 'uom'
        }
      }
    ]

    render(
      <GenericTable
        columns={columns}
        records={[
          {
            id: 'warehouse-1',
            name: 'North Hub',
            status: 'active',
            uom: 'EA',
            createdAt: '2025-03-15T00:00:00Z',
            lastSeenAt: '2025-03-15T09:45:00Z',
            isActive: true,
            currentCapacity: 0,
            maxCapacity: 100
          }
        ]}
      />
    )

    expect(screen.queryByText('0 EA')).toBeNull()
  })

  it('filters rows when optional search is enabled', () => {
    const columns: TableColumnConfig<TestRow>[] = [
      { label: 'Name', accessor: 'name' },
      { label: 'Status', accessor: 'status' }
    ]

    render(
      <GenericTable
        columns={columns}
        records={[
          {
            id: 'warehouse-1',
            name: 'North Hub',
            status: 'active',
            uom: 'EA',
            createdAt: '2025-03-15T00:00:00Z',
            lastSeenAt: '2025-03-15T09:45:00Z',
            isActive: true,
            currentCapacity: 25,
            maxCapacity: 100
          },
          {
            id: 'warehouse-2',
            name: 'South Hub',
            status: 'inactive',
            uom: 'EA',
            createdAt: '2025-03-16T00:00:00Z',
            lastSeenAt: '2025-03-15T18:05:00Z',
            isActive: false,
            currentCapacity: 80,
            maxCapacity: 100
          }
        ]}
        search={{ enabled: true, placeholder: 'Search warehouses' }}
      />
    )

    fireEvent.change(screen.getByLabelText('Search records'), { target: { value: 'south' } })

    expect(screen.queryByText('North Hub')).toBeNull()
    expect(screen.getByText('South Hub')).toBeTruthy()
  })

  it('applies rowStyleIf classes using first matching rule (whenPositive)', () => {
    type QtyRow = {
      id: string
      name: string
      quantityBlocked: number
      quantityReserved: number
      quantityAvailable: number
    }

    const columns: TableColumnConfig<QtyRow>[] = [{ label: 'Name', accessor: 'name' }]

    render(
      <GenericTable
        columns={columns}
        records={[
          { id: 'a', name: 'Blocked row', quantityBlocked: 1, quantityReserved: 1, quantityAvailable: 0 },
          { id: 'b', name: 'Reserved row', quantityBlocked: 0, quantityReserved: 2, quantityAvailable: 0 },
          { id: 'c', name: 'Available row', quantityBlocked: 0, quantityReserved: 0, quantityAvailable: 3 }
        ]}
        rowStyleIf={{
          rules: [
            {
              colName: 'quantityBlocked',
              whenPositive: true,
              bgClassName: 'bg-red-900',
              textClassName: 'text-red-50'
            },
            {
              colName: 'quantityReserved',
              whenPositive: true,
              bgClassName: 'bg-amber-900',
              textClassName: 'text-amber-50'
            },
            {
              colName: 'quantityAvailable',
              whenPositive: true,
              bgClassName: 'bg-slate-800',
              textClassName: 'text-slate-100'
            }
          ]
        }}
      />
    )

    const rows = screen.getAllByRole('row').filter((row) => row.querySelector('td'))
    expect(rows[0].className).toContain('bg-red-900')
    expect(rows[1].className).toContain('bg-amber-900')
    expect(rows[2].className).toContain('bg-slate-800')
  })

  it('slices rows when pageSize is set without external pagination', () => {
    const columns: TableColumnConfig<TestRow>[] = [{ label: 'Name', accessor: 'name' }]

    const records: TestRow[] = Array.from({ length: 12 }, (_, index) => ({
      id: `r-${index}`,
      name: `Row ${index}`,
      status: 'active',
      uom: 'EA',
      createdAt: '2025-03-15T00:00:00Z',
      lastSeenAt: '2025-03-15T09:45:00Z',
      isActive: true,
      currentCapacity: 1,
      maxCapacity: 10
    }))

    render(<GenericTable columns={columns} records={records} pageSize={10} />)

    expect(screen.getByText('Row 0')).toBeTruthy()
    expect(screen.getByText('Row 9')).toBeTruthy()
    expect(screen.queryByText('Row 10')).toBeNull()

    expect(screen.getByText('1 / 2')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /next page/i }))

    expect(screen.queryByText('Row 0')).toBeNull()
    expect(screen.getByText('Row 10')).toBeTruthy()
    expect(screen.getByText('Row 11')).toBeTruthy()
  })
})
