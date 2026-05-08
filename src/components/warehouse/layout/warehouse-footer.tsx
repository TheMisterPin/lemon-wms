'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/warehouse/layout/warehouse-footer.md
 */


import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { Loader2, LogOut, ShoppingCart } from 'lucide-react'

import NumericKeypad from '@/components/shared/numeric-keypad'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { useMoveItems } from '@/components/warehouse/layout/use-move-items'
import { useAuthStore } from '@/lib/auth/store'

export function WarehouseFooter() {
  const router = useRouter()
  const params = useParams<{ id?: string }>()
  const destinationBinId = typeof params?.id === 'string' ? params.id : null
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const {
    trolleyItems,
    selectedIds,
    isSheetOpen,
    isLoading,
    isSubmitting,
    error,
    setSheetOpen,
    refreshTrolley,
    toggleSelection,
    clearSelection,
    unloadSelectedToBin
  } = useMoveItems()
  const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false)
  const [quantityToUnload, setQuantityToUnload] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const selectedItems = useMemo(
    () => trolleyItems.filter((item) => selectedIds.includes(item.id)),
    [selectedIds, trolleyItems]
  )

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    clearAuth()
    router.push('/login')
  }

  useEffect(() => {
    if (isSheetOpen) {
      void refreshTrolley()
    }
  }, [isSheetOpen, refreshTrolley])

  async function handleUnloadSelection() {
    if (!destinationBinId) {
      setLocalError('Open bin details page to unload trolley items.')

      return
    }
    if (selectedItems.length === 0) {
      setLocalError('Select at least one item in trolley.')

      return
    }

    if (selectedItems.length === 1 && selectedItems[0].quantityAvailable > 1) {
      setIsQuantityDialogOpen(true)

      return
    }

    setLocalError(null)
    await unloadSelectedToBin(destinationBinId)
  }

  async function handleConfirmSingleQuantity() {
    if (!destinationBinId) {
      setLocalError('Open bin details page to unload trolley items.')

      return
    }
    const selected = selectedItems[0]
    if (!selected) {
      setLocalError('Select one trolley item.')

      return
    }
    const parsedQuantity = Number.parseInt(quantityToUnload, 10)
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setLocalError('Enter valid quantity greater than zero.')

      return
    }
    if (parsedQuantity > selected.quantityAvailable) {
      setLocalError('Quantity exceeds selected trolley item quantity.')

      return
    }

    setLocalError(null)
    await unloadSelectedToBin(destinationBinId, parsedQuantity)
    setIsQuantityDialogOpen(false)
    setQuantityToUnload('')
  }

  return (
    <footer className="flex h-14 shrink-0 items-center border-t border-brand-border bg-brand-surface px-4">
      <button
        onClick={handleLogout}
        className="flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-brand-muted transition-colors hover:bg-brand-glass-hover hover:text-brand-text cursor-pointer"
      >
        <LogOut className="h-5 w-5" />
        Logout
      </button>

      <div className="ml-auto">
        <button
          onClick={() => setSheetOpen(true)}
          className="flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-brand-muted transition-colors hover:bg-brand-glass-hover hover:text-brand-text cursor-pointer"
        >
          <ShoppingCart className="h-5 w-5" />
          Trolley
          {trolleyItems.length > 0 ? <span>({trolleyItems.length})</span> : null}
        </button>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full max-w-md">
          <SheetHeader>
            <SheetTitle>Trolley items</SheetTitle>
            <SheetDescription>
              Select one or more items and unload them into current bin.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {isLoading ? (
              <div className="flex min-h-24 items-center justify-center gap-2 text-sm text-brand-muted">
                <Loader2 className="size-4 animate-spin" />
                Loading trolley items...
              </div>
            ) : null}

            {!isLoading && trolleyItems.length === 0 ? (
              <p className="rounded-lg border border-dashed border-brand-border px-4 py-6 text-sm text-brand-muted">
                Your trolley is empty.
              </p>
            ) : null}

            {!isLoading && trolleyItems.length > 0 ? (
              <div className="space-y-2">
                {trolleyItems.map((item) => (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-brand-border bg-brand-surface/70 p-3"
                  >
                    <Checkbox
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={() => toggleSelection(item.id)}
                    />
                    <div className="space-y-0.5 text-sm">
                      <p className="font-medium text-brand-text">{item.name}</p>
                      <p className="text-brand-muted">
                        Qty: {item.quantityAvailable} {item.uom}
                      </p>
                      <p className="text-brand-subtle text-xs">
                        Source: {item.sourceBinName} ({item.sourceBinCode})
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            ) : null}
          </div>

          <SheetFooter>
            {(error || localError) ? (
              <p className="rounded-lg border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-400">
                {localError ?? error}
              </p>
            ) : null}
            <div className="flex items-center gap-2">
              <Button variant="outline" type="button" onClick={clearSelection} disabled={isSubmitting}>
                Clear
              </Button>
              <Button type="button" onClick={handleUnloadSelection} disabled={isSubmitting || selectedItems.length === 0}>
                {isSubmitting ? 'Unloading...' : 'Unload to this bin'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog
        open={isQuantityDialogOpen}
        onOpenChange={(open) => {
          setIsQuantityDialogOpen(open)
          if (!open) {
            setQuantityToUnload('')
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Choose unload quantity</DialogTitle>
            <DialogDescription>
              Selected item has more than one unit. Enter how many to unload.
            </DialogDescription>
          </DialogHeader>
          <NumericKeypad
            value={quantityToUnload}
            onChange={setQuantityToUnload}
            onConfirm={handleConfirmSingleQuantity}
            maxLength={6}
            disabled={isSubmitting}
            emptyLabel="Enter quantity"
          />
        </DialogContent>
      </Dialog>
    </footer>
  )
}
