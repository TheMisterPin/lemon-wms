'use client'

import Link from 'next/link'

import { ArrowLeft, Loader2, Pause, Play, RotateCcw } from 'lucide-react'

import {
  WarehouseOverviewStatusPill,
  warehouseOverviewToneStyles,
  type WarehouseOverviewTone
} from '@/components/primitives/warehouse-overview-primitives'
import { OrderStatus } from '@/generated/prisma'

type WarehousePurchaseOrderDetailsHeaderProps = {
  reference: string
  supplierLabel: string
  warehouseId: string
  status: OrderStatus
  backHref: string
  isBusy: boolean
  onStart: () => void
  onPause: () => void
  onResume: () => void
}

function statusTone(status: OrderStatus): WarehouseOverviewTone {
  if (status === OrderStatus.EXECUTING) {
    return 'success'
  }

  if (status === OrderStatus.PAUSED || status === OrderStatus.RELEASED) {
    return 'warning'
  }

  return 'neutral'
}

export function WarehousePurchaseOrderDetailsHeader({
  reference,
  supplierLabel,
  warehouseId,
  status,
  backHref,
  isBusy,
  onStart,
  onPause,
  onResume
}: WarehousePurchaseOrderDetailsHeaderProps) {
  const tone = statusTone(status)
  const toneColor = warehouseOverviewToneStyles[tone].icon

  const canStart = status === OrderStatus.RELEASED
  const canPause = status === OrderStatus.EXECUTING
  const canResume = status === OrderStatus.PAUSED

  return (
    <header className="flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-start sm:justify-between" style={{
      background: 'var(--wh-card-bg)',
      borderColor: 'var(--wh-border)'
    }}
    >
      <div className="min-w-0 space-y-2">
        <Link
          href={backHref}
          prefetch={false}
          className="inline-flex w-fit items-center gap-2 text-sm font-medium transition hover:opacity-90"
          style={{ color: 'var(--wh-text-secondary)' }}
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Back to purchase orders
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl" style={{ color: 'var(--wh-text-primary)' }}>
            {reference}
          </h1>
          <WarehouseOverviewStatusPill tone={tone}>{status}</WarehouseOverviewStatusPill>
        </div>
        <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
          <span style={{ color: toneColor }} className="font-medium">{supplierLabel}</span>
          <span aria-hidden className="mx-2 opacity-60">·</span>
          <span className="font-mono">{warehouseId}</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            background: 'transparent',
            borderColor: 'color-mix(in srgb, var(--wh-status-available) 55%, transparent)',
            color: 'var(--wh-status-available)'
          }}
          disabled={isBusy || !canStart}
          onClick={() => void onStart()}
        >
          {isBusy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Play className="size-4" aria-hidden />
          )}
          Start
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            background: 'transparent',
            borderColor: 'color-mix(in srgb, var(--wh-status-full) 55%, transparent)',
            color: 'var(--wh-status-full)'
          }}
          disabled={isBusy || !canPause}
          onClick={() => void onPause()}
        >
          {isBusy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Pause className="size-4" aria-hidden />
          )}
          Pause
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            background: 'transparent',
            borderColor: 'color-mix(in srgb, var(--wh-status-available) 55%, transparent)',
            color: 'var(--wh-status-available)'
          }}
          disabled={isBusy || !canResume}
          onClick={() => void onResume()}
        >
          {isBusy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <RotateCcw className="size-4" aria-hidden />
          )}
          Resume
        </button>
      </div>
    </header>
  )
}
