'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/hook/warehouse/items/use-load-item-to-trolley.md
 */

import { useCallback, useState } from 'react'

import type { BinStockRecord } from '@/components/warehouse/items/use-bin-details'
import { useMoveItems } from '@/components/warehouse/layout/use-move-items'

export function useLoadItemToTrolley(binId: string, onSuccess?: () => void | Promise<void>) {
  const { loadItemFromBin, isSubmitting } = useMoveItems()
  const [selectedItem, setSelectedItem] = useState<BinStockRecord | null>(null)
  const [quantity, setQuantity] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isOpen = selectedItem !== null

  const openForItem = useCallback((item: BinStockRecord) => {
    setSelectedItem(item)
    setQuantity('')
    setError(null)
  }, [])

  const close = useCallback(() => {
    setSelectedItem(null)
    setQuantity('')
    setError(null)
  }, [])

  const onOpenChange = useCallback((open: boolean) => {
    if (!open) {
      close()
    }
  }, [close])

  const submit = useCallback(async () => {
    if (!selectedItem) {
      return
    }

    const parsedQuantity = Number.parseInt(quantity, 10)
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setError('Enter valid quantity greater than zero.')

      return
    }

    const maxQuantity = Number(selectedItem.quantityAvailable) || 0
    if (parsedQuantity > maxQuantity) {
      setError('Selected quantity exceeds available stock.')

      return
    }

    try {
      setError(null)
      await loadItemFromBin(binId, selectedItem.id, parsedQuantity)
      await onSuccess?.()
      close()
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Unable to load item into trolley.'
      setError(message)
    }
  }, [selectedItem, quantity, loadItemFromBin, binId, onSuccess, close])

  return {
    isOpen,
    isSubmitting,
    selectedItem,
    quantity,
    setQuantity,
    error,
    openForItem,
    close,
    onOpenChange,
    submit
  }
}
