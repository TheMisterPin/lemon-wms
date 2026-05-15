'use client'

import { useCallback, useState } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { useAuthStore } from '@/lib/auth/store'
import { warehouseApiClient } from '@/lib/axios'
import type { SwitchFloorZoneResult } from '@/lib/iam/switch-floor-zone'
import type { AuthDevice, AuthLocation, AuthUser } from '@/types'
import type { ApiResponse } from '@/types/responses/basic-response'

type UseSwitchFloorZoneReturn = {
  switchZone: (zoneId: string) => Promise<{ success: boolean; error?: string }>
  isSwitching: boolean
}

export function useSwitchFloorZone(): UseSwitchFloorZoneReturn {
  const setAuth = useAuthStore((s) => s.setAuth)
  const { user } = useAuthStore(
    useShallow((state) => ({
      user: state.user
    }))
  )
  const [isSwitching, setIsSwitching] = useState(false)

  const switchZone = useCallback(
    async (zoneId: string): Promise<{ success: boolean; error?: string }> => {
      if (!user) {
        return { success: false, error: 'Not signed in.' }
      }

      setIsSwitching(true)

      try {
        const response = await warehouseApiClient.post<ApiResponse<SwitchFloorZoneResult>>(
          '/warehouse/zone',
          { zoneId }
        )

        if (response.success && response.data) {
          const payload: SwitchFloorZoneResult = response.data
          const nextUser: AuthUser = {
            id: payload.user.id,
            fullName: payload.user.fullName,
            email: payload.user.email ?? null,
            role: payload.user.role,
            badgeNumber: payload.user.badgeNumber
          }
          const nextLocation: AuthLocation = {
            warehouseId: payload.location.warehouseId,
            zoneId: payload.location.zoneId
          }
          const nextDevice: AuthDevice = {
            id: payload.device.id,
            name: payload.device.name,
            code: payload.device.code,
            warehouseId: payload.device.warehouseId,
            zoneId: payload.device.zoneId
          }

          setAuth(payload.accessToken, nextUser, {
            location: nextLocation,
            device: nextDevice
          })
          window.dispatchEvent(new CustomEvent('warehouse-zone-changed', {
            detail: { zoneId: nextLocation.zoneId }
          }))

          return { success: true }
        }

        return { success: false, error: response.message ?? 'Could not change zone.' }
      } catch {
        return { success: false, error: 'Could not reach the server.' }
      } finally {
        setIsSwitching(false)
      }
    },
    [setAuth, user]
  )

  return { switchZone, isSwitching }
}
