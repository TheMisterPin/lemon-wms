'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/_dashboard-standardization-plan.md
 */

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'

import {
  DashboardChartPanel,
  DashboardSection
} from './dashboard-section'
import { DashboardActivityPreviewSectionProps, DashboardEntityPreviewSectionProps, DashboardPreviewSectionProps } from './types'

function DashboardPreviewSection<T>({
  title,
  items,
  getKey,
  renderItem,
  emptyMessage,
  sheetTitle,
  sheetDescription,
  previewCount,
  sheetGridClassName = 'grid grid-cols-1 gap-3 sm:grid-cols-2'
}: DashboardPreviewSectionProps<T>) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const previewItems = items.slice(0, previewCount)
  const hasMore = items.length > previewCount

  return (
    <>
      <DashboardSection
        title={title}
        action={
          hasMore ? (
            <Button type="button" variant="secondary" size="sm" onClick={() => setSheetOpen(true)}>
              Show all
            </Button>
          ) : null
        }
      >
        <DashboardChartPanel>
          {previewItems.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
              {emptyMessage ?? 'No records found.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {previewItems.map((item) => (
                <div key={getKey(item)}>{renderItem(item)}</div>
              ))}
            </div>
          )}
        </DashboardChartPanel>
      </DashboardSection>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          showCloseButton
          className="flex h-full max-h-[100dvh] w-full flex-col gap-0 overflow-hidden border-[var(--wh-border)] bg-[var(--wh-page-bg)] p-0 text-[var(--wh-text-primary)] sm:max-w-2xl"
        >
          <SheetHeader className="border-b border-[var(--wh-border)] px-4 py-4 text-left">
            <SheetTitle className="text-[var(--wh-text-primary)]">{sheetTitle}</SheetTitle>
            {sheetDescription ? (
              <SheetDescription className="text-[var(--wh-text-muted)]">
                {sheetDescription}
              </SheetDescription>
            ) : null}
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <div className={sheetGridClassName}>
              {items.map((item) => (
                <div key={`sheet-${getKey(item)}`}>{renderItem(item)}</div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export function DashboardEntityPreviewSection<T>(props: DashboardEntityPreviewSectionProps<T>) {
  return <DashboardPreviewSection {...props} previewCount={3} />
}

export function DashboardActivityPreviewSection<T>(props: DashboardActivityPreviewSectionProps<T>) {
  return <DashboardPreviewSection {...props} previewCount={4} sheetGridClassName="grid grid-cols-1 gap-3" />
}
