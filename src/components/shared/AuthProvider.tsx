'use client'

import { useEffect, useState, type ReactNode } from 'react'

import { readStoredAccessToken, useAuthStore } from '@/lib/auth/store'
import type { AuthUser, JWTPayload } from '@/types'

type RefreshResponse = {
  accessToken: string
  user: AuthUser
}

const readCookie = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null
  }

  const value = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1]

  return value ?? null
}

const decodeAccessToken = (token: string): JWTPayload | null => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const payload = JSON.parse(atob(padded)) as JWTPayload

    if (!payload.userId || !payload.role) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

const getUsableAccessToken = (token: string | null): string | null => {
  if (!token) {
    return null
  }

  const payload = decodeAccessToken(token)
  if (!payload) {
    return null
  }

  if (payload.exp && payload.exp * 1000 <= Date.now()) {
    return null
  }

  return token
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const setToken = useAuthStore((s) => s.setToken)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const accessToken =
      getUsableAccessToken(readStoredAccessToken()) ??
      getUsableAccessToken(readCookie('access_token'))

    if (accessToken && user) {
      setToken(accessToken)
      setReady(true)

      return () => {
        cancelled = true
      }
    }

    const rehydrate = async () => {
      try {
        const res = await fetch('/api/auth/refresh', { method: 'POST' })
        if (cancelled) {
          return
        }

        if (res.ok) {
          const data: RefreshResponse = await res.json()
          setAuth(data.accessToken, data.user)
        } else {
          clearAuth()
        }
      } catch {
        if (!cancelled) {
          clearAuth()
        }
      } finally {
        if (!cancelled) {
          setReady(true)
        }
      }
    }

    rehydrate()

    return () => {
      cancelled = true
    }
  }, [user, setToken, setAuth, clearAuth])

  if (!ready) {
    return null
  }

  return <>{children}</>
}
