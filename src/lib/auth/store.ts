'use client'

// TODO: Consider persisting `user`, `location`, and `device` to sessionStorage
// (not localStorage) so the store re-hydrates fully after a page refresh.
// Currently only the access token is persisted; `user` is null until the next
// setAuth call (i.e. after the Axios interceptor triggers a token refresh on
// the first 401). This means useAuth().isAuthenticated is briefly false and
// dashboard/warehouse user-info blocks don't render on hard reload.

// TODO: Move AuthLocation, AuthDevice, and AuthContext to src/types/ alongside
// AuthUser. They are consumed by the hook, the floor login form, and the axios
// interceptor — keeping them in the store creates an import chain that shouldn't
// point to a Zustand module.

import { create } from 'zustand'

import type { AuthUser } from '@/types'

const ACCESS_TOKEN_STORAGE_KEY = 'wms_access_token'

export const readStoredAccessToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

const writeStoredAccessToken = (token: string | null): void => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    if (token) {
      window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
    } else {
      window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
    }
  } catch {
    // Ignore storage failures and keep the in-memory auth state usable.
  }
}

type AuthState = {
  token: string | null
  user: AuthUser | null
  location: AuthLocation | null
  device: AuthDevice | null
  setToken: (token: string) => void
  setAuth: (token: string, user: AuthUser, context?: AuthContext) => void
  clearAuth: () => void
}

export type AuthLocation = {
  warehouseId?: string
  zoneId?: string
}

export type AuthDevice = {
  id: string
  name: string
  code: string
}

export type AuthContext = {
  location?: AuthLocation
  device?: AuthDevice
}

export const useAuthStore = create<AuthState>((set) => ({
  token: readStoredAccessToken(),
  user: null,
  location: null,
  device: null,
  setToken: (token) => {
    writeStoredAccessToken(token)
    // TODO: setToken manually spreads the full state to preserve user/location/device,
    // but Zustand's set() does a shallow merge by default, so spreading is unnecessary.
    // Simplify to: set({ token })
    set((state) => ({
      token,
      user: state.user,
      location: state.location,
      device: state.device
    }))
  },
  setAuth: (token, user, context) => {
    writeStoredAccessToken(token)
    set({
      token,
      user,
      location: context?.location ?? null,
      device: context?.device ?? null
    })
  },
  clearAuth: () => {
    writeStoredAccessToken(null)
    set({ token: null, user: null, location: null, device: null })
  }
}))
