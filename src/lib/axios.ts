'use client'

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'

import { useAuthStore } from '@/lib/auth/store'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor — attach Bearer token from Zustand auth store
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401 by clearing auth state
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = !!error.config?.headers?.Authorization

      if (hadToken) {
        useAuthStore.getState().clearAuth()

        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

export default api

/**
 * Make an authenticated API request using the Zustand auth store token.
 */
export async function authenticatedCall<T = any>(
  url: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    data?: any
    params?: any
    headers?: Record<string, string>
  }
): Promise<T> {
  const { method = 'GET', data, params, headers } = options ?? {}
  const token = useAuthStore.getState().token

  const response = await api.request<T>({
    method,
    url,
    data,
    params,
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  })

  return response.data
}

/** Typed convenience wrappers around authenticatedCall */
export const apiClient = {
  get: <T = any>(url: string, params?: any) =>
    authenticatedCall<T>(url, { method: 'GET', params }),

  post: <T = any>(url: string, data?: any) =>
    authenticatedCall<T>(url, { method: 'POST', data }),

  put: <T = any>(url: string, data?: any) =>
    authenticatedCall<T>(url, { method: 'PUT', data }),

  patch: <T = any>(url: string, data?: any) =>
    authenticatedCall<T>(url, { method: 'PATCH', data }),

  delete: <T = any>(url: string, data?: any) =>
    authenticatedCall<T>(url, { method: 'DELETE', data })
}
