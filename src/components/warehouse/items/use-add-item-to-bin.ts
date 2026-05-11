'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/hook/warehouse/items/use-add-item-to-bin.md
 */

import { useEffect, useRef, useState } from 'react'

import { warehouseApiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/responses/basic-response'

const SEARCH_DEBOUNCE_MS = 300
const MIN_SEARCH_LENGTH = 3
const PAGE_SIZE = 10

export type WarehouseItem = {
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

export function useAddItemToBin(binId: string, onSuccess?: () => void | Promise<void>) {
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

        const response = await warehouseApiClient.get<ApiResponse<WarehouseItemsResponse>>('/warehouse/items', params)

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
        console.error('[useAddItemToBin] Failed to load items:', fetchError)
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
      setError('Enter valid quantity greater than zero.')

      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const response = await warehouseApiClient.post<ApiResponse<{ stockItems: unknown[] }>>(
        `/warehouse/stock/addtobin/${binId}`,
        { itemId: selectedItem.id, quantity: parsedQuantity }
      )

      if (!response.success) {
        setError(response.message || 'Unable to add item to this bin.')

        return
      }

      setIsQuantityOpen(false)
      setIsPickerOpen(false)
      resetSelectionState()
      await onSuccess?.()
    } catch (submitError) {
      console.error('[useAddItemToBin] Failed to add item:', submitError)
      setError('Unable to add item to this bin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isPickerOpen,
    handlePickerOpenChange,
    items,
    page,
    totalPages,
    isLoadingItems,
    searchInput,
    setSearchInput,
    debouncedSearch,
    searchInputRef,
    handleSelectItem,
    prevPage: () => setPage((p) => Math.max(1, p - 1)),
    nextPage: () => setPage((p) => Math.min(totalPages, p + 1)),
    isQuantityOpen,
    handleQuantityOpenChange,
    selectedItem,
    quantity,
    setQuantity,
    isSubmitting,
    handleSubmitQuantity,
    handleBackToItems,
    error,
    MIN_SEARCH_LENGTH
  }
}
