'use client'

import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { ChevronDown, ChevronUp } from 'lucide-react'

import { Progress } from '@/components/ui/progress'
import { importFromCsv } from '@/lib/import-export/import-from-csv'
import { importFromJson } from '@/lib/import-export/import-from-json'
import type { ImportEntity, InvalidRecord, RelationCheckResult, ShapeValidationResult } from '@/lib/import-export/types'
import { verifyImportDataContent } from '@/lib/import-export/verify-import-data-content'
import { verifyImportDataShape } from '@/lib/import-export/verify-import-data-shape'
import type { ApiResponse } from '@/types/responses/basic-response'

type ImportStep = {
  id: string
  label: string
  status: 'pending' | 'running' | 'done' | 'error'
  detail?: string
  durationMs?: number
}

type Props = {
  entity: ImportEntity
  file: File
  onReset: () => void
}

const BATCH_SIZE = 50

function buildInitialSteps(): ImportStep[] {
  return [
    { id: 'parse', label: 'Parsing file', status: 'pending' },
    { id: 'shape', label: 'Checking data shape', status: 'pending' },
    { id: 'content', label: 'Checking data content', status: 'pending' },
    { id: 'relations', label: 'Checking relations & duplicates', status: 'pending' },
  ]
}

function StepRow({ step }: { step: ImportStep }) {
  const icon =
    step.status === 'done' ? '✓' :
      step.status === 'error' ? '✗' :
        step.status === 'running' ? '…' : '○'

  const iconColor =
    step.status === 'done' ? 'text-green-600 dark:text-green-400' :
      step.status === 'error' ? 'text-red-500' :
        step.status === 'running' ? 'text-blue-500' :
          'text-dash-muted'

  const rowTint =
    step.status === 'done'
      ? 'rounded-md border border-green-200 bg-green-50 dark:border-green-900/60 dark:bg-green-950/35'
      : step.status === 'error'
        ? 'rounded-md border border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/35'
        : step.status === 'running'
          ? 'rounded-md border border-blue-200 bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/35'
          : ''

  return (
    <div className={`flex items-center gap-2 px-2 py-1.5 text-sm ${rowTint}`}>
      <span className={`w-4 shrink-0 text-center font-mono ${iconColor}`}>{icon}</span>
      <span className={`flex-1 ${step.status === 'pending' ? 'text-dash-muted' : step.status === 'done' ? 'font-medium text-green-900 dark:text-green-100' : 'text-dash-text'}`}>
        {step.label}
      </span>
      {step.detail && <span className="text-xs text-dash-muted">{step.detail}</span>}
      {step.durationMs !== undefined && (
        <span className="text-xs tabular-nums text-dash-muted">{step.durationMs}ms</span>
      )}
    </div>
  )
}

function InvalidRecordList({ records }: { records: InvalidRecord[] }) {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? records : records.slice(0, 5)

  return (
    <div className="space-y-1.5">
      {shown.map((inv, i) => (
        <div key={i} className="rounded border border-red-100 bg-red-50/60 px-2 py-1.5 text-xs dark:border-red-900/40 dark:bg-red-950/20">
          <p className="font-medium text-red-800 dark:text-red-300">Row {inv.index + 1}</p>
          {inv.errors.map((e, j) => (
            <p key={j} className="text-red-700 dark:text-red-400">
              <span className="font-mono font-semibold">{e.field}:</span> {e.issue}
              {e.enumOptions && (
                <span className="ml-1 text-red-500 dark:text-red-500"> Options: {e.enumOptions.join(', ')}</span>
              )}
            </p>
          ))}
        </div>
      ))}
      {records.length > 5 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs text-dash-muted hover:text-dash-text"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Show fewer' : `Show ${records.length - 5} more`}
        </button>
      )}
    </div>
  )
}

