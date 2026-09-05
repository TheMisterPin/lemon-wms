import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Stateful fake Prisma client for the receipt-line-handle route's own direct
 * table access (receipt line lookup, destination bin/item lookup, the
 * OPEN -> IN_PROGRESS bump, the ledger entry, and the idempotency store).
 * The business-logic functions the route calls out to
 * (`confirmPurchaseReceiptLineHandledInTx`, `upsertAvailableStockItem`,
 * `updateBinCapacityBy`) are mocked as spies below — their own correctness is
 * covered by dedicated unit/concurrency tests elsewhere; what this test
 * proves is that a duplicate scan (two concurrent identical requests, same
 * Idempotency-Key) reaches that business logic exactly once.
 */
const state = vi.hoisted(() => ({
  receiptStatus: 'OPEN' as 'OPEN' | 'IN_PROGRESS',
  idempotencyStore: new Map<
    string,
    {
      id: string
      requestHash: string
      status: 'PENDING' | 'SUCCEEDED' | 'FAILED'
      responseStatus: number | null
      responseBody: unknown
    }
  >(),
  idSeq: 0,
  reset() {
    this.receiptStatus = 'OPEN'
    this.idempotencyStore.clear()
    this.idSeq = 0
  }
}))

vi.mock('@/lib/auth/middleware', () => ({
  verifyAccessTokenFromRequest: vi.fn(),
  isFloorRole: vi.fn()
}))

vi.mock('@/lib/orders/purchase/receipt/receipt-order-mutations', () => ({
  confirmPurchaseReceiptLineHandledInTx: vi.fn()
}))

vi.mock('@/lib/stock/stock-mutations', () => ({
  upsertAvailableStockItem: vi.fn(),
  updateBinCapacityBy: vi.fn()
}))

vi.mock('@/lib/prisma', async () => {
  const { Prisma } = await import('@/generated/prisma')

  const prisma = {
    purchaseOrderReceiptLine: {
      findUnique: () =>
        Promise.resolve({
          purchaseOrderLineId: 'pol-1',
          itemId: 'item-1',
          uom: 'EA',
          itemNameSnapshot: 'Widget',
          receiptLine: {
            id: 'rl-header-1',
            warehouseId: 'wh-1',
            purchaseOrderId: 'po-1',
            status: state.receiptStatus
          }
        })
    },
    bin: {
      findUnique: () => Promise.resolve({ zoneId: 'zone-1' })
    },
    item: {
      findUnique: () => Promise.resolve({ sku: 'SKU-1' })
    },
    purchaseOrderReceipt: {
      updateMany: () => {
        state.receiptStatus = 'IN_PROGRESS'

        return Promise.resolve({ count: 1 })
      },
      findUnique: () => Promise.resolve({ status: state.receiptStatus })
    },
    itemLedgerEntry: {
      create: () => Promise.resolve({ id: 'ile-1' })
    },
    $transaction: (cb: (tx: unknown) => Promise<unknown>) => cb(prisma),
    idempotencyRecord: {
      create: ({
        data
      }: {
        data: { scope: string; idempotencyKey: string; requestHash: string; userId?: string }
      }) => {
        const key = `${data.scope}::${data.idempotencyKey}`
        if (state.idempotencyStore.has(key)) {
          return Promise.reject(
            new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
              code: 'P2002',
              clientVersion: 'test'
            })
          )
        }
        state.idSeq += 1
        const row = {
          id: `idem-${state.idSeq}`,
          requestHash: data.requestHash,
          status: 'PENDING' as const,
          responseStatus: null,
          responseBody: null
        }
        state.idempotencyStore.set(key, row)

        return Promise.resolve(row)
      },
      findUniqueOrThrow: ({
        where
      }: {
        where: { scope_idempotencyKey: { scope: string; idempotencyKey: string } }
      }) => {
        const key = `${where.scope_idempotencyKey.scope}::${where.scope_idempotencyKey.idempotencyKey}`
        const row = state.idempotencyStore.get(key)

        return row ? Promise.resolve(row) : Promise.reject(new Error('not found'))
      },
      update: ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        for (const row of state.idempotencyStore.values()) {
          if (row.id === where.id) {
            Object.assign(row, data)

            return Promise.resolve(row)
          }
        }

        return Promise.reject(new Error('not found'))
      },
      delete: ({ where }: { where: { id: string } }) => {
        for (const [key, row] of state.idempotencyStore) {
          if (row.id === where.id) {
            state.idempotencyStore.delete(key)

            return Promise.resolve(row)
          }
        }

        return Promise.reject(new Error('not found'))
      }
    }
  }

  return { default: prisma }
})

