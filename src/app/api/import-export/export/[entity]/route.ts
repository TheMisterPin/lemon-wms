import type { NextRequest } from 'next/server'

import { forbidden, ok, unauthorized } from '@/lib/api/response'
import { isOfficeRole, verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { exportBinsForExport } from '@/lib/import-export/entities/bins'
import { exportDevicesForExport } from '@/lib/import-export/entities/devices'
import { exportItemsForExport } from '@/lib/import-export/entities/items'
import { exportUsersForExport } from '@/lib/import-export/entities/users'
import { exportWarehousesForExport } from '@/lib/import-export/entities/warehouses'
import { exportZonesForExport } from '@/lib/import-export/entities/zones'
import type { ImportEntity } from '@/lib/import-export/types'
import prisma from '@/lib/prisma'

const EXPORTERS: Record<ImportEntity, (db: typeof prisma) => Promise<unknown[]>> = {
  warehouses: exportWarehousesForExport,
  zones: exportZonesForExport,
  bins: exportBinsForExport,
  users: exportUsersForExport,
  items: exportItemsForExport,
  devices: exportDevicesForExport,
}

const VALID_ENTITIES = new Set<string>(['warehouses', 'zones', 'bins', 'users', 'items', 'devices'])

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) return unauthorized()
  if (!isOfficeRole(payload.role)) return forbidden()

  const { entity } = await params
  if (!VALID_ENTITIES.has(entity)) {
    return forbidden(`Unknown entity: ${entity}`)
  }

  const exporter = EXPORTERS[entity as ImportEntity]
  const records = await exporter(prisma)
  return ok(records, `Exported ${records.length} ${entity} records.`)
}
