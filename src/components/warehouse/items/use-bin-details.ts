'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/hook/warehouse/items/use-bin-details.md
 */

import { useCallback, useEffect, useMemo, useState } from 'react'

import { warehouseApiClient } from '@/lib/axios'
import type { BinContentTableRowDto } from '@/types/dto/locations/bin-contents'
import type { IBin } from '@/types/models/bin'
import type { IBinItem } from '@/types/models/bin-item'
import type { BinItemStatus } from '@/types/models/enums'
import type { ApiResponse } from '@/types/responses/basic-response'

export type BinStockRecord = {
  id: string
  name: string
  sku: string
  lotId: string | null
  serialNumberId: string | null
  boxId: string | null
  uom: string
  quantityAvailable: number | string
  quantityReserved: number | string
  quantityBlocked: number | string
  status: BinItemStatus
}

export type BinDetails = {
  id: string
  code: string
  name: string
  type: string
  zoneId: string
  warehouseId: string
  currentCapacity: number | string
  maxCapacity: number | string
  isBlocked: boolean
  blockReason: string | null
}

function binItemToStockRecord(item: IBinItem): BinStockRecord {
  return {
    id: item.id,
    name: item.name,
    sku: item.sku,
    lotId: item.lotId,
    serialNumberId: item.serialNumberId,
    boxId: item.boxId,
    uom: item.uom,
    quantityAvailable: item.quantityAvailable,
    quantityReserved: item.quantityReserved,
    quantityBlocked: item.quantityBlocked,
    status: item.status as BinItemStatus
  }
}

function binToDetails(bin: IBin): BinDetails {
  return {
    id: bin.id,
    code: bin.code,
    name: bin.name,
    type: bin.type,
    zoneId: bin.zoneId,
    warehouseId: bin.warehouseId,
    currentCapacity: bin.currentCapacity ?? 0,
    maxCapacity: bin.maxCapacity ?? 0,
    isBlocked: bin.isBlocked,
    blockReason: bin.blockReason
  }
}

function quantityForBinItemStatus(line: IBinItem): number {
  switch (line.status as BinItemStatus) {
  case 'AVAILABLE':
    return line.quantityAvailable
  case 'RESERVED':
    return line.quantityReserved
  case 'BLOCKED':
    return line.quantityBlocked
  case 'IN_TRANSIT':
    return line.quantityAvailable
  default:
    return line.quantityAvailable
  }
}

function toContentTableRows(lines: IBinItem[]): BinContentTableRowDto[] {
  return lines.map((line) => ({
    ...line,
    statusQuantity: quantityForBinItemStatus(line)
  }))
}

export function useBinDetails(binId: string) {
  const [binData, setBinData] = useState<IBin | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchBinDetails = useCallback(async () => {
    if (!binId) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await warehouseApiClient.get<ApiResponse<IBin>>(`/warehouse/bins/${binId}`)
      if (response.success && response.data) {
        setBinData(response.data)
      } else {
        setBinData(null)
        setError(response.message ?? 'Unable to load bin.')
      }
    } catch {
      setBinData(null)
      setError('Could not reach the server. Check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }, [binId])

  useEffect(() => {
    void fetchBinDetails()
  }, [fetchBinDetails, refreshKey])

  const bin = useMemo(() => (binData ? binToDetails(binData) : null), [binData])

  const items = useMemo(
    () => (binData ? binData.content.map(binItemToStockRecord) : []),
    [binData]
  )

  const contentRows = useMemo(
    () => (binData ? toContentTableRows(binData.content) : []),
    [binData]
  )

  const occupancy = useMemo(() => {
    if (!binData) {
      return '0%'
    }
    const current = Number(binData.currentCapacity) || 0
    const max = Number(binData.maxCapacity) || 0
    if (max <= 0) {
      return '0%'
    }

    return `${Math.round((current / max) * 100)}%`
  }, [binData])

  return {
    bin,
    items,
    contentRows,
    isLoading,
    error,
    occupancy,
    refresh: () => setRefreshKey((k) => k + 1)
  }
}
