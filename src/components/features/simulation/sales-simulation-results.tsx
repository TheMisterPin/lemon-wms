'use client'

import { useState } from 'react'
import { CheckCircle, Package } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { SalesSimulationResult } from './sales-simulation-modal'
import { SalesActivitiesSheet } from './sheets/sales-activities-sheet'
import { SalesBinOpsSheet } from './sheets/sales-bin-ops-sheet'
import { SoPickLinesSheet } from './sheets/so-pick-lines-sheet'

type Sheet = 'activities' | 'bin-ops' | 'so-pick-lines' | null

type Props = {
  result: SalesSimulationResult
  onReset: () => void
}

export function SalesSimulationResults({ result, onReset }: Props) {
  const [openSheet, setOpenSheet] = useState<Sheet>(null)

  const isCompleted = result.pickStatus === 'COMPLETED'

  const bannerClass = [
    'flex items-center gap-2 rounded-md border px-4 py-3',
    isCompleted
      ? 'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/30'
      : 'border-dash-border bg-dash-card2'
  ].join(' ')

  const Icon = isCompleted ? CheckCircle : Package
  const iconClass = isCompleted
    ? 'shrink-0 text-green-600 dark:text-green-400'
    : 'shrink-0 text-dash-muted'

  return (
    <div className="space-y-4">
      <div className={bannerClass}>
        <Icon size={18} className={iconClass} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-dash-text">{result.orderReference}</p>
          <p className="text-xs text-dash-muted">{result.pickStatus.replace(/_/g, ' ')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpenSheet('activities')}>
          View Activities
        </Button>
        <Button variant="outline" size="sm" onClick={() => setOpenSheet('bin-ops')}>
          Bin Operations
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="col-span-2"
          onClick={() => setOpenSheet('so-pick-lines')}
        >
          SO vs pick lines
        </Button>
      </div>

      <Button variant="ghost" size="sm" className="w-full" onClick={onReset}>
        Run Another Simulation
      </Button>

      <SalesActivitiesSheet
        open={openSheet === 'activities'}
        onOpenChange={(v) => setOpenSheet(v ? 'activities' : null)}
        orderId={result.orderId}
      />
      <SalesBinOpsSheet
        open={openSheet === 'bin-ops'}
        onOpenChange={(v) => setOpenSheet(v ? 'bin-ops' : null)}
        orderId={result.orderId}
      />
      <SoPickLinesSheet
        open={openSheet === 'so-pick-lines'}
        onOpenChange={(v) => setOpenSheet(v ? 'so-pick-lines' : null)}
        orderId={result.orderId}
      />
    </div>
  )
}
