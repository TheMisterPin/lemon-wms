'use client'

import type { ReactNode } from 'react'
import { LayoutGrid } from 'lucide-react'

import { CategoryPickerIcon } from '@/components/primitives/media/category-icon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { StockCategoryTreeNodeDto } from '@/types/stock-category-tree.types'

type SelectStockCategoryModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  parents: StockCategoryTreeNodeDto[]
  isLoading: boolean
  error: string | null
  onRefetch: () => void
  onConfirm: (parentCode: string) => void
}

type FieldShellProps = {
  label: string
  description: string
  iconUrl: string | null
  children: ReactNode
}

function FieldShell({ label, description, iconUrl, children }: FieldShellProps) {
  return (
    <div className={cn('space-y-3 rounded-lg border border-border bg-card/50 p-4 shadow-sm')}>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/80 text-muted-foreground'
          )}
        >
          <CategoryPickerIcon iconUrl={iconUrl} fallback={LayoutGrid} size={20} />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-medium leading-none">{label}</p>
          <p className="text-xs text-muted-foreground leading-snug">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export function SelectStockCategoryModal({
  open,
  onOpenChange,
  parents,
  isLoading,
  error,
  onRefetch,
  onConfirm
}: SelectStockCategoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(90vh,640px)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton
      >
        <DialogHeader className="space-y-1 border-b border-border px-6 py-4 text-left">
          <DialogTitle>Open a category</DialogTitle>
          <DialogDescription>
            Choose a parent category to view its stock overview in the dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading categories…</p>
          ) : null}

          {!isLoading && error ? (
            <div
              className={cn(
                'rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive'
              )}
            >
              <p>{error}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => onRefetch()}
              >
                Try again
              </Button>
            </div>
          ) : null}

          {!isLoading && !error && parents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No parent categories are configured yet.</p>
          ) : null}

          {!isLoading && !error && parents.length > 0 ? (
            <div className="space-y-3">
              {parents.map((p) => (
                <FieldShell
                  key={p.code}
                  label={p.name}
                  description={`Code ${p.code}`}
                  iconUrl={p.iconUrl}
                >
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => {
                      onConfirm(p.code)
                      onOpenChange(false)
                    }}
                  >
                    View category
                  </Button>
                </FieldShell>
              ))}
            </div>
          ) : null}
        </div>

        <DialogFooter className="border-t border-border px-6 py-4 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
