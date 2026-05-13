'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { SimulationResult, SimulationStep } from './simulation-modal'
import { ActivitiesSheet } from './sheets/activities-sheet'
import { BinOpsSheet } from './sheets/bin-ops-sheet'
import { LedgerSheet } from './sheets/ledger-sheet'
import { BinStockSheet } from './sheets/bin-stock-sheet'

type Sheet = 'activities' | 'bin-ops' | 'ledger' | 'bin-stock' | null

type Props = {
  result: SimulationResult
  steps: SimulationStep[]
  onReset: () => void
}

export function SimulationResults({ result, onReset }: Props) {
  const [openSheet, setOpenSheet] = useState<Sheet>(null)

  const isExecuted =
    result.orderStatus === 'EXECUTED' || result.orderStatus === 'EXECUTED_WITH_PROBLEMS'

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-md bg-green-50 px-4 py-3 dark:bg-green-950/30">
        <CheckCircle size={18} className="shrink-0 text-green-600 dark:text-green-400" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-dash-text">{result.orderReference}</p>
          <p className="text-xs text-dash-muted">
            {isExecuted ? result.orderStatus.replace('_', ' ') : result.orderStatus}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpenSheet('activities')}>
          View Activities
        </Button>
        <Button variant="outline" size="sm" onClick={() => setOpenSheet('bin-ops')}>
          Bin Operations
        </Button>
        <Button variant="outline" size="sm" onClick={() => setOpenSheet('ledger')}>
          Item Ledger
        </Button>
        <Button variant="outline" size="sm" onClick={() => setOpenSheet('bin-stock')}>
          Bin Contents
        </Button>
      </div>

      <Button variant="ghost" size="sm" className="w-full" onClick={onReset}>
        Run Another Simulation
      </Button>

      <ActivitiesSheet
        open={openSheet === 'activities'}
        onOpenChange={(v) => setOpenSheet(v ? 'activities' : null)}
        orderId={result.orderId}
      />
      <BinOpsSheet
        open={openSheet === 'bin-ops'}
        onOpenChange={(v) => setOpenSheet(v ? 'bin-ops' : null)}
        orderId={result.orderId}
      />
      <LedgerSheet
        open={openSheet === 'ledger'}
        onOpenChange={(v) => setOpenSheet(v ? 'ledger' : null)}
        orderId={result.orderId}
      />
      <BinStockSheet
        open={openSheet === 'bin-stock'}
        onOpenChange={(v) => setOpenSheet(v ? 'bin-stock' : null)}
        binId={result.binId}
      />
    </div>
  )
}
