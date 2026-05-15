'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/hook/warehouse/layout/use-move-items.md
 */

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'

import { warehouseApiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/responses/basic-response'

export type TrolleyItem = {
  id: string
  sourceBinId: string
  sourceBinName: string
  sourceBinCode: string
  itemId: string
  name: string
  sku: string
  lotId: string | null
  serialNumberId: string | null
  uom: string
  quantityAvailable: number
}

type TrolleyResponse = { items: TrolleyItem[] }

type MoveItemsContextValue = {
  trolleyItems: TrolleyItem[]
  selectedIds: string[]
  isSheetOpen: boolean
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  setSheetOpen: (open: boolean) => void
  toggleSelection: (id: string) => void
  clearSelection: () => void
  refreshTrolley: () => Promise<void>
  loadItemFromBin: (binId: string, sourceBinStockItemId: string, quantity: number) => Promise<void>
  unloadSelectedToBin: (binId: string, singleQuantity?: number) => Promise<void>
}

const MoveItemsContext = createContext<MoveItemsContextValue | null>(null)

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse<unknown> | undefined

    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message
    }
  }

  return error instanceof Error ? error.message : fallback
}

export function MoveItemsProvider({ children }: { children: ReactNode }) {
  const [trolleyItems, setTrolleyItems] = useState<TrolleyItem[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isSheetOpen, setSheetOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshTrolley = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await warehouseApiClient.get<ApiResponse<TrolleyResponse>>('/warehouse/stock/trolley')
      if (!response.success || !response.data) {
        setError(response.message || 'Unable to fetch trolley items.')

        return
      }
      setTrolleyItems(response.data.items)
      setSelectedIds((current) => current.filter((id) => response.data!.items.some((item) => item.id === id)))
    } catch (fetchError) {
      console.error('[MoveItems] Failed to refresh trolley:', fetchError)
      setError('Unable to fetch trolley items.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadItemFromBin = useCallback(async (binId: string, sourceBinStockItemId: string, quantity: number) => {
    try {
      setIsSubmitting(true)
      setError(null)
      const response = await warehouseApiClient.post<ApiResponse<{ boeId: string | null }>>(
        `/warehouse/stock/load/${binId}`,
        { sourceBinStockItemId, quantity }
      )
      if (!response.success) {
        throw new Error(response.message || 'Unable to load item.')
      }
      await refreshTrolley()
    } catch (submitError) {
      console.error('[MoveItems] Failed to load item:', submitError)
      const message = getApiErrorMessage(submitError, 'Unable to load item.')
      setError(message)
      throw new Error(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [refreshTrolley])

  const unloadSelectedToBin = useCallback(async (binId: string, singleQuantity?: number) => {
    const selectedItems = trolleyItems.filter((item) => selectedIds.includes(item.id))
    if (selectedItems.length === 0) {
      throw new Error('Select at least one item in trolley.')
    }

    const selections = selectedItems.map((item) => {
      const payload: { transitBinStockItemId: string; quantity?: number } = {
        transitBinStockItemId: item.id
      }
      if (selectedItems.length === 1 && typeof singleQuantity === 'number') {
        payload.quantity = singleQuantity
      }

      return payload
    })

    try {
      setIsSubmitting(true)
      setError(null)
      const response = await warehouseApiClient.post<ApiResponse<{ results: unknown[] }>>(
        `/warehouse/stock/unload/${binId}`,
        { selections }
      )
      if (!response.success) {
        throw new Error(response.message || 'Unable to unload selected items.')
      }
      await refreshTrolley()
      setSelectedIds([])
    } catch (submitError) {
      console.error('[MoveItems] Failed to unload items:', submitError)
      const message = getApiErrorMessage(submitError, 'Unable to unload selected items.')
      setError(message)
      throw new Error(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [refreshTrolley, selectedIds, trolleyItems])

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds([])
  }, [])

  const value = useMemo<MoveItemsContextValue>(() => ({
    trolleyItems,
    selectedIds,
    isSheetOpen,
    isLoading,
    isSubmitting,
    error,
    setSheetOpen,
    toggleSelection,
    clearSelection,
    refreshTrolley,
    loadItemFromBin,
    unloadSelectedToBin
  }), [
    trolleyItems,
    selectedIds,
    isSheetOpen,
    isLoading,
    isSubmitting,
    error,
    refreshTrolley,
    loadItemFromBin,
    unloadSelectedToBin,
    toggleSelection,
    clearSelection
  ])

  return <MoveItemsContext.Provider value={value}>{children}</MoveItemsContext.Provider>
}

export function useMoveItems() {
  const context = useContext(MoveItemsContext)
  if (!context) {
    throw new Error('useMoveItems must be used within a MoveItemsProvider')
  }

  return context
}
