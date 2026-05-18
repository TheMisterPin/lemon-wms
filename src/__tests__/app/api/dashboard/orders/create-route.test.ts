import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth/middleware', () => ({
  verifyAccessTokenFromRequest: vi.fn(),
  isOfficeRole: vi.fn()
}))

vi.mock('@/lib/orders/purchase', () => ({
  createPurchaseOrder: vi.fn()
}))

vi.mock('@/lib/logs/app-logger', () => ({
  logAppError: vi.fn()
}))

import { POST } from '@/app/api/dashboard/orders/[orderType]/create/route'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import { createPurchaseOrder } from '@/lib/orders/purchase'

const mockAuth = verifyAccessTokenFromRequest as ReturnType<typeof vi.fn>
const mockOffice = isOfficeRole as ReturnType<typeof vi.fn>
const mockCreate = createPurchaseOrder as ReturnType<typeof vi.fn>
const mockLogAppError = logAppError as ReturnType<typeof vi.fn>

const validBody = {
  orderNo: 'PO-001',
  businessPartyId: 'SUP-0001',
  warehouseId: 'WH-001',
  lines: [{ itemId: 'item-1', baseQuantity: 1, itemName: 'Bolt' }]
}

function makePost(body: unknown) {
  return new NextRequest('http://localhost/api/dashboard/orders/purchase/create', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' }
  })
}

describe('POST /api/dashboard/orders/[orderType]/create', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockReturnValue(null)
    const res = await POST(makePost(validBody), {
      params: Promise.resolve({ orderType: 'purchase' })
    })
    expect(res.status).toBe(401)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns 403 when not office role', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'WAREHOUSE_WORKER' })
    mockOffice.mockReturnValue(false)
    const res = await POST(makePost(validBody), {
      params: Promise.resolve({ orderType: 'purchase' })
    })
    expect(res.status).toBe(403)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns 400 for unsupported orderType', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockOffice.mockReturnValue(true)
    const res = await POST(makePost(validBody), {
      params: Promise.resolve({ orderType: 'sales' })
    })
    expect(res.status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns 400 when body has no lines', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockOffice.mockReturnValue(true)
    const res = await POST(
      makePost({ ...validBody, lines: [] }),
      { params: Promise.resolve({ orderType: 'purchase' }) }
    )
    expect(res.status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns 400 when JSON body is invalid', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockOffice.mockReturnValue(true)

    const req = new NextRequest('http://localhost/api/dashboard/orders/purchase/create', {
      method: 'POST',
      body: '{',
      headers: { 'content-type': 'application/json' }
    })

    const res = await POST(req, {
      params: Promise.resolve({ orderType: 'purchase' })
    })

    expect(res.status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns domain error status when createPurchaseOrder throws DomainError', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockOffice.mockReturnValue(true)
    mockCreate.mockRejectedValue(new DomainError('Vendor not found.', 'NOT_FOUND', 404))

    const res = await POST(makePost(validBody), {
      params: Promise.resolve({ orderType: 'purchase' })
    })
    const json = await res.json()

    expect(res.status).toBe(404)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('NOT_FOUND')
    expect(json.message).toBe('Vendor not found.')
  })

  it('returns 409 with reference-specific message on unique conflict', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockOffice.mockReturnValue(true)
    mockCreate.mockRejectedValue({ code: 'P2002', meta: { target: ['reference'] } })

    const res = await POST(makePost(validBody), {
      params: Promise.resolve({ orderType: 'purchase' })
    })
    const json = await res.json()

    expect(res.status).toBe(409)
    expect(json.message).toBe('A purchase order with this reference already exists.')
  })

  it('returns 409 with generic conflict message on non-reference unique conflict', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockOffice.mockReturnValue(true)
    mockCreate.mockRejectedValue({ code: 'P2002', meta: { target: ['businessPartyId'] } })

    const res = await POST(makePost(validBody), {
      params: Promise.resolve({ orderType: 'purchase' })
    })
    const json = await res.json()

    expect(res.status).toBe(409)
    expect(json.message).toBe('This record conflicts with an existing row.')
  })

  it('returns 500 and logs unexpected errors', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockOffice.mockReturnValue(true)
    mockCreate.mockRejectedValue(new Error('boom'))

    const res = await POST(makePost(validBody), {
      params: Promise.resolve({ orderType: 'purchase' })
    })
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.message).toBe('Failed to create purchase order.')
    expect(mockLogAppError).toHaveBeenCalledWith(
      '[POST /api/dashboard/orders/[orderType]/create]',
      expect.any(Error)
    )
  })

  it('returns 201 with summary on success', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockOffice.mockReturnValue(true)
    mockCreate.mockResolvedValue({
      id: 'po-1',
      reference: 'PO-001',
      status: 'DRAFT',
      lineCount: 1,
      lines: [{ id: 'ln-1' }]
    })

    const res = await POST(makePost(validBody), {
      params: Promise.resolve({ orderType: 'purchase' })
    })
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.success).toBe(true)
    expect(json.data).toMatchObject({
      id: 'po-1',
      reference: 'PO-001',
      status: 'DRAFT',
      lineCount: 1
    })
    expect(mockCreate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        ...validBody,
        createdById: 'u1'
      })
    )
  })
})
