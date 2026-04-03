/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'

import type { Role } from '@/generated/prisma'
import { readStoredAccessToken } from '@/lib/auth/store'

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

const readAccessTokenCookie = (): string | null => {
  if (typeof document === 'undefined') {
    return null
  }

  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith('access_token='))

  if (!match) {
    return null
  }

  return match.split('=')[1] ?? null
}

function parseAccessToken(): AuthUser | null {
  const token = readStoredAccessToken() ?? readAccessTokenCookie()
  if (!token) {
    return null
  }

  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))

    if (!payload.userId || !payload.role) {
      return null
    }

    // Check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null
    }

    return {
      userId: payload.userId,
      role: payload.role as Role,
      deviceId: payload.deviceId,
      zoneId: payload.zoneId,
      warehouseId: payload.warehouseId
    }
  } catch {
    return null
  }
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const parsed = parseAccessToken()
    setUser(parsed)
    setIsLoading(false)

    // Re-check when the tab regains focus (token may have refreshed or expired)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setUser(parseAccessToken())
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
    isLoading
  }
}
