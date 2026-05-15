import { Role, type PrismaClient } from '@/generated/prisma'

export type SimulateActiveFloorUsersWarehouseResult = {
  warehouseId: string
  warehouseName: string
  action: 'skipped_had_active' | 'updated'
  userIdsActivated: string[]
}

export type SimulateActiveFloorUsersResult = {
  warehouses: SimulateActiveFloorUsersWarehouseResult[]
}

function shuffleInPlace<T>(items: T[]): void {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = items[i]
    items[i] = items[j]
    items[j] = t
  }
}

/**
 * Demo helper: marks floor users as logged in when no assigned floor user in that warehouse
 * currently has `isLoggedIn`, so warehouse overview KPIs show active assignees.
 */
export async function simulateActiveFloorUsers(prisma: PrismaClient): Promise<SimulateActiveFloorUsersResult> {
  const warehouses = await prisma.warehouse.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
    orderBy: { createdAt: 'asc' }
  })

  const warehousesOut: SimulateActiveFloorUsersWarehouseResult[] = []

  for (const warehouse of warehouses) {
    const assignments = await prisma.warehouseAssignment.findMany({
      where: { warehouseId: warehouse.id },
      select: {
        userId: true,
        user: {
          select: {
            id: true,
            role: true,
            isLoggedIn: true,
            isActive: true,
            deletedAt: true
          }
        }
      }
    })

    const seenUserIds = new Set<string>()
    const floorUsers: Array<{
      id: string
      role: Role
      isLoggedIn: boolean
    }> = []

    for (const assignment of assignments) {
      if (seenUserIds.has(assignment.userId)) {
        continue
      }
      seenUserIds.add(assignment.userId)

      const user = assignment.user
      if (!user || user.deletedAt !== null || !user.isActive) {
        continue
      }
      if (user.role !== Role.WAREHOUSE_WORKER && user.role !== Role.WAREHOUSE_MANAGER) {
        continue
      }

      floorUsers.push({
        id: user.id,
        role: user.role,
        isLoggedIn: user.isLoggedIn
      })
    }

    const anyLoggedIn = floorUsers.some((u) => u.isLoggedIn)

    if (anyLoggedIn) {
      warehousesOut.push({
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        action: 'skipped_had_active',
        userIdsActivated: []
      })
      continue
    }

    const workers = floorUsers.filter((u) => u.role === Role.WAREHOUSE_WORKER)
    const managers = floorUsers.filter((u) => u.role === Role.WAREHOUSE_MANAGER)

    const pickedIds = new Set<string>()
    const workerPickCount = Math.ceil(workers.length * (3 / 10))

    const workersShuffled = [...workers]
    shuffleInPlace(workersShuffled)
    for (let i = 0; i < Math.min(workerPickCount, workersShuffled.length); i += 1) {
      pickedIds.add(workersShuffled[i].id)
    }

    const managersShuffled = [...managers]
    shuffleInPlace(managersShuffled)
    if (managersShuffled.length > 0) {
      pickedIds.add(managersShuffled[0].id)
    }

    const activated = [...pickedIds]

    if (activated.length > 0) {
      await prisma.user.updateMany({
        where: { id: { in: activated } },
        data: { isLoggedIn: true }
      })
    }

    warehousesOut.push({
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      action: 'updated',
      userIdsActivated: activated
    })
  }

  return { warehouses: warehousesOut }
}
