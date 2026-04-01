'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'

import { useAuthStore } from '@/lib/auth/store'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Track in-flight refresh to avoid concurrent refresh calls
let refreshPromise: Promise<string | null> | null = null

async function attemptTokenRefresh(): Promise<string | null> {
  try {
    const res = await axios.post('/api/auth/refresh')
    const { accessToken, user } = res.data

    if (accessToken && user) {
      useAuthStore.getState().setAuth(accessToken, user)
      return accessToken
    }

    return null
  } catch {
    return null
  }
}

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

// Response interceptor — attempt refresh on 401, then retry original request
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Only attempt refresh once per request, and only if we had a token
    if (
      error.response?.status === 401 &&
      !originalRequest._retried &&
      originalRequest?.headers?.Authorization
    ) {
      originalRequest._retried = true

      // Deduplicate concurrent refresh attempts
      if (!refreshPromise) {
        refreshPromise = attemptTokenRefresh().finally(() => {
          refreshPromise = null
        })
      }

      const newToken = await refreshPromise

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      }

      // Refresh failed — clear auth and redirect
      useAuthStore.getState().clearAuth()
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login'
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
