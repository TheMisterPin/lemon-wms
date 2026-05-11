'use client'

import { useCallback, useState } from 'react'

export function useBinContentsDialog() {
  const [binId, setBinId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const openContents = useCallback((nextBinId: string) => {
    setBinId(nextBinId)
    setOpen(true)
  }, [])

  const onOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setBinId(null)
    }
  }, [])

  return {
    binId,
    open,
    openContents,
    onOpenChange
  }
}
