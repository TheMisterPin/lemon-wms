'use client'

// TODO: The three separate useAuthStore selectors (user, location, device)
// create three independent Zustand subscriptions. All three change atomically
// during setAuth, which triggers three separate re-renders in the same tick.
// Merge into a single selector:
//   const { user, location, device } = useAuthStore(
//     (s) => ({ user: s.user, location: s.location, device: s.device }),
//     shallow
//   )
// Requires importing `shallow` from 'zustand/shallow'.

// TODO: isLoading is hardcoded as `false` and typed as a literal. This hides
// the real "user not yet populated" state that occurs on page refresh (token
// is in localStorage but user/location/device are null until setAuth fires).
// Once store persistence is implemented (see store.ts TODO), isLoading should
// reflect actual hydration state.

// TODO: Export the AuthState type so callers can type variables without
// repeating the shape (e.g. `const auth: AuthState = useAuth()`).

import { useMemo } from 'react'

import type { Role } from '@/generated/prisma'
import {
  type AuthDevice,
  type AuthLocation,
  useAuthStore
} from '@/lib/auth/store'
import type { AuthUser } from '@/types'

type AuthState = {
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
  isAuthenticated: boolean
  isOfficeRole: boolean
  isFloorRole: boolean
  isLoading: false
}

const OFFICE_ROLES: Role[] = ['OWNER', 'OFFICE_MANAGER', 'OFFICE_WORKER']
const FLOOR_ROLES: Role[] = ['WAREHOUSE_MANAGER', 'WAREHOUSE_WORKER']

export function useAuth(): AuthState {
  const user = useAuthStore((state) => state.user)
  const location = useAuthStore((state) => state.location)
  const device = useAuthStore((state) => state.device)

  const isOfficeRole = user !== null && OFFICE_ROLES.includes(user.role)
  const isFloorRole = user !== null && FLOOR_ROLES.includes(user.role)

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
    dashboard,
    warehouse,
    isAuthenticated: user !== null,
    isOfficeRole,
    isFloorRole,
    isLoading: false
  }
}
