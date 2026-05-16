import type { NextRequest } from 'next/server'

import { fail, forbidden, ok, unauthorized } from '@/lib/api/response'
import { isOfficeRole, verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { checkImportDataRelations } from '@/lib/import-export/check-import-data-relations'
import type { ImportEntity } from '@/lib/import-export/types'
import prisma from '@/lib/prisma'

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

  if (!Array.isArray(records)) {
    return fail('"records" must be an array.', 'BAD_REQUEST', 400)
  }

  const result = await checkImportDataRelations(prisma, entity as ImportEntity, records)
  return ok(result, `Relation check complete.`)
}
