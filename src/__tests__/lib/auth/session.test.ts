import { describe, expect, it, vi } from 'vitest'

// session.ts imports prisma at the top level — mock it so tests run without a DB
vi.mock('@/lib/prisma', () => ({
  default: {
    refreshToken: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}))

// next/headers is a Next.js runtime module — mock it for the Node test environment
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    set: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  }),
}))

import { createDeviceLabel } from '@/lib/auth/session'

// createDeviceLabel is the only pure function in session.ts — the rest
// require a live Next.js request context (cookies()) or a database, and
// are covered indirectly through the API-route integration tests.

describe('createDeviceLabel', () => {
  it('returns a 12-character hex string for a normal user-agent', () => {
    const label = createDeviceLabel(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    )
    expect(label).toHaveLength(12)
    expect(label).toMatch(/^[0-9a-f]+$/)
  })

  it('returns "unknown-device" when user-agent is null', () => {
    expect(createDeviceLabel(null)).toBe('unknown-device')
  })

  it('produces a deterministic value for the same input', () => {
    const ua = 'TestAgent/1.0'
    expect(createDeviceLabel(ua)).toBe(createDeviceLabel(ua))
  })

  it('produces different values for different user-agents', () => {
    const a = createDeviceLabel('AgentA/1.0')
    const b = createDeviceLabel('AgentB/2.0')
    expect(a).not.toBe(b)
  })
})
