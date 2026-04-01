'use client'

import { useEffect, useState, type ReactNode } from 'react'

import { useAuthStore } from '@/lib/auth/store'
import type { AuthUser } from '@/types'

type RefreshResponse = {
  accessToken: string
  user: AuthUser
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

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
  }, [setAuth, clearAuth])

  if (!ready) {
    return null
  }

  return <>{children}</>
}
