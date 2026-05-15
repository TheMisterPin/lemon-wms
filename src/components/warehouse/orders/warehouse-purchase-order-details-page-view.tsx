'use client'

import { useMemo, useState } from 'react'

import { CheckCircle2, Loader2 } from 'lucide-react'

import { WarehouseOverviewShellSection } from '@/components/primitives/warehouse-overview-primitives'
import type { WarehousePurchaseOrderDetailsViewModel } from '@/components/warehouse/orders/use-warehouse-purchase-order-details'
import { WarehousePurchaseOrderDeclareLineSheet } from '@/components/warehouse/orders/warehouse-purchase-order-declare-line-sheet'
import { WarehousePurchaseOrderDetailsHeader } from '@/components/warehouse/orders/warehouse-purchase-order-details-header'
import { WarehousePurchaseOrderReceiptKpis } from '@/components/warehouse/orders/warehouse-purchase-order-receipt-kpis'
import { WarehousePurchaseOrderReceiptLinesTable } from '@/components/warehouse/orders/warehouse-purchase-order-receipt-lines-table'

import { OrderStatus } from '@/generated/prisma'

export function WarehousePurchaseOrderDetailsPageView(
  props: WarehousePurchaseOrderDetailsViewModel
) {
  const [sheetLineId, setSheetLineId] = useState<string | null>(null)
  const [finalizeNotes, setFinalizeNotes] = useState('')

  const selectedLine = useMemo(
    () => props.receipt?.lines.find(line => line.id === sheetLineId) ?? null,
    [props.receipt?.lines, sheetLineId]
  )

  const selectedProgress = sheetLineId ? props.lineProgressById.get(sheetLineId) ?? null : null

  const sheetOpen = sheetLineId !== null

  const canDeclare =
    props.orderRow?.status === OrderStatus.EXECUTING
    && Boolean(props.resolvedAssignmentId)

  const isSheetSubmitting =
    props.actingSlice === 'handle' && sheetLineId !== null

  if (props.isOrderLoading && props.orderLoadOutcome === 'idle') {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center gap-3 p-6"
        style={{ background: 'var(--wh-page-bg)', color: 'var(--wh-text-primary)' }}
      >
        <Loader2 className="size-8 animate-spin" aria-hidden />
        <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>Loading purchase order…</p>
      </main>
    )
  }

  if (props.orderLoadOutcome === 'failed' && props.orderRow === null) {
    return (
      <main className="min-h-screen p-6" style={{
        background: 'var(--wh-page-bg)',
        color: 'var(--wh-text-primary)'
      }}
      >
        <WarehouseOverviewShellSection title="Purchase order unavailable">
          <div className="space-y-3 text-sm" style={{ color: 'var(--wh-text-muted)' }}>
            <p>
              The order ID you opened is not linked to any operational purchase orders in your warehouse slice.
            </p>
            <button
              type="button"
              className="rounded-xl border px-4 py-2 text-sm font-medium transition hover:opacity-90"
              style={{ borderColor: 'var(--wh-border)', color: 'var(--wh-text-secondary)' }}
              onClick={() => void props.reload()}
            >
              Retry
            </button>
          </div>
        </WarehouseOverviewShellSection>
      </main>
    )
  }

  if (!props.orderRow) {
    return null
  }

  const row = props.orderRow

  return (
    <main
      className="mx-auto flex min-h-screen max-w-6xl flex-col gap-5 px-4 py-6 pb-24 xl:px-6"
      style={{ background: 'var(--wh-page-bg)', color: 'var(--wh-text-primary)' }}
    >
      <WarehousePurchaseOrderDetailsHeader
        reference={row.reference}
        supplierLabel={row.supplier || 'Supplier unavailable'}
        warehouseId={row.warehouseId}
        status={row.status}
        backHref="/warehouse/orders/purchase"
        isBusy={props.isBusy}
        onStart={() => void props.startOrder()}
        onPause={() => void props.pauseOrder()}
        onResume={() => void props.resumeOrder()}
      />

      {props.receipt ? (
        <WarehousePurchaseOrderReceiptKpis
          receiptReference={props.receipt.reference}
          receiptStatus={props.receipt.status}
          lineCount={props.receipt.lines.length}
          totals={props.totals}
        />
      ) : null}

      {(props.receiptLoadOutcome === 'failed' || props.receiptErrorMessage) && !props.receipt ? (
        <div
          role="alert"
          className="rounded-xl border p-4 text-sm"
          style={{
            borderColor: 'color-mix(in srgb, var(--wh-status-blocked) 45%, transparent)',
            background: 'var(--wh-card-bg-soft)',
            color: 'var(--wh-text-muted)'
          }}
        >
          {props.receiptErrorMessage ?? 'Receipt could not be loaded.'}
        </div>
      ) : null}

      {props.receipt ? (
        <WarehousePurchaseOrderReceiptLinesTable
          lines={props.receipt.lines}
          lineProgressById={props.lineProgressById}
          receiptLoading={props.isReceiptLoading}
          canDeclare={canDeclare}
          isBusy={props.isBusy}
          actingLineId={isSheetSubmitting ? sheetLineId : null}
          onDeclare={(lineId) => {
            setSheetLineId(lineId)
          }}
        />
      ) : null}

      {props.receipt && row.status !== OrderStatus.EXECUTING ? (
        <p className="text-sm" style={{ color: 'var(--wh-status-full)' }}>
          Start the purchase order before declaring receipts. Paused executions must resume first.
        </p>
      ) : null}

      {props.receipt ? (
        <WarehouseOverviewShellSection
          title={
            <span className="inline-flex flex-wrap items-center gap-2">
              Finalize receipt
              {props.actingSlice === 'complete'
                ? <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden /> : null}
            </span>
          }
          action={
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                borderColor: props.canFinalizeReceipt
                  ? 'var(--wh-status-available)'
                  : 'var(--wh-border)',
                background: props.canFinalizeReceipt ? 'var(--wh-status-available)' : 'transparent',
                color: props.canFinalizeReceipt ? 'var(--wh-page-bg)' : 'var(--wh-text-muted)'
              }}
              disabled={!props.canFinalizeReceipt || props.isBusy}
              onClick={() => void props.finalizeReceipt(finalizeNotes.trim() ? finalizeNotes.trim() : undefined)}
            >
              <CheckCircle2 className="size-4" aria-hidden />
              Finalize receipt
            </button>
          }
        >
          <textarea
            className="mt-4 min-h-[88px] w-full rounded-xl border px-3 py-3 text-sm outline-none ring-0"
            style={{
              borderColor: 'var(--wh-border)',
              background: 'var(--wh-page-bg)',
              color: 'var(--wh-text-primary)'
            }}
            placeholder="Optional completion notes forwarded to auditing"
            value={finalizeNotes}
            onChange={event => setFinalizeNotes(event.target.value)}
          />
        </WarehouseOverviewShellSection>
      ) : null}

      <WarehousePurchaseOrderDeclareLineSheet
        open={sheetOpen}
        line={selectedLine}
        lineProgress={selectedProgress}
        dispositionOptions={props.declareOutcomeOptions}
        submitting={isSheetSubmitting}
        onClose={() => setSheetLineId(null)}
        onSubmit={async (input) => {
          if (!sheetLineId) {
            return false
          }

          const result = await props.declareLineHandled(sheetLineId, input)

          return result.success
        }}
      />

      <WarehouseOverviewShellSection title="Operational notes">
        <ul className="list-inside list-disc space-y-2 text-sm" style={{ color: 'var(--wh-text-muted)' }}>
          <li>Warehouse polling refreshes receipts every 12s while you are executing with an open receipt.</li>
          <li>You need an assignment id for handle/finalize — surfaced automatically via list data or start/resume.</li>
        </ul>
      </WarehouseOverviewShellSection>
    </main>
  )
}
