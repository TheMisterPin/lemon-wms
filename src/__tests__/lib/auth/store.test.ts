/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { AuthDevice, AuthLocation, AuthUser } from '@/types'

const ACCESS_TOKEN_STORAGE_KEY = 'wms_access_token'
const AUTH_SESSION_STORAGE_KEY = 'wms_auth_session'

const officeUser: AuthUser = {
  id: 'user-office-1',
  email: 'owner@lemon-wms.local',
  role: 'OWNER',
  badgeNumber: 'USR-0001'
}

const warehouseLocation: AuthLocation = {
  warehouseId: 'warehouse-1',
  zoneId: 'zone-1'
}

const warehouseDevice: AuthDevice = {
  id: 'device-1',
  name: 'Dock Scanner',
  code: 'DEV-001'
}

const importStore = async () => import('@/lib/auth/store')

beforeEach(() => {
  window.localStorage.clear()
  window.sessionStorage.clear()
  vi.resetModules()
})

describe('auth store', () => {
  it('rehydrates token and auth context from browser storage', async () => {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, 'persisted-token')
    window.sessionStorage.setItem(
      AUTH_SESSION_STORAGE_KEY,
      JSON.stringify({
        user: officeUser,
        location: warehouseLocation,
        device: warehouseDevice
      })
    )

    const { useAuthStore } = await importStore()

    expect(useAuthStore.getState()).toMatchObject({
      token: 'persisted-token',
      user: officeUser,
      location: warehouseLocation,
      device: warehouseDevice
    })
  })

  it('setAuth persists token and session context', async () => {
    const { useAuthStore } = await importStore()

    useAuthStore.getState().setAuth('fresh-token', officeUser, {
      location: warehouseLocation,
      device: warehouseDevice
    })

    expect(window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)).toBe('fresh-token')
    expect(JSON.parse(window.sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY) ?? 'null')).toEqual({
      user: officeUser,
      location: warehouseLocation,
      device: warehouseDevice
    })
    expect(useAuthStore.getState()).toMatchObject({
      token: 'fresh-token',
      user: officeUser,
      location: warehouseLocation,
      device: warehouseDevice
    })
  })

  it('setToken updates only the token and preserves auth context', async () => {
    const { useAuthStore } = await importStore()

    useAuthStore.getState().setAuth('initial-token', officeUser, {
      location: warehouseLocation,
      device: warehouseDevice
    })
    useAuthStore.getState().setToken('rotated-token')

    expect(useAuthStore.getState()).toMatchObject({
      token: 'rotated-token',
      user: officeUser,
      location: warehouseLocation,
      device: warehouseDevice
    })
    expect(window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)).toBe('rotated-token')
    expect(JSON.parse(window.sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY) ?? 'null')).toEqual({
      user: officeUser,
      location: warehouseLocation,
      device: warehouseDevice
    })
  })

  it('clearAuth clears in-memory state and both storage layers', async () => {
    const { useAuthStore } = await importStore()

    useAuthStore.getState().setAuth('initial-token', officeUser, {
      location: warehouseLocation,
      device: warehouseDevice
    })
    useAuthStore.getState().clearAuth()

    expect(useAuthStore.getState()).toMatchObject({
      token: null,
      user: null,
      location: null,
      device: null
    })
    expect(window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)).toBeNull()
    expect(window.sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull()
  })
})