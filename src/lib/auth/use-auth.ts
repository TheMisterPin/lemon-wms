'use client'

import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import type { Role } from '@/generated/prisma'
import { useAuthStore } from '@/lib/auth/store'
import type { AuthDevice, AuthLocation, AuthUser } from '@/types'

export type AuthState = {
  user: AuthUser | null
  location: AuthLocation | null
  device: AuthDevice | null
  dashboard: {
    user: AuthUser
  } | null
  warehouse: {
    user: AuthUser
    location: AuthLocation | null
    device: AuthDevice | null
  } | null
  isOwner: boolean
  isAuthenticated: boolean
  isOfficeRole: boolean
  isFloorRole: boolean
  isHydrating: boolean
}

const OFFICE_ROLES: Role[] = ['OWNER', 'OFFICE_MANAGER', 'OFFICE_WORKER']
const FLOOR_ROLES: Role[] = ['OWNER', 'WAREHOUSE_MANAGER', 'WAREHOUSE_WORKER']

export function useAuth(): AuthState {
  const { token, user, location, device } = useAuthStore(
    useShallow((state) => ({
      token: state.token,
      user: state.user,
      location: state.location,
      device: state.device
    }))
  )

  const isOfficeRole = user !== null && OFFICE_ROLES.includes(user.role)
  const isFloorRole = user !== null && FLOOR_ROLES.includes(user.role)
  const isHydrating = token !== null && user === null
  const isOwner = user !== null && user.role === 'OWNER'

  const dashboard = useMemo(() => {
    if (!user || !isOfficeRole) {
      return null
    }

    return { user }
  }, [user, isOfficeRole])

  const warehouse = useMemo(() => {
    if (!user || !isFloorRole) {
      return null
    }

    return {
      user,
      location,
      device
    }
  }, [user, location, device, isFloorRole])

  return {
    user,
    location,
    device,
    isOwner,
    dashboard,
    warehouse,
    isAuthenticated: user !== null,
    isOfficeRole,
    isFloorRole,
    isHydrating
  }
}
