'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { SelectLocationModal } from '@/components/features/locations/shared/components/select-location-modal'
import { useSelectLocationModalData } from '@/components/features/locations/shared/hooks/use-select-location-modal-data'
import type { SelectLocationModalConfirmPayload, SelectLocationModalVariant } from '@/types/dto/locations/select-location-modal.types'

type LocationsPickerLandingProps = {
  variant: SelectLocationModalVariant
}

export function LocationsPickerLanding({ variant }: LocationsPickerLandingProps) {
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const pickedRef = useRef(false)
  const { tree, isLoading, error, refetch } = useSelectLocationModalData(true)

  const handleConfirm = (payload: SelectLocationModalConfirmPayload): void => {
    pickedRef.current = true

    if (payload.variant === 'warehouse') {
      router.push(`/dashboard/locations/warehouses/${payload.warehouseId}`)

      return
    }

    if (payload.variant === 'zone') {
      router.push(`/dashboard/locations/zones/${payload.zoneId}`)

      return
    }

    router.push(`/dashboard/locations/bins/${payload.binId}`)
  }

  return (
    <main className="min-h-[40vh] p-4 xl:p-6" style={{ background: 'var(--wh-page-bg)' }}>
      <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
        Choose a location to continue…
      </p>
      <SelectLocationModal
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen && !pickedRef.current) {
            router.replace('/dashboard/locations')
          }
          if (!nextOpen) {
            pickedRef.current = false
          }
        }}
        variant={variant}
        warehouses={tree}
        isLoading={isLoading}
        error={error}
        onRefetch={refetch}
        onConfirm={handleConfirm}
      />
    </main>
  )
}
