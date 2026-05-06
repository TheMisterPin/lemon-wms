import {
  AssignmentLifecycle,
  OrderType,
  Role,
  type Prisma,
  type PrismaClient
} from '@/generated/prisma'

type GenericOrderSeed = {
  id: string
  status: string
  warehouseId: string
  createdAt: Date
  reference: string
  orderType: OrderType
}

type FloorUserSeed = {
  id: string
  role: Role
}

function atTime(base: Date, hour: number, minute: number) {
  const date = new Date(base)

  date.setHours(hour, minute, 0, 0)

  return date
}

/**
 * Seeds order assignments for purchase orders with lifecycle timestamps
 * and matching assignment-related user activity events.
 */
export async function seedOrderAssignments(prisma: PrismaClient) {
  const [purchaseOrders, salesOrders, transferOrders, floorUsers, zones] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where: {
        status: {
          in: ['RELEASED', 'EXECUTING', 'PAUSED', 'EXECUTED', 'SIGNED_OFF']
        }
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        status: true,
        warehouseId: true,
        createdAt: true,
        reference: true
      }
    }),
    prisma.salesOrder.findMany({
      where: {
        status: {
          in: ['RELEASED', 'EXECUTING', 'PAUSED', 'EXECUTED', 'SIGNED_OFF']
        }
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        status: true,
        warehouseId: true,
        createdAt: true,
        reference: true
      }
    }),
    prisma.transferOrder.findMany({
      where: {
        status: {
          in: ['RELEASED', 'EXECUTING', 'PAUSED', 'EXECUTED', 'SIGNED_OFF']
        }
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        status: true,
        warehouseId: true,
        createdAt: true,
        reference: true
      }
    }),
    prisma.user.findMany({
      where: {
        isActive: true,
        role: {
          in: [Role.WAREHOUSE_MANAGER, Role.WAREHOUSE_WORKER]
        }
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        role: true
      }
    }),
    prisma.zone.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        warehouseId: true
      }
    })
  ])

  if (purchaseOrders.length === 0 || floorUsers.length === 0) {
    return { assignmentsCount: 0, userActivitiesCount: 0 }
  }

  const zonesByWarehouse = new Map<string, string[]>()

  for (const zone of zones) {
    const current = zonesByWarehouse.get(zone.warehouseId) ?? []

    current.push(zone.id)
    zonesByWarehouse.set(zone.warehouseId, current)
  }

  const assignments: Prisma.OrderAssignmentCreateManyInput[] = []
  const assignmentActivities: Prisma.UserActivityEntryCreateManyInput[] = []

  const operationalOrders: GenericOrderSeed[] = [
    ...purchaseOrders.map((order) => ({
      ...order,
      orderType: OrderType.PURCHASE
    })),
    ...salesOrders.map((order) => ({
      ...order,
      orderType: OrderType.SALES
    })),
    ...transferOrders.map((order) => ({
      ...order,
      orderType: OrderType.TRANSFER
    }))
  ]

  operationalOrders.forEach((order, index: number) => {
    const user = floorUsers[index % floorUsers.length] as FloorUserSeed
    const zoneIds = zonesByWarehouse.get(order.warehouseId) ?? []
    const zoneId = zoneIds.length > 0 ? zoneIds[index % zoneIds.length] : null

    const assignedAt = new Date(order.createdAt)
    assignedAt.setDate(assignedAt.getDate() + 1 + (index % 4))
    const startedAt = atTime(assignedAt, 7, 30 + (index % 20))

    let status: AssignmentLifecycle = AssignmentLifecycle.ASSIGNED
    let pausedAt: Date | null = null
    let completedAt: Date | null = null
    let releasedAt: Date | null = null
    let isActive = true

    if (order.status === 'EXECUTING') {
      status = AssignmentLifecycle.STARTED
    }

    if (order.status === 'PAUSED') {
      status = AssignmentLifecycle.PAUSED
      pausedAt = atTime(assignedAt, 11, 15 + (index % 25))
    }

    if (order.status === 'EXECUTED' || order.status === 'SIGNED_OFF') {
      status = AssignmentLifecycle.COMPLETED
      completedAt = atTime(assignedAt, 15, 20 + (index % 30))
      releasedAt = atTime(assignedAt, 16, 5 + (index % 20))
      isActive = false
    }

    const assignmentId = `ORD-ASG-${String(index + 1).padStart(4, '0')}`

    assignments.push({
      id: assignmentId,
      orderId: order.id,
      orderType: order.orderType,
      status,
      warehouseId: order.warehouseId,
      zoneId,
      userId: user.id,
      assignedAt,
      startedAt,
      pausedAt,
      releasedAt,
      completedAt,
      isActive,
      notes: `Seeded assignment for ${order.reference}`
    })

    assignmentActivities.push({
      userId: user.id,
      actionType: 'ORDER_STARTED',
      entityType: 'ORDER_ASSIGNMENT',
      entityId: assignmentId,
      warehouseId: order.warehouseId,
      zoneId,
      orderId: order.id,
      orderType: order.orderType,
      orderAssignmentId: assignmentId,
      metadata: {
        assignmentStatus: status,
        orderReference: order.reference
      },
      notes: 'Assignment session created',
      createdAt: startedAt
    })

    if (pausedAt) {
      assignmentActivities.push({
        userId: user.id,
        actionType: 'ORDER_PAUSED',
        entityType: 'ORDER_ASSIGNMENT',
        entityId: assignmentId,
        warehouseId: order.warehouseId,
        zoneId,
        orderId: order.id,
        orderType: order.orderType,
        orderAssignmentId: assignmentId,
        metadata: {
          assignmentStatus: status,
          orderReference: order.reference
        },
        notes: 'Assignment paused during shift handoff',
        createdAt: pausedAt
      })
    }

    if (completedAt) {
      assignmentActivities.push({
        userId: user.id,
        actionType: 'ORDER_COMPLETED',
        entityType: 'ORDER_ASSIGNMENT',
        entityId: assignmentId,
        warehouseId: order.warehouseId,
        zoneId,
        orderId: order.id,
        orderType: order.orderType,
        orderAssignmentId: assignmentId,
        metadata: {
          assignmentStatus: status,
          orderReference: order.reference
        },
        notes: 'Assignment completed and released',
        createdAt: completedAt
      })
    }
  })

  if (assignments.length === 0) {
    return { assignmentsCount: 0, userActivitiesCount: 0 }
  }

  await prisma.orderAssignment.createMany({
    data: assignments,
    skipDuplicates: true
  })

  if (assignmentActivities.length > 0) {
    await prisma.userActivityEntry.createMany({ data: assignmentActivities })
  }

  return {
    assignmentsCount: assignments.length,
    userActivitiesCount: assignmentActivities.length
  }
}
