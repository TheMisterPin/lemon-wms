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
})
