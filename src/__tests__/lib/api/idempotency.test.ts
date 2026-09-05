import { describe, expect, it } from 'vitest'

import { Prisma, type PrismaClient } from '@/generated/prisma'
import {
  beginIdempotentAttempt,
  computeRequestHash,
  finalizeIdempotentAttempt
} from '@/lib/api/idempotency'

type FakeRecord = {
  id: string
  scope: string
  idempotencyKey: string
  requestHash: string
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED'
  responseStatus: number | null
  responseBody: unknown
}

/**
 * Stateful fake for `idempotencyRecord` backed by a plain Map. `create` performs
 * its existence-check-then-insert synchronously (no `await` before the write),
 * so two concurrent calls via Promise.all genuinely race the same way two
 * concurrent `INSERT ... ON CONFLICT` statements would against a real unique
 * index: whichever microtask runs first wins the slot, the other observes the
 * committed row and throws P2002 — this is what makes the interleaving test
 * below a real proof rather than a tautology.
 */
function createFakeIdempotencyDb() {
  const store = new Map<string, FakeRecord>()
  let seq = 0

  const db = {
    idempotencyRecord: {
      create: ({ data }: { data: { scope: string; idempotencyKey: string; requestHash: string } }) => {
        const key = `${data.scope}::${data.idempotencyKey}`
        if (store.has(key)) {
          return Promise.reject(
            new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
              code: 'P2002',
              clientVersion: 'test'
            })
          )
        }
        seq += 1
        const row: FakeRecord = {
          id: `rec-${seq}`,
          scope: data.scope,
          idempotencyKey: data.idempotencyKey,
          requestHash: data.requestHash,
          status: 'PENDING',
          responseStatus: null,
          responseBody: null
        }
        store.set(key, row)

        return Promise.resolve(row)
      },
      findUniqueOrThrow: ({
        where
      }: {
        where: { scope_idempotencyKey: { scope: string; idempotencyKey: string } }
      }) => {
        const key = `${where.scope_idempotencyKey.scope}::${where.scope_idempotencyKey.idempotencyKey}`
        const row = store.get(key)
        if (!row) {
          return Promise.reject(new Error('Record not found'))
        }

        return Promise.resolve(row)
      },
      update: ({ where, data }: { where: { id: string }; data: Partial<FakeRecord> }) => {
        for (const row of store.values()) {
          if (row.id === where.id) {
            Object.assign(row, data)

            return Promise.resolve(row)
          }
        }

        return Promise.reject(new Error('Record not found'))
      },
      delete: ({ where }: { where: { id: string } }) => {
        for (const [key, row] of store) {
          if (row.id === where.id) {
            store.delete(key)

            return Promise.resolve(row)
          }
        }

        return Promise.reject(new Error('Record not found'))
      }
    }
  }

  return { db: db as unknown as PrismaClient, store }
}

describe('computeRequestHash', () => {
  it('is independent of key order', () => {
    const a = computeRequestHash({ quantity: 5, disposition: 'ACCEPTED' })
    const b = computeRequestHash({ disposition: 'ACCEPTED', quantity: 5 })
    expect(a).toBe(b)
  })

  it('differs when the payload differs', () => {
    const a = computeRequestHash({ quantity: 5 })
    const b = computeRequestHash({ quantity: 6 })
    expect(a).not.toBe(b)
  })
})

describe('beginIdempotentAttempt concurrency', () => {
  it('lets exactly one of two concurrent identical attempts proceed, the other observes in-progress', async () => {
    const { db } = createFakeIdempotencyDb()
    const args = { scope: 'receipt-line:handle:r1:l1', idempotencyKey: 'key-1', requestHash: 'hash-a' }

    const [first, second] = await Promise.all([
      beginIdempotentAttempt(db, args),
      beginIdempotentAttempt(db, args)
    ])

    const outcomes = [first.outcome, second.outcome].sort()
    expect(outcomes).toEqual(['in-progress', 'proceed'])
  })

  it('replays the stored response once the winning attempt completes', async () => {
    const { db } = createFakeIdempotencyDb()
    const args = { scope: 'receipt-line:handle:r1:l1', idempotencyKey: 'key-2', requestHash: 'hash-a' }

    const begin = await beginIdempotentAttempt(db, args)
    if (begin.outcome !== 'proceed') {
      throw new Error('expected proceed')
    }

    await finalizeIdempotentAttempt(db, {
      recordId: begin.recordId,
      status: 200,
      body: { success: true, data: { orderExecutionActivityId: 'oea-1' } }
    })

    const replay = await beginIdempotentAttempt(db, args)
    expect(replay).toEqual({
      outcome: 'replay',
      status: 200,
      body: { success: true, data: { orderExecutionActivityId: 'oea-1' } }
    })
  })

  it('rejects reuse of the same key with a different request payload', async () => {
    const { db } = createFakeIdempotencyDb()
    const scope = 'receipt-line:handle:r1:l1'

    await beginIdempotentAttempt(db, { scope, idempotencyKey: 'key-3', requestHash: 'hash-a' })
    const mismatch = await beginIdempotentAttempt(db, { scope, idempotencyKey: 'key-3', requestHash: 'hash-b' })

    expect(mismatch).toEqual({ outcome: 'mismatch' })
  })

  it('discards the record on a server error, allowing a clean retry', async () => {
    const { db } = createFakeIdempotencyDb()
    const args = { scope: 'receipt-line:handle:r1:l1', idempotencyKey: 'key-4', requestHash: 'hash-a' }

    const begin = await beginIdempotentAttempt(db, args)
    if (begin.outcome !== 'proceed') {
      throw new Error('expected proceed')
    }

    await finalizeIdempotentAttempt(db, { recordId: begin.recordId, status: 500, body: { success: false } })

    const retry = await beginIdempotentAttempt(db, args)
    expect(retry.outcome).toBe('proceed')
  })
})
