'use client'

import { create } from 'zustand'

import { ACCESS_TOKEN_STORAGE_KEY, AUTH_SESSION_STORAGE_KEY } from '@/lib/auth/constants'
import type { AuthContext, AuthDevice, AuthLocation, AuthUser } from '@/types'

type PersistedAuthSession = {
  user: AuthUser | null
  location: AuthLocation | null
  device: AuthDevice | null
}

const EMPTY_AUTH_SESSION: PersistedAuthSession = {
  user: null,
  location: null,
  device: null
}

/**
 * readStoredAccessToken.
 * @returns Result from readStoredAccessToken.
 */
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

/**
 * writeStoredAccessToken.
 * @param token - Parameter for writeStoredAccessToken.
 * @returns Result from writeStoredAccessToken.
 */
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

/**
 * isAuthUser.
 * @param value - Parameter for isAuthUser.
 * @returns Result from isAuthUser.
 */
const isAuthUser = (value: unknown): value is AuthUser => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<AuthUser>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.role === 'string' &&
    typeof candidate.badgeNumber === 'string' &&
    (candidate.email === undefined || candidate.email === null || typeof candidate.email === 'string')
  )
}

/**
 * isAuthLocation.
 * @param value - Parameter for isAuthLocation.
 * @returns Result from isAuthLocation.
 */
const isAuthLocation = (value: unknown): value is AuthLocation => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<AuthLocation>

  return (
    (candidate.warehouseId === undefined || typeof candidate.warehouseId === 'string') &&
    (candidate.zoneId === undefined || typeof candidate.zoneId === 'string')
  )
}

/**
 * isAuthDevice.
 * @param value - Parameter for isAuthDevice.
 * @returns Result from isAuthDevice.
 */
const isAuthDevice = (value: unknown): value is AuthDevice => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<AuthDevice>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.code === 'string'
  )
}

/**
 * readStoredAuthSession.
 * @returns Result from readStoredAuthSession.
 */
const readStoredAuthSession = (): PersistedAuthSession => {
  if (typeof window === 'undefined') {
    return EMPTY_AUTH_SESSION
  }

  try {
    const raw = window.sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY)
    if (!raw) {
      return EMPTY_AUTH_SESSION
    }

    const parsed = JSON.parse(raw) as {
      user?: unknown
      location?: unknown
      device?: unknown
    }

    return {
      user: isAuthUser(parsed.user) ? parsed.user : null,
      location: isAuthLocation(parsed.location) ? parsed.location : null,
      device: isAuthDevice(parsed.device) ? parsed.device : null
    }
  } catch {
    return EMPTY_AUTH_SESSION
  }
}

/**
 * writeStoredAuthSession.
 * @param session - Parameter for writeStoredAuthSession.
 * @returns Result from writeStoredAuthSession.
 */
const writeStoredAuthSession = (session: PersistedAuthSession | null): void => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    if (session && session.user) {
      window.sessionStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session))
    } else {
      window.sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
    }
  } catch {
    // Ignore storage failures and keep the in-memory auth state usable.
  }
}

/**
 * readInitialAuthState.
 * @returns Result from readInitialAuthState.
 */
const readInitialAuthState = (): PersistedAuthSession & { token: string | null } => {
  const token = readStoredAccessToken()
  if (!token) {
    writeStoredAuthSession(null)

    return {
      token: null,
      ...EMPTY_AUTH_SESSION
    }
  }

  return {
    token,
    ...readStoredAuthSession()
  }
}

export type AuthStoreState = {
  token: string | null
  user: AuthUser | null
  location: AuthLocation | null
  device: AuthDevice | null
  setToken: (token: string) => void
  setAuth: (token: string, user: AuthUser, context?: AuthContext) => void
  clearAuth: () => void
}

const initialState = readInitialAuthState()

export const useAuthStore = create<AuthStoreState>((set) => ({
  token: initialState.token,
  user: initialState.user,
  location: initialState.location,
  device: initialState.device,
  setToken: (token) => {
    writeStoredAccessToken(token)
    set({ token })
  },
  setAuth: (token, user, context) => {
    const session = {
      user,
      location: context?.location ?? null,
      device: context?.device ?? null
    }

    writeStoredAccessToken(token)
    writeStoredAuthSession(session)
    set({
      token,
      ...session
    })
  },
  clearAuth: () => {
    writeStoredAccessToken(null)
    writeStoredAuthSession(null)
    set({ token: null, user: null, location: null, device: null })
  }
}))
