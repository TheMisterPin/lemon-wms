'use client'

import { create } from 'zustand'

import type { AuthUser } from '@/types'

type AuthState = {
  token: string | null
  user: AuthUser | null
  setToken: (token: string) => void
  setAuth: (token: string, user: AuthUser) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setToken: (token) => set((state) => ({ token, user: state.user })),
  setAuth: (token, user) => set({ token, user }),
  clearAuth: () => set({ token: null, user: null })
}))
