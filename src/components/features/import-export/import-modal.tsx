'use client'

import { useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ImportEntity } from '@/lib/import-export/types'
import { FileDropZone } from './file-drop-zone'
import { ImportRunner } from './import-runner'

const ENTITIES: { value: ImportEntity; label: string }[] = [
  { value: 'warehouses', label: 'Warehouses' },
  { value: 'zones', label: 'Zones' },
  { value: 'bins', label: 'Bins' },
  { value: 'users', label: 'Users' },
  { value: 'items', label: 'Items' },
  { value: 'devices', label: 'Devices' },
]

type Phase = 'entity-select' | 'file-select' | 'running'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportModal({ open, onOpenChange }: Props) {
  const [phase, setPhase] = useState<Phase>('entity-select')
  const [entity, setEntity] = useState<ImportEntity | null>(null)
  const [file, setFile] = useState<File | null>(null)

  function reset() {
    setPhase('entity-select')
    setEntity(null)
    setFile(null)
  }

  function handleOpenChange(val: boolean) {
    if (!val) reset()
    onOpenChange(val)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto bg-dash-shell text-dash-text">
        <DialogHeader>
          <DialogTitle className="text-dash-text">Import Data</DialogTitle>
        </DialogHeader>

        {phase === 'entity-select' && (
          <div className="space-y-4">
            <p className="text-sm text-dash-muted">Select the type of data you want to import.</p>
            <div className="grid grid-cols-2 gap-2">
              {ENTITIES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setEntity(value); setPhase('file-select') }}
                  className={[
                    'rounded-md border px-4 py-3 text-left text-sm font-medium transition-colors duration-150',
                    entity === value
                      ? 'border-dash-text bg-dash-card2 text-dash-text'
                      : 'border-dash-border text-dash-muted hover:border-dash-muted hover:text-dash-text',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'file-select' && entity && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPhase('entity-select')}
                className="text-xs text-dash-muted hover:text-dash-text"
              >
                ← Back
              </button>
              <span className="text-sm font-medium text-dash-text capitalize">{entity}</span>
            </div>
            <p className="text-sm text-dash-muted">
              Drop a <span className="font-mono text-dash-text">.json</span> or{' '}
              <span className="font-mono text-dash-text">.csv</span> file to import {entity}.
            </p>
            <FileDropZone onFile={setFile} />
            <button
              type="button"
              disabled={!file}
              onClick={() => { if (file) setPhase('running') }}
              className="w-full rounded-md bg-dash-text px-4 py-2.5 text-sm font-medium text-dash-shell transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Start import
            </button>
          </div>
        )}

        {phase === 'running' && entity && file && (
          <ImportRunner
            entity={entity}
            file={file}
            onReset={reset}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
