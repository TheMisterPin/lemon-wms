'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { dashboardApiClient } from '@/lib/axios'
import type { BinWithContent } from '@/lib/locations'
import type {
  BinContentLineDto,
  BinContentTableRowDto
} from '@/types/dto/locations/bin-contents'
import type { BinItemStatus } from '@/types/models/enums'
import type { ApiResponse } from '@/types/responses/basic-response'

function quantityForBinItemStatus(line: BinContentLineDto): number {
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

function toContentTableRows(lines: BinContentLineDto[]): BinContentTableRowDto[] {
  return lines.map((line) => ({
    ...line,
    statusQuantity: quantityForBinItemStatus(line)
  }))
}

export function useBinContents(binId: string | null, open: boolean) {
  const [bin, setBin] = useState<BinWithContent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!binId) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await dashboardApiClient.get<ApiResponse<BinWithContent>>(`/dashboard/bins/${binId}`)
      if (res.success && res.data) {
        setBin(res.data)
      } else {
        setBin(null)
        setError(res.message ?? 'Could not load bin.')
      }
    } catch {
      setBin(null)
      setError('Could not load bin.')
    } finally {
      setLoading(false)
    }
  }, [binId])

  useEffect(() => {
    if (!open || !binId) {
      setBin(null)
      setError(null)

      return
    }

    void load()
  }, [open, binId, load])

  const tableRows = useMemo(() => (bin ? toContentTableRows(bin.content) : []), [bin])
  const dialogTitle = bin ? `${bin.name} (${bin.code})` : 'Bin contents'
  const showSpinner = loading || (Boolean(open && binId && !bin && !error))

  return {
    bin,
    error,
    loading,
    tableRows,
    dialogTitle,
    showSpinner
  }
}
