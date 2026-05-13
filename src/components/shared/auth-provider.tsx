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

type RefreshOutcome =
  | { kind: 'ok'; data: RefreshResponse }
  | { kind: 'unauthorized' }
  | { kind: 'network-error' }

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

let refreshBootstrapPromise: Promise<RefreshOutcome> | null = null

function refreshSessionShared(): Promise<RefreshOutcome> {
  if (!refreshBootstrapPromise) {
    refreshBootstrapPromise = (async (): Promise<RefreshOutcome> => {
      try {
        const res = await fetch('/api/auth/refresh', { method: 'POST' })

        if (!res.ok) {
          return { kind: 'unauthorized' }
        }

        const data = (await res.json()) as RefreshResponse

        return { kind: 'ok', data }
      } catch {
        return { kind: 'network-error' }
      }
    })().finally(() => {
      refreshBootstrapPromise = null
    })
  }

  return refreshBootstrapPromise
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const setToken = useAuthStore((s) => s.setToken)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const accessToken =
        getUsableAccessToken(readStoredAccessToken()) ??
        getUsableAccessToken(readCookie('access_token'))

      const storedUser = useAuthStore.getState().user

      if (accessToken && storedUser) {
        setToken(accessToken)
        if (!cancelled) {
          setReady(true)
        }

        return
      }

      const outcome = await refreshSessionShared()

      if (cancelled) {
        return
      }

      if (outcome.kind === 'ok') {
        setAuth(outcome.data.accessToken, outcome.data.user)
      } else {
        clearAuth()
      }

      setReady(true)
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [clearAuth, setAuth, setToken])

  if (!ready) {
    return null
  }

  return <>{children}</>
}