export function ImportRunner({ entity, file, onReset }: Props) {
  const [steps, setSteps] = useState<ImportStep[]>(buildInitialSteps)
  const [phase, setPhase] = useState<'running' | 'awaiting-confirm' | 'inserting' | 'done' | 'error'>('running')
  const [shapeResult, setShapeResult] = useState<ShapeValidationResult<Record<string, unknown>> | null>(null)
  const [allInvalid, setAllInvalid] = useState<InvalidRecord[]>([])
  const [relationsResult, setRelationsResult] = useState<RelationCheckResult<Record<string, unknown>> | null>(null)
  const [insertProgress, setInsertProgress] = useState<{ completed: number; total: number } | null>(null)
  const [insertStep, setInsertStep] = useState<ImportStep | null>(null)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    let current: ImportStep[] = buildInitialSteps()

    function patch(id: string, updates: Partial<ImportStep>) {
      current = current.map((s) => (s.id === id ? { ...s, ...updates } : s))
      setSteps([...current])
    }

    async function timed<T>(id: string, fn: () => Promise<T>, detail?: (r: T) => string): Promise<T> {
      patch(id, { status: 'running' })
      const t0 = Date.now()
      const result = await fn()
      patch(id, { status: 'done', durationMs: Date.now() - t0, detail: detail?.(result) })
      return result
    }

    async function run() {
      try {
        // Step 1: Parse file
        const rawRecords = await timed('parse', async () => {
          const ext = file.name.split('.').pop()?.toLowerCase()
          if (ext === 'json') return importFromJson(file)
          if (ext === 'csv') return importFromCsv(file) as Promise<unknown[]>
          throw new Error(`Unsupported file type: .${ext}`)
        }, (r) => `${r.length} rows`)

        // Step 2: Shape validation (client-side)
        const shapeRes = await timed('shape', async () => {
          return verifyImportDataShape<Record<string, unknown>>(entity, rawRecords)
        }, (r) => `${r.valid.length} valid, ${r.invalid.length} invalid`)
        setShapeResult(shapeRes)

        const shapeInvalid = shapeRes.invalid

        if (shapeRes.valid.length === 0) {
          patch('shape', { status: 'error', detail: 'No valid records found' })
          setAllInvalid(shapeInvalid)
          setPhase('error')
          return
        }

        // Step 3: Content validation (client-side)
        const contentRes = await timed('content', async () => {
          return verifyImportDataContent(entity, shapeRes.valid)
        }, (r) => `${r.valid.length} valid, ${r.invalid.length} invalid`)

        const combinedInvalid = [...shapeInvalid, ...contentRes.invalid as InvalidRecord[]]
        setAllInvalid(combinedInvalid)

        // Step 4: Relation check (server-side)
        const relRes = await timed('relations', async () => {
          const res = await axios.post<ApiResponse<RelationCheckResult<Record<string, unknown>>>>(
            '/api/import-export/check-relations',
            { entity, records: contentRes.valid }
          )
          if (!res.data.success || !res.data.data) {
            throw new Error(res.data.message ?? 'Relation check failed')
          }
          return res.data.data
        }, (r) => `${r.toInsert.length} new, ${r.duplicates.length} duplicates, ${r.invalid.length} invalid`)

        const finalInvalid = [...combinedInvalid, ...relRes.invalid as InvalidRecord[]]
        setAllInvalid(finalInvalid)
        setRelationsResult(relRes)
        setPhase('awaiting-confirm')
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Import failed'
        current = current.map((s) =>
          s.status === 'running' ? { ...s, status: 'error', detail: msg } : s
        )
        setSteps([...current])
        setPhase('error')
      }
    }

    void run()
  }, [entity, file])

  async function handleInsert() {
    if (!relationsResult || relationsResult.toInsert.length === 0) return
    setPhase('inserting')
    const total = relationsResult.toInsert.length
    const initialStep: ImportStep = { id: 'insert', label: 'Inserting records', status: 'running' }
    setInsertStep(initialStep)
    setInsertProgress({ completed: 0, total })

    let completed = 0
    let hasError = false

    try {
      for (let i = 0; i < total; i += BATCH_SIZE) {
        const batch = relationsResult.toInsert.slice(i, i + BATCH_SIZE)
        const res = await axios.post<ApiResponse<{ inserted: number }>>(
          '/api/import-export/insert',
          { entity, records: batch }
        )
        if (!res.data.success) throw new Error(res.data.message ?? 'Insert failed')
        completed += res.data.data?.inserted ?? batch.length
        setInsertProgress({ completed, total })
      }
    } catch (err) {
      hasError = true
      const msg = err instanceof Error ? err.message : 'Insert failed'
      setInsertStep({ id: 'insert', label: 'Inserting records', status: 'error', detail: msg })
      setPhase('error')
      return
    }

    if (!hasError) {
      setInsertStep({ id: 'insert', label: 'Inserting records', status: 'done', detail: `${completed} inserted` })
      setPhase('done')
    }
  }

  const insertPercent = insertProgress
    ? Math.round((insertProgress.completed / insertProgress.total) * 100)
    : 0

  return (
    <div className="space-y-3 py-2">
      {steps.map((step) => (
        <StepRow key={step.id} step={step} />
      ))}

      {insertStep && (
        <StepRow step={insertStep} />
      )}

      {(phase === 'inserting') && insertProgress && (
        <div className="space-y-2 rounded-md border border-dash-border bg-dash-card2 px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-dash-text">Inserting records</span>
            <span className="text-xs tabular-nums text-dash-muted">
              {insertProgress.completed}/{insertProgress.total}
            </span>
          </div>
          <Progress
            value={insertPercent}
            className="h-2 bg-dash-border/60 [&>[data-slot=progress-indicator]]:bg-green-600 dark:[&>[data-slot=progress-indicator]]:bg-green-500"
          />
        </div>
      )}

      {phase === 'awaiting-confirm' && relationsResult && (
        <div className="space-y-3 pt-2">
          <div className="rounded-md border border-dash-border px-3 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dash-muted">Results</p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded border border-green-200 bg-green-50 py-2 dark:border-green-900/60 dark:bg-green-950/35">
                <p className="text-lg font-bold tabular-nums text-green-700 dark:text-green-300">{relationsResult.toInsert.length}</p>
                <p className="text-green-600 dark:text-green-400">To insert</p>
              </div>
              <div className="rounded border border-amber-200 bg-amber-50 py-2 dark:border-amber-900/60 dark:bg-amber-950/20">
                <p className="text-lg font-bold tabular-nums text-amber-700 dark:text-amber-300">{relationsResult.duplicates.length}</p>
                <p className="text-amber-600 dark:text-amber-400">Duplicates</p>
              </div>
              <div className="rounded border border-red-200 bg-red-50 py-2 dark:border-red-900/60 dark:bg-red-950/20">
                <p className="text-lg font-bold tabular-nums text-red-700 dark:text-red-300">{allInvalid.length}</p>
                <p className="text-red-600 dark:text-red-400">Invalid</p>
              </div>
            </div>
          </div>

          {allInvalid.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-red-700 dark:text-red-400">Invalid records (will not be inserted)</p>
              <InvalidRecordList records={allInvalid} />
            </div>
          )}

          {relationsResult.duplicates.length > 0 && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              {relationsResult.duplicates.length} record(s) already exist and will be skipped.
            </p>
          )}

          {relationsResult.toInsert.length === 0 ? (
            <p className="rounded-md border border-dash-border px-3 py-2 text-sm text-dash-muted">
              No new records to insert.
            </p>
          ) : (
            <button
              type="button"
              onClick={() => void handleInsert()}
              className="w-full rounded-md bg-dash-text px-4 py-2.5 text-sm font-medium text-dash-shell transition-colors hover:opacity-90"
            >
              Insert {relationsResult.toInsert.length} valid record{relationsResult.toInsert.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {phase === 'done' && (
        <div className="space-y-3 pt-2">
          <div className="rounded-md border border-green-200 bg-green-50 px-3 py-3 text-center dark:border-green-900/60 dark:bg-green-950/35">
            <p className="font-semibold text-green-800 dark:text-green-200">Import complete</p>
            <p className="text-sm text-green-700 dark:text-green-300">
              {insertProgress?.completed ?? 0} record{(insertProgress?.completed ?? 0) !== 1 ? 's' : ''} inserted successfully.
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="w-full rounded-md border border-dash-border px-4 py-2 text-sm text-dash-muted transition-colors hover:bg-dash-card2 hover:text-dash-text"
          >
            Import another file
          </button>
        </div>
      )}

      {phase === 'error' && (
        <div className="space-y-3 pt-2">
          {allInvalid.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-red-700 dark:text-red-400">Invalid records</p>
              <InvalidRecordList records={allInvalid} />
            </div>
          )}
          <button
            type="button"
            onClick={onReset}
            className="w-full rounded-md border border-dash-border px-4 py-2 text-sm text-dash-muted transition-colors hover:bg-dash-card2 hover:text-dash-text"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
