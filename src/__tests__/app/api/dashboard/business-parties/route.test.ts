import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth/middleware', () => ({
  verifyAccessTokenFromRequest: vi.fn()
}))

vi.mock('@/lib/entities/business-parties', () => ({
  getAllVendors: vi.fn()
}))

vi.mock('@/lib/prisma', () => ({
  default: {}
}))

import { GET } from '@/app/api/dashboard/business-parties/route'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { getAllVendors } from '@/lib/parties/business-parties'

const mockAuth = verifyAccessTokenFromRequest as ReturnType<typeof vi.fn>
const mockGetAllVendors = getAllVendors as ReturnType<typeof vi.fn>

describe('GET /api/dashboard/business-parties', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockReturnValue(null)
    const req = new NextRequest('http://localhost/api/dashboard/business-parties')

    const res = await GET(req)

    expect(res.status).toBe(401)
    expect(mockGetAllVendors).not.toHaveBeenCalled()
  })

  it('returns 200 with vendor list', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockGetAllVendors.mockResolvedValue([
      { id: 'SUP-0001', name: 'Acme' }
    ])
    const req = new NextRequest('http://localhost/api/dashboard/business-parties')

    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toEqual([{ id: 'SUP-0001', name: 'Acme' }])
  })
})
