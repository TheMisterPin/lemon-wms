'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/warehouse/modals/load-item-to-trolley-modal.md
 */


import { Loader2 } from 'lucide-react'

import NumericKeypad from '@/components/shared/NumericKeypad'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import type { BinStockRecord } from '@/components/warehouse/items/use-bin-details'

type LoadItemToTrolleyModalProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedItem: BinStockRecord | null
  quantity: string
  onQuantityChange: (value: string) => void
  onSubmit: () => void | Promise<void>
  isSubmitting: boolean
  error: string | null
}

export default function LoadItemToTrolleyModal({
  isOpen,
  onOpenChange,
  selectedItem,
  quantity,
  onQuantityChange,
  onSubmit,
  isSubmitting,
  error
}: LoadItemToTrolleyModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {selectedItem ? `Load ${selectedItem.name} to trolley` : 'Load item to trolley'}
          </DialogTitle>
          <DialogDescription>
            Select the quantity to move from this bin into your trolley.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {selectedItem && (
            <div className="rounded-lg border border-brand-border bg-brand-surface/70 px-4 py-3 text-sm text-brand-muted">
              Available: {Number(selectedItem.quantityAvailable) || 0} {selectedItem.uom}
            </div>
          )}

          <NumericKeypad
            value={quantity}
            onChange={onQuantityChange}
            onConfirm={onSubmit}
            maxLength={6}
            disabled={isSubmitting}
            emptyLabel="Enter quantity"
          />

          {isSubmitting && (
            <div className="flex items-center justify-center gap-2 text-sm text-brand-muted">
              <Loader2 className="animate-spin size-4" />
              <span>Loading item to trolley...</span>
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-2.5 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
