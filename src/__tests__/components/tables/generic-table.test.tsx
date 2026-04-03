// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { GenericTable } from '@/components/tables/generic-table'
import type { TableColumnConfig } from '@/types/components/table/generic-table.types'

type TestRow = {
  id: string
  name: string
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
      }
    ]

    render(
      <GenericTable
        columns={columns}
        records={[
          {
            id: 'warehouse-1',
            name: 'North Hub',
            createdAt: '2025-03-15T00:00:00Z',
            lastSeenAt: '2025-03-15T09:45:00Z',
            isActive: true,
            currentCapacity: 25,
            maxCapacity: 100
          },
          {
            id: 'warehouse-2',
            name: 'South Hub',
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
})
