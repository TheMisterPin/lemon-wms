'use client'

import { useState } from 'react'
import axios from 'axios'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { downloadCsv } from '@/lib/import-export/export-to-csv'
import { downloadJson } from '@/lib/import-export/export-to-json'
import type { ImportEntity } from '@/lib/import-export/types'
import type { ApiResponse } from '@/types/responses/basic-response'

const ENTITIES: { value: ImportEntity; label: string }[] = [
  { value: 'warehouses', label: 'Warehouses' },
  { value: 'zones', label: 'Zones' },
  { value: 'bins', label: 'Bins' },
  { value: 'users', label: 'Users' },
  { value: 'items', label: 'Items' },
  { value: 'devices', label: 'Devices' },
]

type Format = 'json' | 'csv'
type Phase = 'entity-select' | 'format-select' | 'done' | 'error'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportModal({ open, onOpenChange }: Props) {
  const [phase, setPhase] = useState<Phase>('entity-select')
  const [entity, setEntity] = useState<ImportEntity | null>(null)
  const [format, setFormat] = useState<Format>('json')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState<number>(0)

  function reset() {
    setPhase('entity-select')
    setEntity(null)
    setFormat('json')
    setIsLoading(false)
    setError(null)
    setCount(0)
  }

  function handleOpenChange(val: boolean) {
    if (!val) reset()
    onOpenChange(val)
  }

  async function handleExport() {
    if (!entity) return
    setIsLoading(true)
    setError(null)

    try {
      const res = await axios.get<ApiResponse<Record<string, unknown>[]>>(
        `/api/import-export/export/${entity}`
      )
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message ?? 'Export failed')
      }

      const records = res.data.data
      const filename = `${entity}-export-${Date.now()}`
      setCount(records.length)

      if (format === 'json') {
        downloadJson(records, filename)
      } else {
        downloadCsv(records, filename)
      }

      setPhase('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
      setPhase('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md bg-dash-shell text-dash-text">
        <DialogHeader>
          <DialogTitle className="text-dash-text">Export Data</DialogTitle>
        </DialogHeader>

        {phase === 'entity-select' && (
          <div className="space-y-4">
            <p className="text-sm text-dash-muted">Select the type of data you want to export.</p>
            <div className="grid grid-cols-2 gap-2">
              {ENTITIES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setEntity(value); setPhase('format-select') }}
                  className="rounded-md border border-dash-border px-4 py-3 text-left text-sm font-medium text-dash-muted transition-colors duration-150 hover:border-dash-muted hover:text-dash-text"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'format-select' && entity && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPhase('entity-select')}
                className="text-xs text-dash-muted hover:text-dash-text"
              >
                ← Back
              </button>
              <span className="text-sm font-medium capitalize text-dash-text">{entity}</span>
            </div>
            <p className="text-sm text-dash-muted">Choose export format.</p>
            <div className="grid grid-cols-2 gap-2">
              {(['json', 'csv'] as Format[]).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={[
                    'rounded-md border px-4 py-3 text-sm font-medium uppercase transition-colors duration-150',
                    format === fmt
                      ? 'border-dash-text bg-dash-card2 text-dash-text'
                      : 'border-dash-border text-dash-muted hover:border-dash-muted hover:text-dash-text',
                  ].join(' ')}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => void handleExport()}
              className="w-full rounded-md bg-dash-text px-4 py-2.5 text-sm font-medium text-dash-shell transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Exporting…' : `Export as ${format.toUpperCase()}`}
            </button>
          </div>
        )}

        {phase === 'done' && (
          <div className="space-y-3">
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-3 text-center dark:border-green-900/60 dark:bg-green-950/35">
              <p className="font-semibold text-green-800 dark:text-green-200">Export complete</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                {count} {entity} record{count !== 1 ? 's' : ''} exported as {format.toUpperCase()}.
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="w-full rounded-md border border-dash-border px-4 py-2 text-sm text-dash-muted transition-colors hover:bg-dash-card2 hover:text-dash-text"
            >
              Export another
            </button>
          </div>
        )}

        {phase === 'error' && (
          <div className="space-y-3">
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-3 dark:border-red-900/60 dark:bg-red-950/20">
              <p className="font-semibold text-red-800 dark:text-red-200">Export failed</p>
              {error && <p className="text-sm text-red-700 dark:text-red-300">{error}</p>}
            </div>
            <button
              type="button"
              onClick={reset}
              className="w-full rounded-md border border-dash-border px-4 py-2 text-sm text-dash-muted transition-colors hover:bg-dash-card2 hover:text-dash-text"
            >
              Try again
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
