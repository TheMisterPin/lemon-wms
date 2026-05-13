'use client'

import { useState } from 'react'
import { CheckCircle, Package, PauseCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { ActivitiesSheet } from './sheets/activities-sheet'
import { BinOpsSheet } from './sheets/bin-ops-sheet'
import { BinStockSheet } from './sheets/bin-stock-sheet'
import { LedgerSheet } from './sheets/ledger-sheet'
import { PoReceiptLinesSheet } from './sheets/po-receipt-lines-sheet'
import type { SimulationResult } from './simulation-modal'

type Sheet = 'activities' | 'bin-ops' | 'ledger' | 'bin-stock' | 'po-receipt-lines' | null

type Props = {
  result: SimulationResult
  onReset: () => void
}

export function SimulationResults({ result, onReset }: Props) {
  const [openSheet, setOpenSheet] = useState<Sheet>(null)

  const isPartialPause = typeof result.partialStoppedAfterLines === 'number'
  const isExecuted =
    result.orderStatus === 'EXECUTED' || result.orderStatus === 'EXECUTED_WITH_PROBLEMS'

  let bannerClass =
    'flex items-center gap-2 rounded-md border px-4 py-3 '
  let Icon = Package
  let iconClass = 'shrink-0 text-dash-muted'
  let subtitle = result.orderStatus.replace(/_/g, ' ')

  if (isPartialPause) {
    bannerClass +=
      'border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/35'
    Icon = PauseCircle
    iconClass = 'shrink-0 text-amber-600 dark:text-amber-400'
    subtitle = `Paused · completed ${result.partialStoppedAfterLines} receipt line(s) before stopping`
  } else if (isExecuted) {
    bannerClass +=
      'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/30'
    Icon = CheckCircle
    iconClass = 'shrink-0 text-green-600 dark:text-green-400'
    subtitle = result.orderStatus.replace(/_/g, ' ')
  } else {
    bannerClass +=
      'border-dash-border bg-dash-card2'
  }

  return (
    <div className="space-y-4">
      <div className={bannerClass}>
        <Icon size={18} className={iconClass} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-dash-text">{result.orderReference}</p>
          <p className="text-xs text-dash-muted">{subtitle}</p>
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
        <Button
          variant="outline"
          size="sm"
          className="col-span-2"
          onClick={() => setOpenSheet('po-receipt-lines')}
        >
          PO vs receipt lines
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
      <PoReceiptLinesSheet
        open={openSheet === 'po-receipt-lines'}
        onOpenChange={(v) => setOpenSheet(v ? 'po-receipt-lines' : null)}
        orderId={result.orderId}
      />
    </div>
  )
}
