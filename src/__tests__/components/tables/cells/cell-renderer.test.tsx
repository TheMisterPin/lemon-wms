// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CellRenderer } from '@/components/primitives/tables/cells/cell-renderer'
import type { ColumnConfig } from '@/types/components/table/column.types'

type Row = {
  id: string
  name: string
  status: string
  isActive: boolean
  currentCapacity: number
  maxCapacity: number
}

describe('CellRenderer', () => {
  it('renders text column', () => {
    const row: Row = {
      id: '1',
      name: 'Hello',
      status: 'active',
      isActive: true,
      currentCapacity: 3,
      maxCapacity: 10
    }
    const column: ColumnConfig<Row> = { label: 'Name', accessor: 'name' }

    render(<CellRenderer row={row} column={column} />)

    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('renders progress with bar and percentage', () => {
    const row: Row = {
      id: '1',
      name: 'A',
      status: 'x',
      isActive: true,
      currentCapacity: 25,
      maxCapacity: 100
    }
    const column: ColumnConfig<Row> = {
      label: 'Fill',
      accessor: 'currentCapacity',
      type: 'progress',
      typeValues: { current: 'currentCapacity', max: 'maxCapacity' }
    }

    render(<CellRenderer row={row} column={column} />)

    expect(
      screen.getByLabelText('Fill: 25 of 100 (25%)')
    ).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument()
  })

  it('renders boolean as checkbox', () => {
    const row: Row = {
      id: '1',
      name: 'A',
      status: 'x',
      isActive: true,
      currentCapacity: 0,
      maxCapacity: 1
    }
    const column: ColumnConfig<Row> = {
      label: 'On',
      accessor: 'isActive',
      type: 'boolean'
    }

    render(<CellRenderer row={row} column={column} />)

    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('renders indicator dot', () => {
    const row: Row = {
      id: '1',
      name: 'A',
      status: 'active',
      isActive: true,
      currentCapacity: 0,
      maxCapacity: 1
    }
    const column: ColumnConfig<Row> = {
      label: 'Status',
      accessor: 'status',
      type: 'indicator',
      typeValues: {
        conditions: { active: '#4ade80' },
        animation: 'none'
      }
    }

    render(<CellRenderer row={row} column={column} />)

    expect(screen.getByLabelText(/Status:/)).toBeInTheDocument()
  })

  it('renders custom cell', () => {
    const row: Row = {
      id: '1',
      name: 'A',
      status: 'x',
      isActive: false,
      currentCapacity: 0,
      maxCapacity: 1
    }
    const column: ColumnConfig<Row> = {
      label: 'C',
      cell: () => <em>custom</em>
    }

    render(<CellRenderer row={row} column={column} />)

    expect(screen.getByText('custom')).toBeInTheDocument()
  })
})
