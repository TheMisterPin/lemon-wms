import { beforeAll, afterAll, vi } from 'vitest'

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-for-unit-tests-at-least-32-chars'
  process.env.JWT_ACCESS_EXPIRY = '15m'
  process.env.JWT_REFRESH_EXPIRY = '7d'
  vi.stubEnv('NODE_ENV', 'test')
})

afterAll(() => {
  vi.restoreAllMocks()
})
