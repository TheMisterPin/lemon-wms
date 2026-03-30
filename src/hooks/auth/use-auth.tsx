'use client'

import { useEffect, useState } from 'react'

import type { Role } from '@/generated/prisma'

export type AuthUser = {
  userId: string
  role: Role
  deviceId?: string
  zoneId?: string
  warehouseId?: string
}

type AuthState = {
  user: AuthUser | null
  isAuthenticated: boolean
  isOfficeRole: boolean
  isFloorRole: boolean
  isLoading: boolean
}

const OFFICE_ROLES: Role[] = ['OWNER', 'OFFICE_MANAGER', 'OFFICE_WORKER']
const FLOOR_ROLES: Role[] = ['WAREHOUSE_MANAGER', 'WAREHOUSE_WORKER']

function parseAccessTokenCookie(): AuthUser | null {
  if (typeof document === 'undefined') return null

  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith('access_token='))

  if (!match) return null

  const token = match.split('=')[1]
  if (!token) return null

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))

    if (!payload.userId || !payload.role) return null

    // Check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) return null

    return {
      userId: payload.userId,
      role: payload.role as Role,
      deviceId: payload.deviceId,
      zoneId: payload.zoneId,
      warehouseId: payload.warehouseId,
    }
  } catch {
    return null
  }
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const parsed = parseAccessTokenCookie()
    setUser(parsed)
    setIsLoading(false)

    // Re-check when the tab regains focus (token may have refreshed or expired)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setUser(parseAccessTokenCookie())
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return {
    user,
    isAuthenticated: user !== null,
    isOfficeRole: user !== null && OFFICE_ROLES.includes(user.role),
    isFloorRole: user !== null && FLOOR_ROLES.includes(user.role),
    isLoading,
  }
}
