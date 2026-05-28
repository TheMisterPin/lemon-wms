import { useMemo, useState } from 'react'
import { Play, Pause, CheckCircle2, AlertTriangle, PackageCheck, Undo2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type ReceiptOutcome =
  | 'ACCEPTED'
  | 'DAMAGED'
  | 'EXPIRED'
  | 'REJECTED'
  | 'QUARANTINED'
  | 'QUALITY_ISSUE'
  | 'CORRECTION'
  | 'OTHER'

type ExpectedLine = {
  id: string
  sku: string
  itemName: string
  orderedQty: number
}

type DeclaredOutcome = {
  id: string
  time: string
  lineId: string
  sku: string
  itemName: string
  quantity: number
  outcome: ReceiptOutcome
  effective: boolean
  notes: string
  supersedesOutcomeId?: string
}

const initialOrder = {
  reference: 'PO-SEED-0001',
  supplier: 'Supplier Snapshot Inc.',
  status: 'EXECUTING',
  warehouse: 'WH-0001'
}

const initialExpectedLines: ExpectedLine[] = [
  {
    id: '1',
    sku: 'SKU-0001',
    itemName: 'Bob\'s Red Mill Organic Rolled Oats 907g',
    orderedQty: 16
  },
  {
    id: '2',
    sku: 'SKU-0002',
    itemName: 'RXBAR Chocolate Sea Salt Protein Bar 52g',
    orderedQty: 18
  },
  {
    id: '3',
    sku: 'SKU-0003',
    itemName: 'Nike Air Max 270 Sneakers',
    orderedQty: 20
  },
  {
    id: '4',
    sku: 'SKU-0004',
    itemName: 'Amoxicillin 500mg Capsules (21-Pack)',
    orderedQty: 12
  }
]

const initialDeclaredOutcomes: DeclaredOutcome[] = [
  {
    id: 'o1',
    time: '09:14',
    lineId: '1',
    sku: 'SKU-0001',
    itemName: 'Bob\'s Red Mill Organic Rolled Oats 907g',
    quantity: 4,
    outcome: 'ACCEPTED',
    effective: true,
    notes: ''
  },
  {
    id: 'o2',
    time: '09:18',
    lineId: '1',
    sku: 'SKU-0001',
    itemName: 'Bob\'s Red Mill Organic Rolled Oats 907g',
    quantity: 2,
    outcome: 'DAMAGED',
    effective: true,
    notes: 'Outer packaging torn'
  },
  {
    id: 'o3',
    time: '09:22',
    lineId: '4',
    sku: 'SKU-0004',
    itemName: 'Amoxicillin 500mg Capsules (21-Pack)',
    quantity: 2,
    outcome: 'QUARANTINED',
    effective: true,
    notes: 'Awaiting QA review'
  },
  {
    id: 'o4',
    time: '09:25',
    lineId: '2',
    sku: 'SKU-0002',
    itemName: 'RXBAR Chocolate Sea Salt Protein Bar 52g',
    quantity: 1,
    outcome: 'ACCEPTED',
    effective: false,
    notes: 'Superseded by corrected entry'
  },
  {
    id: 'o5',
    time: '09:27',
    lineId: '2',
    sku: 'SKU-0002',
    itemName: 'RXBAR Chocolate Sea Salt Protein Bar 52g',
    quantity: 3,
    outcome: 'ACCEPTED',
    effective: true,
    notes: 'Corrected entry',
    supersedesOutcomeId: 'o4'
  }
]

const outcomeOptions: ReceiptOutcome[] = [
  'ACCEPTED',
  'QUARANTINED',
  'DAMAGED',
  'EXPIRED',
  'REJECTED',
  'QUALITY_ISSUE',
  'CORRECTION',
  'OTHER'
]

function getNowLabel() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function countsAsReceived(outcome: ReceiptOutcome) {
  return outcome === 'ACCEPTED' || outcome === 'QUARANTINED'
}

function countsAsIssue(outcome: ReceiptOutcome) {
  return !countsAsReceived(outcome) && outcome !== 'CORRECTION'
}

function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    OPEN: 'bg-slate-100 text-slate-700',
    PARTIAL: 'bg-amber-100 text-amber-700',
    RECEIVED: 'bg-emerald-100 text-emerald-700',
    EXCEPTION: 'bg-rose-100 text-rose-700',
    EXECUTING: 'bg-blue-100 text-blue-700'
  }

  return <Badge className={map[value] ?? 'bg-slate-100 text-slate-700 hover:bg-slate-100'}>{value}</Badge>
}

function OutcomeBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    ACCEPTED: 'bg-emerald-100 text-emerald-700',
    QUARANTINED: 'bg-violet-100 text-violet-700',
    DAMAGED: 'bg-rose-100 text-rose-700',
    EXPIRED: 'bg-orange-100 text-orange-700',
    REJECTED: 'bg-slate-200 text-slate-700',
    QUALITY_ISSUE: 'bg-yellow-100 text-yellow-700',
    CORRECTION: 'bg-sky-100 text-sky-700',
    OTHER: 'bg-slate-100 text-slate-700'
  }

  return <Badge className={map[value] ?? 'bg-slate-100 text-slate-700 hover:bg-slate-100'}>{value}</Badge>
}

export  function WarehousePurchaseOrderDetailsPageView() {
  const [declaredOutcomes, setDeclaredOutcomes] = useState<DeclaredOutcome[]>(initialDeclaredOutcomes)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState('1')
  const [selectedOutcome, setSelectedOutcome] = useState<ReceiptOutcome>('ACCEPTED')
  const [notes, setNotes] = useState('')
  const [correctionTargetId, setCorrectionTargetId] = useState<string | null>(null)

  const selectedLine = useMemo(
    () => initialExpectedLines.find((line) => line.id === selectedLineId) ?? null,
    [selectedLineId]
  )

  const effectiveOutcomes = useMemo(
    () => declaredOutcomes.filter((row) => row.effective),
    [declaredOutcomes]
  )

  const lineMetrics = useMemo(() => {
    return initialExpectedLines.map((line) => {
      const outcomes = effectiveOutcomes.filter((row) => row.lineId === line.id)
      const acceptedQty = outcomes
        .filter((row) => row.outcome === 'ACCEPTED')
        .reduce((sum, row) => sum + row.quantity, 0)
      const quarantinedQty = outcomes
        .filter((row) => row.outcome === 'QUARANTINED')
        .reduce((sum, row) => sum + row.quantity, 0)
      const issueQty = outcomes
        .filter((row) => countsAsIssue(row.outcome))
        .reduce((sum, row) => sum + row.quantity, 0)
      const receivedQty = acceptedQty + quarantinedQty
      const pendingQty = Math.max(line.orderedQty - receivedQty, 0)

      let status = 'OPEN'
      if (receivedQty >= line.orderedQty) {
        status = issueQty > 0 ? 'EXCEPTION' : 'RECEIVED'
      } else if (receivedQty > 0 || issueQty > 0) {
        status = issueQty > 0 ? 'EXCEPTION' : 'PARTIAL'
      }

      return {
        ...line,
        acceptedQty,
        quarantinedQty,
        issueQty,
        pendingQty,
        status
      }
    })
  }, [effectiveOutcomes])

  const orderSummary = useMemo(() => {
    const acceptedQty = lineMetrics.reduce((sum, line) => sum + line.acceptedQty, 0)
    const quarantinedQty = lineMetrics.reduce((sum, line) => sum + line.quarantinedQty, 0)
    const issueQty = lineMetrics.reduce((sum, line) => sum + line.issueQty, 0)
    const pendingQty = lineMetrics.reduce((sum, line) => sum + line.pendingQty, 0)

    return {
      ...initialOrder,
      totalLines: lineMetrics.length,
      acceptedQty,
      quarantinedQty,
      issueQty,
      pendingQty
    }
  }, [lineMetrics])

  function resetForm() {
    setQuantity('1')
    setSelectedOutcome('ACCEPTED')
    setNotes('')
    setCorrectionTargetId(null)
  }

  function openDeclareSheet(lineId: string) {
    setSelectedLineId(lineId)
    setQuantity('1')
    setSelectedOutcome('ACCEPTED')
    setNotes('')
    setCorrectionTargetId(null)
    setIsSheetOpen(true)
  }

  function openCorrectionSheet(row: DeclaredOutcome) {
    setSelectedLineId(row.lineId)
    setQuantity(String(row.quantity))
    setSelectedOutcome(row.outcome)
    setNotes(row.notes)
    setCorrectionTargetId(row.id)
    setIsSheetOpen(true)
  }

  function closeSheet() {
    setIsSheetOpen(false)
    resetForm()
  }

  function saveDeclaration() {
    if (!selectedLine) {
      return
    }

    const parsedQuantity = Number(quantity)
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return
    }

    const newOutcomeId = crypto.randomUUID()

    setDeclaredOutcomes((current: any) => {
      if (!correctionTargetId) {
        return [
          {
            id: newOutcomeId,
            time: getNowLabel(),
            lineId: selectedLine.id,
            sku: selectedLine.sku,
            itemName: selectedLine.itemName,
            quantity: parsedQuantity,
            outcome: selectedOutcome,
            effective: true,
            notes: notes.trim()
          },
          ...current
        ]
      }

      return [
        {
          id: newOutcomeId,
          time: getNowLabel(),
          lineId: selectedLine.id,
          sku: selectedLine.sku,
          itemName: selectedLine.itemName,
          quantity: parsedQuantity,
          outcome: selectedOutcome,
          effective: true,
          notes: notes.trim(),
          supersedesOutcomeId: correctionTargetId
        },
        ...current.map((row: any) =>
          row.id === correctionTargetId
            ? {
              ...row,
              effective: false,
              outcome: 'CORRECTION',
              notes: row.notes || 'Superseded by correction'
            }
            : row
        )
      ]
    })

    closeSheet()
  }

  const selectedLineMetrics = lineMetrics.find((line) => line.id === selectedLineId) ?? null
  const canFinalize = orderSummary.pendingQty === 0

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">Purchase Order Execution</h1>
              <StatusBadge value={orderSummary.status} />
            </div>
            <p className="text-sm text-slate-600">
              {orderSummary.reference} · {orderSummary.supplier} · {orderSummary.warehouse}
            </p>
            <p className="max-w-2xl text-sm text-slate-500">
              Operators declare receipt outcomes against expected lines, then finalize the declaration phase before bin assignment and stock posting.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-2xl">
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
            <Button variant="outline" className="rounded-2xl" disabled={!canFinalize}>
              <PackageCheck className="mr-2 h-4 w-4" />
              Bin Assignment
            </Button>
            <Button className="rounded-2xl" disabled={!canFinalize}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Finalize Receipt
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card className="rounded-3xl shadow-sm xl:col-span-1">
            <CardHeader className="pb-2">
              <CardDescription>Total Lines</CardDescription>
              <CardTitle className="text-3xl">{orderSummary.totalLines}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-3xl shadow-sm xl:col-span-1">
            <CardHeader className="pb-2">
              <CardDescription>Accepted Qty</CardDescription>
              <CardTitle className="text-3xl">{orderSummary.acceptedQty}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-3xl shadow-sm xl:col-span-1">
            <CardHeader className="pb-2">
              <CardDescription>Quarantined Qty</CardDescription>
              <CardTitle className="text-3xl">{orderSummary.quarantinedQty}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-3xl shadow-sm xl:col-span-1">
            <CardHeader className="pb-2">
              <CardDescription>Issue Qty</CardDescription>
              <CardTitle className="text-3xl">{orderSummary.issueQty}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-3xl shadow-sm xl:col-span-1">
            <CardHeader className="pb-2">
              <CardDescription>Pending Qty</CardDescription>
              <CardTitle className="text-3xl">{orderSummary.pendingQty}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-6">
            <Card className="rounded-3xl shadow-sm">
              <CardHeader>
                <CardTitle>Expected Lines</CardTitle>
                <CardDescription>
                  Operators act from the expected lines table. Pending quantity is based on accepted + quarantined outcomes only.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[90px]">Action</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Ordered</TableHead>
                      <TableHead className="text-right">Accepted</TableHead>
                      <TableHead className="text-right">Quarantine</TableHead>
                      <TableHead className="text-right">Issues</TableHead>
                      <TableHead className="text-right">Pending</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineMetrics.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>
                          <Button size="sm" className="rounded-xl" onClick={() => openDeclareSheet(line.id)}>
                            <Play className="mr-2 h-4 w-4" />
                            Declare
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">{line.sku}</TableCell>
                        <TableCell>{line.itemName}</TableCell>
                        <TableCell className="text-right">{line.orderedQty}</TableCell>
                        <TableCell className="text-right">{line.acceptedQty}</TableCell>
                        <TableCell className="text-right">{line.quarantinedQty}</TableCell>
                        <TableCell className="text-right">{line.issueQty}</TableCell>
                        <TableCell className="text-right font-semibold">{line.pendingQty}</TableCell>
                        <TableCell>
                          <StatusBadge value={line.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm">
              <CardHeader>
                <CardTitle>Declared Outcomes</CardTitle>
                <CardDescription>
                  Saved declarations stay visible until the receipt is finalized. Corrections supersede prior declarations instead of mutating them in place.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>Effective</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {declaredOutcomes.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.time}</TableCell>
                        <TableCell className="font-medium">{row.sku}</TableCell>
                        <TableCell>{row.itemName}</TableCell>
                        <TableCell className="text-right">{row.quantity}</TableCell>
                        <TableCell>
                          <OutcomeBadge value={row.outcome} />
                        </TableCell>
                        <TableCell>
                          <Badge variant={row.effective ? 'default' : 'secondary'} className="rounded-lg">
                            {row.effective ? 'ACTIVE' : 'SUPERSEDED'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[220px] truncate text-slate-600">{row.notes || '—'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-xl"
                            disabled={!row.effective}
                            onClick={() => openCorrectionSheet(row)}
                          >
                            <Undo2 className="mr-2 h-4 w-4" />
                            Correct
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-3xl border-dashed shadow-sm">
              <CardHeader>
                <CardTitle>Receipt Summary</CardTitle>
                <CardDescription>Use this panel for validation feedback, exception counts, and next-step guidance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Validation Notes
                  </div>
                  <ul className="space-y-2">
                    <li>Accepted + quarantined quantities drive pending quantity.</li>
                    <li>Non-received outcomes stay visible until final confirmation.</li>
                    <li>Corrections mark prior rows as superseded and insert a new active declaration.</li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="mb-3 font-medium text-slate-900">Next Step</div>
                  <p>
                    {canFinalize
                      ? 'All pending quantities are resolved. The receipt can move to finalization and bin assignment.'
                      : 'Keep declaring outcomes until all pending quantities that count as received are resolved.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetContent side="right" className="w-full sm:max-w-xl">
                <SheetHeader>
                  <SheetTitle>{correctionTargetId ? 'Correct Outcome' : 'Declare Outcome'}</SheetTitle>
                  <SheetDescription>
                    {correctionTargetId
                      ? 'This creates a new declaration and marks the previous row as superseded.'
                      : 'Create a new receipt outcome against the selected expected line.'}
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-8 space-y-6">
                  <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">SKU</div>
                      <div className="mt-1 font-medium text-slate-900">{selectedLine?.sku ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Pending Qty</div>
                      <div className="mt-1 font-medium text-slate-900">{selectedLineMetrics?.pendingQty ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Ordered Qty</div>
                      <div className="mt-1 font-medium text-slate-900">{selectedLine?.orderedQty ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Received Qty</div>
                      <div className="mt-1 font-medium text-slate-900">
                        {selectedLineMetrics ? selectedLineMetrics.acceptedQty + selectedLineMetrics.quarantinedQty : '—'}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Item</div>
                      <div className="mt-1 font-medium text-slate-900">{selectedLine?.itemName ?? 'Select a line'}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Quantity</label>
                      <Input value={quantity} onChange={(event) => setQuantity(event.target.value)} className="rounded-2xl" />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Outcome</label>
                      <div className="grid grid-cols-2 gap-2">
                        {outcomeOptions.map((option) => {
                          const isActive = selectedOutcome === option

                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setSelectedOutcome(option)}
                              className={`rounded-2xl border px-3 py-2 text-left text-sm font-medium transition ${
                                isActive
                                  ? 'border-slate-900 bg-slate-900 text-white'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                            >
                              {option}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
                      <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none ring-0"
                        placeholder="Optional notes for damaged packaging, QA review, mismatch, or correction reason"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t pt-4">
                    <Button variant="outline" className="rounded-2xl" onClick={closeSheet}>
                      Cancel
                    </Button>
                    <Button className="rounded-2xl" onClick={saveDeclaration} disabled={!selectedLine || Number(quantity) <= 0}>
                      Save Declaration
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  )
}
