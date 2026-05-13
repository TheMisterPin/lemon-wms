'use client'

import { useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

import { SimulationSetupForm } from './simulation-setup-form'
import { SimulationRunner } from './simulation-runner'
import { SimulationResults } from './simulation-results'

export type SimulationPhase = 'setup' | 'running' | 'complete' | 'error'

export type SimulationStep = {
  id: string
  label: string
  status: 'pending' | 'running' | 'done' | 'error'
  detail?: string
  durationMs?: number
}

export type SimulationConfig = {
  userId: string
  orderId: string
  toBinId: string
  orderReference: string
}

export type SimulationResult = {
  orderId: string
  orderReference: string
  binId: string
  orderStatus: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SimulationModal({ open, onOpenChange }: Props) {
  const [phase, setPhase] = useState<SimulationPhase>('setup')
  const [config, setConfig] = useState<SimulationConfig | null>(null)
  const [steps, setSteps] = useState<SimulationStep[]>([])
  const [result, setResult] = useState<SimulationResult | null>(null)

  function handleReset() {
    setPhase('setup')
    setConfig(null)
    setSteps([])
    setResult(null)
  }

  function handleOpenChange(val: boolean) {
    if (!val) handleReset()
    onOpenChange(val)
  }

  function handleRun(cfg: SimulationConfig) {
    setConfig(cfg)
    setPhase('running')
  }

  function handleComplete(res: SimulationResult, finalSteps: SimulationStep[]) {
    setResult(res)
    setSteps(finalSteps)
    setPhase('complete')
  }

  function handleError(finalSteps: SimulationStep[]) {
    setSteps(finalSteps)
    setPhase('error')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Purchase Order Simulation</DialogTitle>
        </DialogHeader>

        {phase === 'setup' && (
          <SimulationSetupForm onRun={handleRun} />
        )}

        {phase === 'running' && config && (
          <SimulationRunner
            config={config}
            onComplete={handleComplete}
            onError={handleError}
          />
        )}

        {(phase === 'complete' || phase === 'error') && result && (
          <SimulationResults
            result={result}
            steps={steps}
            onReset={handleReset}
          />
        )}

        {phase === 'error' && !result && (
          <div className="space-y-4">
            <div className="space-y-2">
              {steps.map((step) => (
                <StepRow key={step.id} step={step} />
              ))}
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="w-full rounded-md border border-dash-border px-4 py-2 text-sm text-dash-muted hover:bg-dash-card2"
            >
              Try Again
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function StepRow({ step }: { step: SimulationStep }) {
  const icon =
    step.status === 'done' ? '✓' :
    step.status === 'error' ? '✗' :
    step.status === 'running' ? '…' : '○'

  const color =
    step.status === 'done' ? 'text-green-600' :
    step.status === 'error' ? 'text-red-500' :
    step.status === 'running' ? 'text-blue-500' : 'text-dash-muted'

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`w-4 shrink-0 text-center ${color}`}>{icon}</span>
      <span className={step.status === 'pending' ? 'text-dash-muted' : 'text-dash-text'}>{step.label}</span>
      {step.detail && <span className="ml-auto text-xs text-dash-muted">{step.detail}</span>}
      {step.durationMs !== undefined && (
        <span className="ml-auto text-xs text-dash-muted">{step.durationMs}ms</span>
      )}
    </div>
  )
}
