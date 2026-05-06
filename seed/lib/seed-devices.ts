import type { PrismaClient } from '@/generated/prisma'

export async function seedDemoDevice(prisma: PrismaClient) {
  const [warehouses, zones, managers, workers] = await Promise.all([
    prisma.warehouse.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' },
      select: { id: true }
    }),
    prisma.zone.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      select: { id: true, warehouseId: true }
    }),
    prisma.user.findMany({
      where: { isActive: true, role: 'WAREHOUSE_MANAGER' },
      orderBy: { createdAt: 'asc' },
      select: { id: true }
    }),
    prisma.user.findMany({
      where: { isActive: true, role: 'WAREHOUSE_WORKER' },
      orderBy: { createdAt: 'asc' },
      select: { id: true }
    })
  ])

  if (warehouses.length === 0) {
    return { count: 0 }
  }

  const zonesByWarehouse = new Map<string, string[]>()
  for (const zone of zones) {
    const current = zonesByWarehouse.get(zone.warehouseId) ?? []

    current.push(zone.id)
    zonesByWarehouse.set(zone.warehouseId, current)
  }

  let managerCursor = 0
  let workerCursor = 0
  let created = 0

  for (const warehouse of warehouses) {
    const warehouseZones = zonesByWarehouse.get(warehouse.id) ?? []

    for (let index = 0; index < 10; index += 1) {
      const isManagerSlot = index < 3
      const assigneeId = isManagerSlot
        ? managers[managerCursor % Math.max(managers.length, 1)]?.id
        : workers[workerCursor % Math.max(workers.length, 1)]?.id

      if (isManagerSlot) {
        managerCursor += 1
      } else {
        workerCursor += 1
      }

      const zoneId = index < warehouseZones.length ? warehouseZones[index] : null
      const code = `DEV-${warehouse.id}-${String(index + 1).padStart(2, '0')}`

      await prisma.device.upsert({
        where: { code },
        create: {
          name: code,
          code,
          warehouseId: warehouse.id,
          zoneId,
          authorized: true,
          isActive: true,
          type: 'FLOOR',
          registeredAt: new Date(),
          lastSeenAt: new Date(),
          loginMode: 'PIN',
          lastUserId: assigneeId ?? null
        },
        update: {
          warehouseId: warehouse.id,
          zoneId,
          authorized: true,
          isActive: true,
          type: 'FLOOR',
          loginMode: 'PIN',
          lastUserId: assigneeId ?? null,
          lastSeenAt: new Date()
        }
      })

      created += 1
    }
  }

  return { count: created }
}
