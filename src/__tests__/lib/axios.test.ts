/**
 * @vitest-environment jsdom
 */
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Mock Zustand auth store
// ---------------------------------------------------------------------------
const mockStore = {
  token: null as string | null,
  user: null as Record<string, unknown> | null,
  setAuth: vi.fn((token: string, user: Record<string, unknown>) => {
    mockStore.token = token
    mockStore.user = user
  }),
  clearAuth: vi.fn(() => {
    mockStore.token = null
    mockStore.user = null
  })
}

vi.mock('@/lib/auth/store', () => ({
  readStoredAccessToken: () => mockStore.token,
  useAuthStore: {
    getState: () => mockStore
  }
}))

// ---------------------------------------------------------------------------
// Import the module under test AFTER mocks are in place
// ---------------------------------------------------------------------------
import api from '@/lib/axios'

// ---------------------------------------------------------------------------
// We need a separate mock adapter for the raw axios instance used by
// attemptTokenRefresh (it calls axios.post, not api.post)
// ---------------------------------------------------------------------------
let mockApi: MockAdapter
let mockRawAxios: MockAdapter

beforeEach(() => {
  mockApi = new MockAdapter(api)
  mockRawAxios = new MockAdapter(axios)
  mockStore.token = 'valid-token'
  mockStore.user = { id: 'u1', role: 'OWNER' }
  mockStore.setAuth.mockClear()
  mockStore.clearAuth.mockClear()
})

afterEach(() => {
  mockApi.restore()
  mockRawAxios.restore()
})

// ---------------------------------------------------------------------------
// Request interceptor — attaches Bearer token
// ---------------------------------------------------------------------------

describe('axios request interceptor', () => {
  it('attaches Authorization header when store has a token', async () => {
    mockStore.token = 'my-token'
    mockApi.onGet('/test').reply(200, { ok: true })

    const res = await api.get('/test')
    expect(res.config.headers.Authorization).toBe('Bearer my-token')
  })

  it('does not attach Authorization header when store has no token', async () => {
    mockStore.token = null
    mockApi.onGet('/test').reply(200, { ok: true })

    const res = await api.get('/test')
    expect(res.config.headers.Authorization).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Response interceptor — refresh on 401
// ---------------------------------------------------------------------------

describe('axios 401 refresh interceptor', () => {
  it('attempts token refresh on 401 and retries the original request', async () => {
    // First call returns 401, second (retry) returns 200
    let callCount = 0
    mockApi.onGet('/protected').reply(() => {
      callCount++
      if (callCount === 1) {
        return [401, { error: 'Unauthorized' }]
      }

      return [200, { data: 'success' }]
    })

    // Refresh endpoint returns a new token
    mockRawAxios.onPost('/api/auth/refresh').reply(200, {
      accessToken: 'new-token',
      user: { id: 'u1', role: 'OWNER', email: 'test@test.com', badgeNumber: 'USR-0001' }
    })

    const res = await api.get('/protected')

    expect(res.status).toBe(200)
    expect(res.data).toEqual({ data: 'success' })
    expect(mockStore.setAuth).toHaveBeenCalledWith('new-token', expect.objectContaining({ id: 'u1' }))
  })

  it('redirects to /login when refresh also fails', async () => {
    mockApi.onGet('/protected').reply(401, { error: 'Unauthorized' })
    mockRawAxios.onPost('/api/auth/refresh').reply(401, { error: 'Invalid refresh token' })

    // Mock window.location
    const originalLocation = window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, pathname: '/dashboard', href: '' }
    })

    await expect(api.get('/protected')).rejects.toThrow()
    expect(mockStore.clearAuth).toHaveBeenCalled()

    // Restore
    Object.defineProperty(window, 'location', { writable: true, value: originalLocation })
  })

  it('attempts refresh even when there was no Authorization header', async () => {
    mockStore.token = null
    mockApi.onGet('/public').reply(401, { error: 'Unauthorized' })

    mockRawAxios.onPost('/api/auth/refresh').reply(401, { error: 'Invalid refresh token' })

    await expect(api.get('/public')).rejects.toThrow()
    expect(mockRawAxios.history.post.length).toBe(1)
    expect(mockStore.clearAuth).toHaveBeenCalled()
  })

  it('refreshes and retries even when the original request had no Authorization header', async () => {
    mockStore.token = null

    let callCount = 0
    mockApi.onGet('/cookie-backed').reply(() => {
      callCount++
      if (callCount === 1) {
        return [401, { error: 'Unauthorized' }]
      }

      return [200, { data: 'success' }]
    })

    mockRawAxios.onPost('/api/auth/refresh').reply(200, {
      accessToken: 'new-token',
      user: { id: 'u1', role: 'OWNER', email: 'test@test.com', badgeNumber: 'USR-0001' }
    })

    const res = await api.get('/cookie-backed')

    expect(res.status).toBe(200)
    expect(res.data).toEqual({ data: 'success' })
    expect(mockStore.setAuth).toHaveBeenCalledWith('new-token', expect.objectContaining({ id: 'u1' }))
  })

  it('does not retry more than once per request', async () => {
    // Always return 401 — even after refresh
    mockApi.onGet('/always-401').reply(401, { error: 'Unauthorized' })

    mockRawAxios.onPost('/api/auth/refresh').reply(200, {
      accessToken: 'new-token',
      user: { id: 'u1', role: 'OWNER', email: 'test@test.com', badgeNumber: 'USR-0001' }
    })

    // Mock window.location to prevent actual navigation
    const originalLocation = window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, pathname: '/dashboard', href: '' }
    })

    await expect(api.get('/always-401')).rejects.toThrow()

    // Should have called refresh only once (not an infinite loop)
    expect(mockRawAxios.history.post.length).toBe(1)

    Object.defineProperty(window, 'location', { writable: true, value: originalLocation })
  })

  it('deduplicates concurrent refresh attempts', async () => {
    const callCounts = { a: 0, b: 0 }

    mockApi.onGet('/route-a').reply(() => {
      callCounts.a++
      if (callCounts.a === 1) {
        return [401, { error: 'Unauthorized' }]
      }

      return [200, { route: 'a' }]
    })

    mockApi.onGet('/route-b').reply(() => {
      callCounts.b++
      if (callCounts.b === 1) {
        return [401, { error: 'Unauthorized' }]
      }

      return [200, { route: 'b' }]
    })

    mockRawAxios.onPost('/api/auth/refresh').reply(200, {
      accessToken: 'new-token',
      user: { id: 'u1', role: 'OWNER', email: 'test@test.com', badgeNumber: 'USR-0001' }
    })

    const [resA, resB] = await Promise.all([api.get('/route-a'), api.get('/route-b')])

    expect(resA.data).toEqual({ route: 'a' })
    expect(resB.data).toEqual({ route: 'b' })

    // Only one refresh call despite two concurrent 401s
    expect(mockRawAxios.history.post.length).toBe(1)
  })
})
