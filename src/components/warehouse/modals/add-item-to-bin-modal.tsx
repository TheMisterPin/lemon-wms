'use client'

import { useEffect, useRef, useState } from 'react'

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
import { apiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/responses/basic-response'

const SEARCH_DEBOUNCE_MS = 300
const MIN_SEARCH_LENGTH = 3

const PAGE_SIZE = 10

type WarehouseItem = {
  id: string
  name: string
  sku: string
  uom: string
}

type WarehouseItemsResponse = {
  items: WarehouseItem[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
}

type AddItemToBinModalProps = {
  binId: string
  onSuccess?: () => void | Promise<void>
}

export default function AddItemToBinModal({ binId, onSuccess }: AddItemToBinModalProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isQuantityOpen, setIsQuantityOpen] = useState(false)
  const [items, setItems] = useState<WarehouseItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedItem, setSelectedItem] = useState<WarehouseItem | null>(null)
  const [quantity, setQuantity] = useState('')
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Debounce: fire search after SEARCH_DEBOUNCE_MS when >= MIN_SEARCH_LENGTH chars, clear immediately otherwise
  useEffect(() => {
    const trimmed = searchInput.trim()

    if (trimmed.length >= MIN_SEARCH_LENGTH) {
      const timer = setTimeout(() => {
        setDebouncedSearch(trimmed)
        setPage(1)
      }, SEARCH_DEBOUNCE_MS)

      return () => clearTimeout(timer)
    }

    setDebouncedSearch('')
    setPage(1)
  }, [searchInput])

  useEffect(() => {
    if (!isPickerOpen) {
      return
    }

    let isActive = true

    async function fetchItems() {
      try {
        setIsLoadingItems(true)
        setError(null)

        const params: Record<string, unknown> = { page, pageSize: PAGE_SIZE }

        if (debouncedSearch.length >= MIN_SEARCH_LENGTH) {
          params.q = debouncedSearch
        }

        const response = await apiClient.get<ApiResponse<WarehouseItemsResponse>>('/warehouse/items', params)

        if (!isActive) {
          return
        }

        if (!response.success || !response.data) {
          setError(response.error?.code ? 'Unable to load items.' : response.message)

          return
        }

        setItems(response.data.items)
        setTotalPages(response.data.pagination.totalPages)
      } catch (fetchError) {
        console.error('Failed to load items for bin.', fetchError)

        if (isActive) {
          setError('Unable to load items.')
        }
      } finally {
        if (isActive) {
          setIsLoadingItems(false)
        }
      }
    }

    void fetchItems()

    return () => {
      isActive = false
    }
  }, [isPickerOpen, page, debouncedSearch])

  function resetSelectionState() {
    setSelectedItem(null)
    setQuantity('')
    setError(null)
  }

  function handlePickerOpenChange(open: boolean) {
    if (isSubmitting) {
      return
    }

    setIsPickerOpen(open)

    if (open) {
      setPage(1)
      setError(null)
      setTimeout(() => searchInputRef.current?.focus(), 50)

      return
    }

    setSearchInput('')
    setDebouncedSearch('')
    setItems([])
    setTotalPages(1)
    resetSelectionState()
  }

  function handleSelectItem(item: WarehouseItem) {
    setSelectedItem(item)
    setQuantity('')
    setError(null)
    setIsPickerOpen(false)
    setIsQuantityOpen(true)
  }

  function handleBackToItems() {
    if (isSubmitting) {
      return
    }

    setIsQuantityOpen(false)
    setQuantity('')
    setError(null)
    setIsPickerOpen(true)
  }

  function handleQuantityOpenChange(open: boolean) {
    if (isSubmitting) {
      return
    }

    setIsQuantityOpen(open)

    if (!open) {
      resetSelectionState()
    }
  }

  async function handleSubmitQuantity() {
    if (!selectedItem) {
      setError('Select an item first.')

      return
    }

    const parsedQuantity = Number.parseInt(quantity, 10)

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setError('Enter a valid quantity greater than zero.')

      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const response = await apiClient.post<ApiResponse<{ stockItems: unknown[] }>>(
        `/warehouse/stock/addtobin/${binId}`,
        {
          itemId: selectedItem.id,
          quantity: parsedQuantity
        }
      )

      if (!response.success) {
        setError(response.message || 'Unable to add the item to this bin.')

        return
      }

      setIsQuantityOpen(false)
      setIsPickerOpen(false)
      resetSelectionState()
      await onSuccess?.()
    } catch (submitError) {
      console.error('Failed to add item to bin.', submitError)
      setError('Unable to add the item to this bin.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
            <DialogDescription>
              Choose an item to add to the current bin.
            </DialogDescription>
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
            {searchInput.length > 0 ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchInput('')}
                className="absolute right-3 text-brand-muted hover:text-brand-text"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          {/* Search status hint */}
          {searchInput.trim().length > 0 && searchInput.trim().length < MIN_SEARCH_LENGTH ? (
            <p className="text-xs text-brand-muted px-1">
              Type {MIN_SEARCH_LENGTH - searchInput.trim().length} more character{MIN_SEARCH_LENGTH - searchInput.trim().length !== 1 ? 's' : ''} to search…
            </p>
          ) : null}

          {/* Searching indicator (debounce pending) */}
          {searchInput.trim() !== debouncedSearch && searchInput.trim().length >= MIN_SEARCH_LENGTH ? (
            <p className="flex items-center gap-1.5 text-xs text-brand-muted px-1">
              <Loader2 className="size-3 animate-spin" />
              Searching…
            </p>
          ) : null}

          <div className="flex max-h-[45vh] flex-col gap-3 overflow-y-auto pr-1">
            {isLoadingItems ? (
              <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-brand-muted">
                <Loader2 className="animate-spin" />
                <span>Loading items...</span>
              </div>
            ) : null}

            {!isLoadingItems && items.length === 0 && debouncedSearch.length >= MIN_SEARCH_LENGTH ? (
              <div className="rounded-lg border border-dashed border-brand-border px-4 py-8 text-center text-sm text-brand-muted">
                No items match &ldquo;{debouncedSearch}&rdquo;.
              </div>
            ) : null}

            {!isLoadingItems && items.length === 0 && debouncedSearch.length < MIN_SEARCH_LENGTH ? (
              <div className="rounded-lg border border-dashed border-brand-border px-4 py-8 text-center text-sm text-brand-muted">
                No items available.
              </div>
            ) : null}

            {!isLoadingItems
              ? items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectItem(item)}
                  className="flex min-h-16 items-center justify-between rounded-lg border border-brand-border bg-brand-surface/80 px-4 py-3 text-left transition-colors hover:border-brand-primary hover:bg-brand-surface"
                >
                  <span className="flex flex-col gap-1">
                    <span className="font-medium text-brand-text">{item.name}</span>
                    <span className="text-xs text-brand-muted">
                      {item.sku} · {item.uom}
                    </span>
                  </span>
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-brand-muted">
                    Select
                  </span>
                </button>
              ))
              : null}
          </div>

          {error ? (
            <p role="alert" className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-2.5 text-sm text-red-400">
              {error}
            </p>
          ) : null}

          <DialogFooter className="items-center sm:justify-between">
            <span className="text-sm text-brand-muted">
              {debouncedSearch.length >= MIN_SEARCH_LENGTH
                ? `Page ${page} of ${totalPages} · "${debouncedSearch}"`
                : `Page ${page} of ${totalPages}`}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                disabled={isLoadingItems || page <= 1}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                disabled={isLoadingItems || page >= totalPages}
              >
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
            {selectedItem ? (
              <div className="rounded-lg border border-brand-border bg-brand-surface/70 px-4 py-3 text-sm text-brand-muted">
                {selectedItem.sku} · {selectedItem.uom}
              </div>
            ) : null}

            <NumericKeypad
              value={quantity}
              onChange={setQuantity}
              onConfirm={handleSubmitQuantity}
              maxLength={6}
              disabled={isSubmitting}
              emptyLabel="Enter quantity"
            />

            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2 text-sm text-brand-muted">
                <Loader2 className="animate-spin" />
                <span>Adding item to bin...</span>
              </div>
            ) : null}

            {error ? (
              <p role="alert" className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-2.5 text-sm text-red-400">
                {error}
              </p>
            ) : null}
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
