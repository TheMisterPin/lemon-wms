/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'
import { logger } from '@/utils/components/logger/client-logger'
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})
// Request interceptor - attach token to all requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken')
    const requestLog = {
      timestamp: new Date().toISOString(),
      type: 'REQUEST',
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      tokenExists: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : null,
      headers: {
        ...config.headers,
        Authorization: token ? 'Bearer [TOKEN]' : undefined
      },
      data: config.data,
      params: config.params
    }
    console.log('[REQUEST]', requestLog)
    logger.info('API Request', requestLog)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('[Axios Interceptor] Authorization header set')
    } else {
      console.log('[Axios Interceptor] No token found, skipping auth header')
      logger.warn('No token found in localStorage', { url: config.url })
    }

    return config
  },
  (error) => {
    logger.error('Axios request interceptor error', { error: error.message })

    return Promise.reject(error)
  }
)
// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => {
    const responseLog = {
      timestamp: new Date().toISOString(),
      type: 'RESPONSE',
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      fullURL: `${response.config.baseURL}${response.config.url}`,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    }
    console.log('[RESPONSE]', responseLog)
    logger.info('API Response', responseLog)

    return response
  },
  (error) => {
    const errorLog = {
      timestamp: new Date().toISOString(),
      type: 'ERROR_RESPONSE',
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      fullURL: error.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      hadAuthHeader: !!error.config?.headers?.Authorization,
      message: error.message
    }
    console.error('[ERROR_RESPONSE]', errorLog)
    logger.error('API Error Response', errorLog)
    if (error.response?.status === 401) {
      // Only remove token and redirect if we actually sent a token
      // This prevents deleting valid tokens on timing issues
      const hadToken = error.config?.headers?.Authorization
      if (hadToken) {
        console.log('[Axios Interceptor] Token was sent but rejected - removing token and redirecting')
        logger.error('Token was rejected by server - removing and redirecting', {
          url: error.config?.url,
          tokenWasSent: true
        })
        localStorage.removeItem('authToken')
        // Redirect to login if not already there
        if (window.location.pathname !== '/') {
          window.location.href = '/'
        }
      } else {
        console.log('[Axios Interceptor] No token was sent with request - not redirecting')
        logger.warn('401 error but no token was sent - not redirecting', {
          url: error.config?.url,
          tokenWasSent: false
        })
      }
    }

    return Promise.reject(error)
  }
)
export default api
/**
 * Universal authenticated API call function
 * Automatically includes the Bearer token from localStorage
 *
 * @example
 * // GET request
 * const users = await authenticatedCall('/user')
 *
 * // POST request
 * const newUser = await authenticatedCall('/user', {
 *   method: 'POST',
 *   data: { name: 'John', email: 'john@example.com', password: '123456' }
 * })
 *
 * // DELETE request
 * await authenticatedCall('/auth/logout', { method: 'DELETE' })
 */
export async function authenticatedCall<T = any>(
  url: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    data?: any
    params?: any
    headers?: Record<string, string>
  }
): Promise<T> {
  const { method = 'GET', data, params, headers } = options || {}
  const token = localStorage.getItem('authToken')
  const config = {
    method,
    url,
    data,
    params,
    headers: {
      ...headers,
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }
  const response = await api.request<T>(config)

  return response.data
}
/**
 * Convenience methods for common HTTP operations
 */
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
