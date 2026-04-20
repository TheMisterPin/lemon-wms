/**
 * @vitest-environment jsdom
 */
import { act } from 'react'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useAuth } from '@/hooks/auth/use-auth'
import { useAuthStore } from '@/lib/auth/store'
import type { AuthDevice, AuthLocation, AuthUser } from '@/types'

const officeUser: AuthUser = {
  id: 'user-office-1',
  email: 'owner@lemon-wms.local',
  fullName: 'Owner User',
  role: 'OWNER',
  badgeNumber: 'USR-0001'
}

const warehouseUser: AuthUser = {
  id: 'user-floor-1',
  email: null,
  fullName: 'Floor Worker',
  role: 'WAREHOUSE_WORKER',
  badgeNumber: 'USR-0005'
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

beforeEach(() => {
  window.localStorage.clear()
  window.sessionStorage.clear()
  useAuthStore.getState().clearAuth()
})

describe('useAuth', () => {
  it('returns the dashboard slice for office roles', () => {
    act(() => {
      useAuthStore.getState().setAuth('office-token', officeUser)
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.user).toEqual(officeUser)
    expect(result.current.dashboard).toEqual({ user: officeUser })
    expect(result.current.warehouse).toBeNull()
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isOfficeRole).toBe(true)
    expect(result.current.isFloorRole).toBe(false)
    expect(result.current.isHydrating).toBe(false)
  })

  it('returns the warehouse slice for floor roles', () => {
    act(() => {
      useAuthStore.getState().setAuth('floor-token', warehouseUser, {
        location: warehouseLocation,
        device: warehouseDevice
      })
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.user).toEqual(warehouseUser)
    expect(result.current.dashboard).toBeNull()
    expect(result.current.warehouse).toEqual({
      user: warehouseUser,
      location: warehouseLocation,
      device: warehouseDevice
    })
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isOfficeRole).toBe(false)
    expect(result.current.isFloorRole).toBe(true)
    expect(result.current.isHydrating).toBe(false)
  })

  it('reports loading while a token exists but the user has not been hydrated', () => {
    act(() => {
      useAuthStore.setState({
        token: 'pending-token',
        user: null,
        location: null,
        device: null
      })
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isHydrating).toBe(true)
    expect(result.current.dashboard).toBeNull()
    expect(result.current.warehouse).toBeNull()
  })
})
