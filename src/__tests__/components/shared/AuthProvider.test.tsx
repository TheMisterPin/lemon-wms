/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import AuthProvider from '@/components/shared/AuthProvider'
import { useAuthStore } from '@/lib/auth/store'
import type { AuthUser } from '@/types'

const officeUser: AuthUser = {
  id: 'user-office-1',
  email: 'owner@lemon-wms.local',
  role: 'OWNER',
  badgeNumber: 'USR-0001'
}

const createAccessToken = (payload: Record<string, unknown>) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')

  return `${header}.${body}.signature`
}

beforeEach(() => {
  window.localStorage.clear()
  window.sessionStorage.clear()
  document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  useAuthStore.getState().clearAuth()
  vi.restoreAllMocks()
})

describe('AuthProvider', () => {
  it('renders immediately when user state is already hydrated', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const token = createAccessToken({
      userId: officeUser.id,
      role: officeUser.role,
      exp: Math.floor(Date.now() / 1000) + 60
    })

    useAuthStore.getState().setAuth(token, officeUser)

    render(
      <AuthProvider>
        <div>ready</div>
      </AuthProvider>
    )

    expect((await screen.findByText('ready')).textContent).toBe('ready')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('refreshes proactively when a valid token exists without hydrated user state', async () => {
    const token = createAccessToken({
      userId: officeUser.id,
      role: officeUser.role,
      exp: Math.floor(Date.now() / 1000) + 60
    })

    window.localStorage.setItem('wms_access_token', token)

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        accessToken: 'refreshed-token',
        user: officeUser
      })
    } as Response)

    render(
      <AuthProvider>
        <div>ready</div>
      </AuthProvider>
    )

    expect((await screen.findByText('ready')).textContent).toBe('ready')

    await waitFor(() => {
      expect(useAuthStore.getState()).toMatchObject({
        token: 'refreshed-token',
        user: officeUser
      })
    })
  })
})