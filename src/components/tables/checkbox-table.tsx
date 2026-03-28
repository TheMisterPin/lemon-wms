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
}
export function CheckBoxTable<T extends { id: string }>(props: CheckBoxTableProps<T>) {
  const { columns, records } = props
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(
    new Set()
  )
  const selectAll = selectedRows.size === records.length
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(records.map((row) => row.id)))
    } else {
      setSelectedRows(new Set())
    }
  }
  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedRows(newSelected)
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
              <TableCell key={column.key as string} className={column.key === 'name' ? 'font-medium' : ''}>
                {String(row[column.key])}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