import { POST } from '@/app/api/warehouse/orders/[orderType]/[id]/receipt/[receiptId]/lines/[lineId]/handle/route'
import { verifyAccessTokenFromRequest, isFloorRole } from '@/lib/auth/middleware'
import { confirmPurchaseReceiptLineHandledInTx } from '@/lib/orders/purchase/receipt/receipt-order-mutations'
import { updateBinCapacityBy, upsertAvailableStockItem } from '@/lib/stock/stock-mutations'

const mockAuth = verifyAccessTokenFromRequest as ReturnType<typeof vi.fn>
const mockFloor = isFloorRole as ReturnType<typeof vi.fn>
const mockConfirm = confirmPurchaseReceiptLineHandledInTx as ReturnType<typeof vi.fn>
const mockUpsertStock = upsertAvailableStockItem as ReturnType<typeof vi.fn>
const mockUpdateCapacity = updateBinCapacityBy as ReturnType<typeof vi.fn>

const floorUser = { userId: 'u1', role: 'WAREHOUSE_WORKER', warehouseId: 'wh-1' }

function makeRequest(idempotencyKey: string) {
  return new NextRequest(
    'http://localhost/api/warehouse/orders/purchase/po-1/receipt/rec-1/lines/rl-1/handle',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify({
        quantity: 5,
        disposition: 'ACCEPTED',
        orderAssignmentId: 'asg-1',
        toBinId: 'bin-dest'
      })
    }
  )
}

function callRoute(idempotencyKey: string) {
  return POST(makeRequest(idempotencyKey), {
    params: Promise.resolve({ orderType: 'purchase', id: 'po-1', receiptId: 'rec-1', lineId: 'rl-1' })
  })
}

describe('POST receipt-line handle — duplicate scan', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    state.reset()
    mockAuth.mockReturnValue(floorUser)
    mockFloor.mockReturnValue(true)
    mockConfirm.mockResolvedValue({ orderExecutionActivityId: 'oea-1', binOperationEntryId: 'boe-1' })
    mockUpsertStock.mockResolvedValue({ id: 'bsi-1' })
    mockUpdateCapacity.mockResolvedValue(undefined)
  })

  it('applies the business effect exactly once for two concurrent requests with the same Idempotency-Key', async () => {
    const [resA, resB] = await Promise.all([callRoute('scan-key-1'), callRoute('scan-key-1')])

    const statuses = [resA.status, resB.status].sort()
    // Exactly one request actually runs; the other is turned away as a
    // duplicate-in-flight attempt rather than being allowed to re-run the
    // mutation (which is what would double-credit stock).
    expect(statuses).toEqual([200, 409])

    const rejected = resA.status === 409 ? resA : resB
    const rejectedBody = await rejected.json()
    expect(rejectedBody.error?.code).toBe('IDEMPOTENCY_IN_PROGRESS')

    expect(mockConfirm).toHaveBeenCalledTimes(1)
    expect(mockUpsertStock).toHaveBeenCalledTimes(1)
    expect(mockUpdateCapacity).toHaveBeenCalledTimes(1)
  })

  it('lets two requests with different Idempotency-Keys both proceed', async () => {
    const [resA, resB] = await Promise.all([callRoute('scan-key-a'), callRoute('scan-key-b')])

    expect(resA.status).toBe(200)
    expect(resB.status).toBe(200)
    expect(mockConfirm).toHaveBeenCalledTimes(2)
  })
})
