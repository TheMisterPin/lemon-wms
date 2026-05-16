import type { NextRequest } from 'next/server'

import { fail, forbidden, ok, unauthorized } from '@/lib/api/response'
import { isOfficeRole, verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { insertBinsBatch } from '@/lib/import-export/entities/bins'
import { insertDevicesBatch } from '@/lib/import-export/entities/devices'
import { insertItemsBatch } from '@/lib/import-export/entities/items'
import { insertUsersBatch } from '@/lib/import-export/entities/users'
import { insertWarehousesBatch } from '@/lib/import-export/entities/warehouses'
import { insertZonesBatch } from '@/lib/import-export/entities/zones'
import type { ImportEntity } from '@/lib/import-export/types'
import prisma from '@/lib/prisma'

type Inserter = (db: typeof prisma, records: unknown[]) => Promise<number>

const INSERTERS: Record<ImportEntity, Inserter> = {
  warehouses: (db, r) => insertWarehousesBatch(db, r as Parameters<typeof insertWarehousesBatch>[1]),
  zones: (db, r) => insertZonesBatch(db, r as Parameters<typeof insertZonesBatch>[1]),
  bins: (db, r) => insertBinsBatch(db, r as Parameters<typeof insertBinsBatch>[1]),
  users: (db, r) => insertUsersBatch(db, r as Parameters<typeof insertUsersBatch>[1]),
  items: (db, r) => insertItemsBatch(db, r as Parameters<typeof insertItemsBatch>[1]),
  devices: (db, r) => insertDevicesBatch(db, r as Parameters<typeof insertDevicesBatch>[1]),
}

const VALID_ENTITIES = new Set<string>(['warehouses', 'zones', 'bins', 'users', 'items', 'devices'])

export async function POST(req: NextRequest) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) return unauthorized()
  if (!isOfficeRole(payload.role)) return forbidden()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return fail('Invalid JSON body.', 'BAD_REQUEST', 400)
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('entity' in body) ||
    !('records' in body)
  ) {
    return fail('Request body must include "entity" and "records".', 'BAD_REQUEST', 400)
  }

  const { entity, records } = body as { entity: string; records: unknown }

  if (!VALID_ENTITIES.has(entity)) {
    return fail(`Unknown entity: ${entity}`, 'BAD_REQUEST', 400)
  }

  if (!Array.isArray(records) || records.length === 0) {
    return fail('"records" must be a non-empty array.', 'BAD_REQUEST', 400)
  }

  try {
    const inserter = INSERTERS[entity as ImportEntity]
    const inserted = await inserter(prisma, records)
    return ok({ inserted }, `Inserted ${inserted} records.`)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Insert failed.'
    return fail(message, 'INSERT_ERROR', 500)
  }
}
