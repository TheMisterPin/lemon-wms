import { createHash } from 'crypto'

import { NextResponse } from 'next/server'

import { Prisma, type PrismaClient } from '@/generated/prisma'

/**
 * sortKeysDeep.
 * @param value - Parameter for sortKeysDeep.
 * @returns Result from sortKeysDeep.
 */
function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep)
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => [k, sortKeysDeep(v)])

    return Object.fromEntries(entries)
  }

  return value
}

/**
 * computeRequestHash.
 * @param payload - Parameter for computeRequestHash.
 * @returns Result from computeRequestHash.
 */
export function computeRequestHash(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(sortKeysDeep(payload))).digest('hex')
}

export type IdempotencyBeginResult =
  | { outcome: 'proceed'; recordId: string }
  | { outcome: 'replay'; status: number; body: unknown }
  | { outcome: 'in-progress' }
  | { outcome: 'mismatch' }

type BeginIdempotentAttemptArgs = {
  scope: string
  idempotencyKey: string
  requestHash: string
  userId?: string
}

function isUniqueConstraintViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'
}

/**
 * beginIdempotentAttempt.
 * @param db - Parameter for beginIdempotentAttempt.
 * @param args - Parameter for beginIdempotentAttempt.
 * @returns Result from beginIdempotentAttempt.
 */
export async function beginIdempotentAttempt(
  db: PrismaClient,
  args: BeginIdempotentAttemptArgs
): Promise<IdempotencyBeginResult> {
  const { scope, idempotencyKey, requestHash, userId } = args

  try {
    const created = await db.idempotencyRecord.create({
      data: { scope, idempotencyKey, requestHash, userId }
    })

    return { outcome: 'proceed', recordId: created.id }
  } catch (err) {
    if (!isUniqueConstraintViolation(err)) {
      throw err
    }
  }

  const existing = await db.idempotencyRecord.findUniqueOrThrow({
    where: { scope_idempotencyKey: { scope, idempotencyKey } }
  })

  if (existing.requestHash !== requestHash) {
    return { outcome: 'mismatch' }
  }

  if (existing.status === 'PENDING') {
    return { outcome: 'in-progress' }
  }

  return { outcome: 'replay', status: existing.responseStatus ?? 500, body: existing.responseBody }
}

type FinalizeIdempotentAttemptArgs = {
  recordId: string
  status: number
  body: unknown
}

/**
 * finalizeIdempotentAttempt.
 * @param db - Parameter for finalizeIdempotentAttempt.
 * @param args - Parameter for finalizeIdempotentAttempt.
 * @returns Result from finalizeIdempotentAttempt.
 */
export async function finalizeIdempotentAttempt(
  db: PrismaClient,
  args: FinalizeIdempotentAttemptArgs
): Promise<void> {
  const { recordId, status, body } = args

  if (status >= 500) {
    await db.idempotencyRecord.delete({ where: { id: recordId } }).catch(() => undefined)

    return
  }

  await db.idempotencyRecord.update({
    where: { id: recordId },
    data: {
      status: status < 400 ? 'SUCCEEDED' : 'FAILED',
      responseStatus: status,
      responseBody: body as Prisma.InputJsonValue,
      completedAt: new Date()
    }
  })
}

/**
 * abandonIdempotentAttempt.
 * @param db - Parameter for abandonIdempotentAttempt.
 * @param recordId - Parameter for abandonIdempotentAttempt.
 * @returns Result from abandonIdempotentAttempt.
 */
async function abandonIdempotentAttempt(db: PrismaClient, recordId: string): Promise<void> {
  await db.idempotencyRecord.delete({ where: { id: recordId } }).catch(() => undefined)
}

type WithIdempotencyArgs = {
  scope: string
  idempotencyKey: string
  body: unknown
  userId?: string
}

/**
 * withIdempotency.
 * @param db - Parameter for withIdempotency.
 * @param args - Parameter for withIdempotency.
 * @param handler - Parameter for withIdempotency.
 * @returns Result from withIdempotency.
 */
export async function withIdempotency(
  db: PrismaClient,
  args: WithIdempotencyArgs,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const requestHash = computeRequestHash(args.body)
  const begin = await beginIdempotentAttempt(db, {
    scope: args.scope,
    idempotencyKey: args.idempotencyKey,
    requestHash,
    userId: args.userId
  })

  if (begin.outcome === 'mismatch') {
    return NextResponse.json(
      {
        success: false,
        message: 'Idempotency-Key was already used with a different request payload.',
        data: null,
        error: { code: 'IDEMPOTENCY_KEY_REUSED' }
      },
      { status: 409 }
    )
  }

  if (begin.outcome === 'in-progress') {
    return NextResponse.json(
      {
        success: false,
        message: 'A request with this Idempotency-Key is already being processed.',
        data: null,
        error: { code: 'IDEMPOTENCY_IN_PROGRESS' }
      },
      { status: 409 }
    )
  }

  if (begin.outcome === 'replay') {
    return NextResponse.json(begin.body, { status: begin.status })
  }

  let response: NextResponse
  try {
    response = await handler()
  } catch (err) {
    await abandonIdempotentAttempt(db, begin.recordId)
    throw err
  }

  const body = await response.clone().json()
  await finalizeIdempotentAttempt(db, { recordId: begin.recordId, status: response.status, body })

  return response
}
