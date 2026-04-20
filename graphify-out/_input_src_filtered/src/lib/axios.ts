'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type InternalAxiosRequestConfig } from 'axios'

import { readStoredAccessToken, useAuthStore } from '@/lib/auth/store'

type RetriableAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retried?: boolean
}

type ApiClientKind = 'shared' | 'dashboard' | 'warehouse'

/**
 * createApiInstance.
 * @returns Result from createApiInstance.
 */
const createApiInstance = () => axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

const sharedApi = createApiInstance()
const dashboardApi = createApiInstance()
const warehouseApi = createApiInstance()

// Track in-flight refresh to avoid concurrent refresh calls
let refreshPromise: Promise<string | null> | null = null

/**
 * shouldAttemptRefresh.
 * @param error - Parameter for shouldAttemptRefresh.
 * @returns Result from shouldAttemptRefresh.
 */
function shouldAttemptRefresh(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false
  }

  const originalRequest = error.config as RetriableAxiosRequestConfig | undefined
  const requestUrl = originalRequest?.url ?? ''

  if (!originalRequest || originalRequest._retried) {
    return false
  }

  if (error.response?.status !== 401) {
    return false
  }

  return !requestUrl.includes('/auth/refresh')
}

/**
 * attemptTokenRefresh.
 * @returns Result from attemptTokenRefresh.
 */
async function attemptTokenRefresh(): Promise<string | null> {
  try {
    const res = await axios.post('/api/auth/refresh')
    const { accessToken, user } = res.data

    if (accessToken && user) {
      const { setAuth, location, device } = useAuthStore.getState()

      // TODO: The conditional here means office users (location/device both null)
      // call setAuth(token, user) with no third argument. In store.setAuth, that
      // defaults context to undefined, which resets location and device to null.
      // That is harmless for office users but creates a hidden dependency: if the
      // branch logic ever changes, floor context could be silently zeroed.
      // Always pass context explicitly to make intent clear:
      //   setAuth(accessToken, user, { location: location ?? undefined, device: device ?? undefined })
      if (location || device) {
        setAuth(accessToken, user, {
          location: location ?? undefined,
          device: device ?? undefined
        })
      } else {
        setAuth(accessToken, user)
      }

      return accessToken
    }

    return null
  } catch {
    return null
  }
}

function withAuthHeaders(
  config: InternalAxiosRequestConfig,
  kind: ApiClientKind
): InternalAxiosRequestConfig {
  const { token, user, location, device } = useAuthStore.getState()
  const accessToken = token ?? readStoredAccessToken()
  const nextHeaders = config.headers ?? {}

  if (accessToken) {
    nextHeaders.Authorization = `Bearer ${accessToken}`
  }

  if (kind === 'dashboard' || kind === 'warehouse') {
    if (user?.id) {
      nextHeaders['x-user-id'] = user.id
    }
    if (user?.role) {
      nextHeaders['x-user-role'] = user.role
    }
  }

  if (kind === 'warehouse') {
    if (location?.warehouseId) {
      nextHeaders['x-warehouse-id'] = location.warehouseId
    }
    if (location?.zoneId) {
      nextHeaders['x-zone-id'] = location.zoneId
    }
    if (device?.id) {
      nextHeaders['x-device-id'] = device.id
    }
  }

  config.headers = nextHeaders

  return config
}

/**
 * attachInterceptors.
 * @param instance - Parameter for attachInterceptors.
 * @param kind - Parameter for attachInterceptors.
 * @returns Result from attachInterceptors.
 */
function attachInterceptors(instance: ReturnType<typeof createApiInstance>, kind: ApiClientKind) {
  instance.interceptors.request.use(
    (config) => withAuthHeaders(config, kind),
    (error) => Promise.reject(error)
  )

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (!shouldAttemptRefresh(error)) {
        return Promise.reject(error)
      }

      const originalRequest = error.config as RetriableAxiosRequestConfig
      originalRequest._retried = true

      if (!refreshPromise) {
        refreshPromise = attemptTokenRefresh().finally(() => {
          refreshPromise = null
        })
      }

      const newToken = await refreshPromise

      if (newToken) {
        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${newToken}`

        return instance(originalRequest)
      }

      useAuthStore.getState().clearAuth()
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login'
      }

      return Promise.reject(error)
    }
  )
}

attachInterceptors(sharedApi, 'shared')
attachInterceptors(dashboardApi, 'dashboard')
attachInterceptors(warehouseApi, 'warehouse')

export default sharedApi

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

  const response = await sharedApi.request<T>({
    method,
    url,
    data,
    params,
    headers
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

/**
 * createTypedClient.
 * @param instance - Parameter for createTypedClient.
 * @returns Result from createTypedClient.
 */
function createTypedClient(instance: typeof sharedApi) {
  return {
    get: <T = any>(url: string, params?: any) =>
      instance.request<T>({ method: 'GET', url, params }).then((response) => response.data),
    post: <T = any>(url: string, data?: any) =>
      instance.request<T>({ method: 'POST', url, data }).then((response) => response.data),
    put: <T = any>(url: string, data?: any) =>
      instance.request<T>({ method: 'PUT', url, data }).then((response) => response.data),
    patch: <T = any>(url: string, data?: any) =>
      instance.request<T>({ method: 'PATCH', url, data }).then((response) => response.data),
    delete: <T = any>(url: string, data?: any) =>
      instance.request<T>({ method: 'DELETE', url, data }).then((response) => response.data)
  }
}

export const dashboardApiClient = createTypedClient(dashboardApi)
export const warehouseApiClient = createTypedClient(warehouseApi)
