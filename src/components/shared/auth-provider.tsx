'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/shared/auth-provider.md
 */

import { useEffect, useState, type ReactNode } from 'react'

import { getUsableAccessToken } from '@/lib/auth/decode'
import { readStoredAccessToken, useAuthStore } from '@/lib/auth/store'
import type { AuthUser } from '@/types'

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
