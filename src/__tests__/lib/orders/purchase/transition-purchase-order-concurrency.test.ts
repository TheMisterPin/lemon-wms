import { describe, expect, it } from 'vitest'

import type { PrismaClient } from '@/generated/prisma'
import { AssignmentLifecycle, OrderStatus } from '@/generated/prisma'
import { startPurchaseOrder } from '@/lib/orders/purchase/transition-purchase-order'

/**
 * Stateful fake Prisma client for a single PurchaseOrder row plus its
 * OrderAssignment rows. Every mutating method checks-and-writes the shared
 * `poState`/`assignments` synchronously (no `await` before the write), so two
 * concurrent calls started via Promise.all interleave at the same points a
 * real Postgres transaction boundary would: whichever call's `updateMany`
 * microtask runs first commits the status flip, and the other's guarded
 * `where.status` check — evaluated against the *current* shared state, not a
 * value captured earlier — correctly loses the race.
 */
function createStatefulPurchaseOrderDb(warehouseId: string) {
  let po = {
    id: 'po-1',
    reference: 'PO-0001',
    status: OrderStatus.RELEASED as OrderStatus,
    deletedAt: null as Date | null,
    warehouseId
  }
  const assignments = new Map<string, { id: string; status: AssignmentLifecycle }>()

  const tx = {
    purchaseOrder: {
      updateMany: ({ where, data }: { where: { status: OrderStatus }; data: { status: OrderStatus } }) => {
        if (po.status === where.status && !po.deletedAt) {
          po = { ...po, ...data }

          return Promise.resolve({ count: 1 })
        }

        return Promise.resolve({ count: 0 })
      }
    },
    userActivityEntry: {
      create: () => Promise.resolve({ id: 'uae-1' })
    },
    orderAssignment: {
      findFirst: ({ where }: { where: { userId: string } }) =>
        Promise.resolve(assignments.get(where.userId) ?? null),
      update: ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        for (const row of assignments.values()) {
          if (row.id === where.id) {
            Object.assign(row, data)

            return Promise.resolve(row)
          }
        }

        return Promise.reject(new Error('assignment not found'))
      },
      create: ({ data }: { data: { userId: string } }) => {
        const row = { id: `asg-${data.userId}`, status: AssignmentLifecycle.STARTED }
        assignments.set(data.userId, row)

        return Promise.resolve(row)
      }
    }
  }

  const prisma = {
    purchaseOrder: {
      findFirst: () => Promise.resolve(po.deletedAt ? null : { ...po })
    },
    $transaction: (cb: (tx: unknown) => Promise<unknown>) => cb(tx)
  }

  return { prisma: prisma as unknown as PrismaClient, getStatus: () => po.status, assignments }
}

describe('startPurchaseOrder concurrency (competing floor users)', () => {
  it('lets exactly one of two floor users win the RELEASED -> EXECUTING transition', async () => {
    const warehouseId = 'wh-1'
    const { prisma, getStatus, assignments } = createStatefulPurchaseOrderDb(warehouseId)

    const results = await Promise.allSettled([
      startPurchaseOrder(prisma, 'po-1', warehouseId, 'user-a'),
      startPurchaseOrder(prisma, 'po-1', warehouseId, 'user-b')
    ])

    const fulfilled = results.filter((r) => r.status === 'fulfilled')
    const rejected = results.filter((r) => r.status === 'rejected')

    expect(fulfilled).toHaveLength(1)
    expect(rejected).toHaveLength(1)
    expect((rejected[0] as PromiseRejectedResult).reason).toMatchObject({
      code: 'INVALID_TRANSITION',
      status: 409
    })

    // Final state reflects exactly one transition, not a double-apply.
    expect(getStatus()).toBe(OrderStatus.EXECUTING)
    // Only the winning user's assignment was ever created.
    expect(assignments.size).toBe(1)
  })
})
