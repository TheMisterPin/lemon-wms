'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/warehouse/modals/add-item-to-bin-modal.md
 */


import { Loader2, PackagePlus, Search, X } from 'lucide-react'

import NumericKeypad from '@/components/shared/NumericKeypad'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useAddItemToBin } from '@/components/warehouse/items/use-add-item-to-bin'

type AddItemToBinModalProps = {
  binId: string
  onSuccess?: () => void | Promise<void>
}

export default function AddItemToBinModal({ binId, onSuccess }: AddItemToBinModalProps) {
  const {
    isPickerOpen, handlePickerOpenChange,
    items, page, totalPages, isLoadingItems,
    searchInput, setSearchInput, debouncedSearch, searchInputRef,
    handleSelectItem, prevPage, nextPage,
    isQuantityOpen, handleQuantityOpenChange,
    selectedItem, quantity, setQuantity, isSubmitting,
    handleSubmitQuantity, handleBackToItems,
    error, MIN_SEARCH_LENGTH
  } = useAddItemToBin(binId, onSuccess)

  return (
    <>
      <Dialog open={isPickerOpen} onOpenChange={handlePickerOpenChange}>
        <DialogTrigger asChild>
          <Button variant="brand" type="button">
            <PackagePlus data-icon="inline-start" />
            Add Item
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select an item</DialogTitle>
            <DialogDescription>Choose an item to add to the current bin.</DialogDescription>
          </DialogHeader>

          {/* Search input */}
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 size-4 text-brand-muted" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, SKU or barcode…"
              autoComplete="off"
              className="w-full rounded-lg border border-brand-border bg-brand-surface py-2.5 pl-10 pr-10 text-sm text-brand-text placeholder-brand-subtle outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            />
            {searchInput.length > 0 && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchInput('')}
                className="absolute right-3 text-brand-muted hover:text-brand-text"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {searchInput.trim().length > 0 && searchInput.trim().length < MIN_SEARCH_LENGTH && (
            <p className="text-xs text-brand-muted px-1">
              Type {MIN_SEARCH_LENGTH - searchInput.trim().length} more character{MIN_SEARCH_LENGTH - searchInput.trim().length !== 1 ? 's' : ''} to search…
            </p>
          )}

          {searchInput.trim() !== debouncedSearch && searchInput.trim().length >= MIN_SEARCH_LENGTH && (
            <p className="flex items-center gap-1.5 text-xs text-brand-muted px-1">
              <Loader2 className="size-3 animate-spin" />
              Searching…
            </p>
          )}

          <div className="flex max-h-[45vh] flex-col gap-3 overflow-y-auto pr-1">
            {isLoadingItems && (
              <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-brand-muted">
                <Loader2 className="animate-spin" />
                <span>Loading items...</span>
              </div>
            )}

            {!isLoadingItems && items.length === 0 && debouncedSearch.length >= MIN_SEARCH_LENGTH && (
              <div className="rounded-lg border border-dashed border-brand-border px-4 py-8 text-center text-sm text-brand-muted">
                No items match &ldquo;{debouncedSearch}&rdquo;.
              </div>
            )}

            {!isLoadingItems && items.length === 0 && debouncedSearch.length < MIN_SEARCH_LENGTH && (
              <div className="rounded-lg border border-dashed border-brand-border px-4 py-8 text-center text-sm text-brand-muted">
                No items available.
              </div>
            )}

            {!isLoadingItems && items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectItem(item)}
                className="flex min-h-16 items-center justify-between rounded-lg border border-brand-border bg-brand-surface/80 px-4 py-3 text-left transition-colors hover:border-brand-primary hover:bg-brand-surface"
              >
                <span className="flex flex-col gap-1">
                  <span className="font-medium text-brand-text">{item.name}</span>
                  <span className="text-xs text-brand-muted">{item.sku} · {item.uom}</span>
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-brand-muted">
                  Select
                </span>
              </button>
            ))}
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-2.5 text-sm text-red-400">
              {error}
            </p>
          )}

          <DialogFooter className="items-center sm:justify-between">
            <span className="text-sm text-brand-muted">
              {debouncedSearch.length >= MIN_SEARCH_LENGTH
                ? `Page ${page} of ${totalPages} · "${debouncedSearch}"`
                : `Page ${page} of ${totalPages}`}
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={prevPage} disabled={isLoadingItems || page <= 1}>
                Previous
              </Button>
              <Button type="button" variant="outline" onClick={nextPage} disabled={isLoadingItems || page >= totalPages}>
                Next
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isQuantityOpen} onOpenChange={handleQuantityOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? `Select quantity for ${selectedItem.name}` : 'Select quantity'}
            </DialogTitle>
            <DialogDescription>
              Confirm how many units should be added to this bin.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {selectedItem && (
              <div className="rounded-lg border border-brand-border bg-brand-surface/70 px-4 py-3 text-sm text-brand-muted">
                {selectedItem.sku} · {selectedItem.uom}
              </div>
            )}

            <NumericKeypad
              value={quantity}
              onChange={setQuantity}
              onConfirm={handleSubmitQuantity}
              maxLength={6}
              disabled={isSubmitting}
              emptyLabel="Enter quantity"
            />

            {isSubmitting && (
              <div className="flex items-center justify-center gap-2 text-sm text-brand-muted">
                <Loader2 className="animate-spin" />
                <span>Adding item to bin...</span>
              </div>
            )}

            {error && (
              <p role="alert" className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-2.5 text-sm text-red-400">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleBackToItems} disabled={isSubmitting}>
              Back to items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
