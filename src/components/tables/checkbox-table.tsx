'use client'

import * as React from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

interface Column<T> {
  key: keyof T
  label: string
}

interface CheckBoxTableProps<T extends { id: string }> {
  columns: Column<T>[]
  records: T[]
  /** Controlled selection. When set, `onSelectionChange` is called on toggle. */
  selectedIds?: Set<string>
  /** Used when uncontrolled and `selectedIds` is omitted. */
  defaultSelectedIds?: Set<string>
  onSelectionChange?: (ids: Set<string>) => void
}

export function CheckBoxTable<T extends { id: string }>(props: CheckBoxTableProps<T>) {
  const { columns, records, selectedIds: selectedIdsProp, defaultSelectedIds, onSelectionChange } = props
  const isControlled = selectedIdsProp !== undefined
  const [internalSelected, setInternalSelected] = React.useState<Set<string>>(
    () => new Set(defaultSelectedIds ?? [])
  )

  const selectedRows = isControlled ? selectedIdsProp! : internalSelected

  const setSelected = React.useCallback(
    (next: Set<string>) => {
      if (!isControlled) {
        setInternalSelected(next)
      }

      onSelectionChange?.(next)
    },
    [isControlled, onSelectionChange]
  )

  const selectAll = records.length > 0 && selectedRows.size === records.length
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(records.map((row) => row.id)))
    } else {
      setSelected(new Set())
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    const next = new Set(selectedRows)

    if (checked) {
      next.add(id)
    } else {
      next.delete(id)
    }

    setSelected(next)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8">
            <Checkbox
              id="select-all-checkbox"
              name="select-all-checkbox"
              checked={selectAll}
              onCheckedChange={handleSelectAll}
            />
          </TableHead>
          {columns.map((column) => (
            <TableHead key={column.key as string}>
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((row) => (
          <TableRow
            key={row.id}
            data-state={selectedRows.has(row.id) ? 'selected' : undefined}
          >
            <TableCell>
              <Checkbox
                id={`row-${row.id}-checkbox`}
                name={`row-${row.id}-checkbox`}
                checked={selectedRows.has(row.id)}
                onCheckedChange={(checked) =>
                  handleSelectRow(row.id, checked === true)
                }
              />
            </TableCell>
            {columns.map((column) => (
              <TableCell
                key={column.key as string}
                className={column.key === 'name' ? 'font-medium' : ''}
              >
                {String(row[column.key])}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
