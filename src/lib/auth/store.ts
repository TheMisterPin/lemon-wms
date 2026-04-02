'use client'

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
  setToken: (token: string) => void
  setAuth: (token: string, user: AuthUser) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: readStoredAccessToken(),
  user: null,
  setToken: (token) => {
    writeStoredAccessToken(token)
    set((state) => ({ token, user: state.user }))
  },
  setAuth: (token, user) => {
    writeStoredAccessToken(token)
    set({ token, user })
  },
  clearAuth: () => {
    writeStoredAccessToken(null)
    set({ token: null, user: null })
  }
}))
