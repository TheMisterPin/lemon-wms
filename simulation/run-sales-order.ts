/**
 * Warehouse Sales Order Simulation
 *
 * Exercises the full floor-side SO execution flow using real HTTP endpoints.
 * Logs in as a floor worker, starts a sales order, loads all RESERVED items
 * from warehouse bins onto a trolley, then unloads them to a staging bin.
 *
 * Prerequisites:
 *   1. pnpm seed:all  (populates DB with devices, users, orders, and RESERVED stock)
 *   2. pnpm dev       (Next.js dev server must be running)
 *
 * Usage:
 *   pnpm simulate:sales
 *
 * Env vars (optional):
 *   SIMULATION_BASE_URL   Base URL of the running server (default: http://localhost:3000)
 */

import axios, { type AxiosInstance } from 'axios'
import { PrismaClient } from '../src/generated/prisma'

const BASE_URL = process.env.SIMULATION_BASE_URL ?? 'http://localhost:3000'

const BADGE_NUMBER = 'USR-0000'
const PIN = '1234'

// ─── Types ───────────────────────────────────────────────────────────────────

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  error?: { code: string }
}

type FloorLoginResult = {
  accessToken: string
  user: { id: string; role: string; badgeNumber: string }
  location: { warehouseId?: string; zoneId?: string }
  device: { id: string; name: string; code: string; warehouseId?: string; zoneId?: string }
}

type SalesOrder = { id: string; reference: string; status: string }

type StartedOrder = { id: string; status: string; orderAssignmentId: string }

type PickLine = {
  id: string
  salesOrderLineId: string
  itemNameSnapshot: string
  uom: string
  orderedQuantity: string
}

type PickData = { id: string; reference: string; status: string; lines: PickLine[] }

type LoadResult = { boeId: string | null; transitBinStockItemId: string }

type HandleLineResult = {
  orderExecutionActivityId: string
  pickLineId: string
  pickStatus: string | null
}

type TrolleyItem = { id: string; quantityAvailable: number; description: string }
type TrolleyData = { items: TrolleyItem[] }

type PickTarget = {
  pickLineId: string
  itemNameSnapshot: string
  uom: string
  orderedQuantity: string
  binStockItemId: string
  binId: string
}

// ─── HTTP client ─────────────────────────────────────────────────────────────

function createClient(token?: string): AxiosInstance {
  return axios.create({
    baseURL: BASE_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
}

async function call<T>(
  client: AxiosInstance,
  method: 'GET' | 'POST',
  path: string,
  body?: unknown
): Promise<T> {
  const res = await client.request<ApiResponse<T>>({ method, url: path, data: body })
  if (!res.data.success) {
    throw new Error(`[${method} ${path}] ${res.data.message} (${res.data.error?.code ?? 'ERR'})`)
  }
  return res.data.data
}

// ─── Logging helpers ─────────────────────────────────────────────────────────

function pad(str: string, len: number): string {
  return str.padEnd(len, '.')
}

let stepTimer = 0

function startStep(label: string): void {
  stepTimer = Date.now()
  process.stdout.write(`[SIM] ${pad(label, 44)}`)
}

function endStep(note = ''): void {
  const ms = Date.now() - stepTimer
  const noteStr = note ? `  ${note}` : ''
  console.log(`OK${noteStr}  (${ms}ms)`)
}

function log(msg: string): void {
  console.log(`[SIM] ${msg}`)
}

// ─── Setup phase (Prisma direct) ─────────────────────────────────────────────

async function findSimulationContext(prisma: PrismaClient) {
  const device = await prisma.device.findFirst({
    where: {
      authorized: true,
      isActive: true,
      warehouseId: { not: null },
      zoneId: { not: null }
    },
    orderBy: { code: 'asc' },
    select: { code: true, warehouseId: true, zoneId: true }
  })

  if (!device?.warehouseId) {
    throw new Error(
      'No authorized device with warehouseId + zoneId found. Run "pnpm seed:all" first.'
    )
  }

  // Find a RELEASED sales order that has a pick with RESERVED stock items
  const salesOrderWithPick = await prisma.salesOrder.findFirst({
    where: {
      warehouseId: device.warehouseId,
      status: 'RELEASED',
      deletedAt: null,
      picks: {
        some: {
          deletedAt: null,
          lines: {
            some: {
              stockItems: {
                some: { status: 'RESERVED' }
              }
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true, reference: true, warehouseId: true }
  })

  if (!salesOrderWithPick) {
    throw new Error(
      `No RELEASED sales orders with RESERVED pick stock found in warehouse ${device.warehouseId}. ` +
        'Run "pnpm seed:all" first.'
    )
  }

  // Find a trolley for this warehouse
  const trolley = await prisma.trolley.findFirst({
    where: { warehouseId: device.warehouseId, isActive: true },
    select: { id: true, code: true }
  })

  if (!trolley) {
    throw new Error(
      `No active trolley found in warehouse ${device.warehouseId}. Run "pnpm seed:all" first.`
    )
  }

  // Ensure an empty STAGING bin exists
  const stagingBinId = await ensureEmptyStagingBin(prisma, device.warehouseId)

  // Build pick targets from DB
  const pick = await prisma.salesOrderPick.findFirst({
    where: { salesOrderId: salesOrderWithPick.id, deletedAt: null },
    select: {
      lines: {
        where: { correctionOfLineId: null },
        select: {
          id: true,
          itemNameSnapshot: true,
          uom: true,
          orderedQuantity: true,
          stockItems: {
            where: { status: 'RESERVED' },
            select: { id: true, binId: true },
            take: 1
          }
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  const pickTargets: PickTarget[] = []
  for (const line of pick?.lines ?? []) {
    const stockItem = line.stockItems[0]
    if (stockItem) {
      pickTargets.push({
        pickLineId: line.id,
        itemNameSnapshot: line.itemNameSnapshot,
        uom: line.uom,
        orderedQuantity: line.orderedQuantity.toString(),
        binStockItemId: stockItem.id,
        binId: stockItem.binId
      })
    }
  }

  if (pickTargets.length === 0) {
    throw new Error('No RESERVED pick targets found for this order.')
  }

  return { device, order: salesOrderWithPick, trolley, stagingBinId, pickTargets }
}

async function ensureEmptyStagingBin(prisma: PrismaClient, warehouseId: string): Promise<string> {
  // Look for an already-empty STAGING bin
  const emptyStagingBin = await prisma.bin.findFirst({
    where: {
      zone: { warehouseId },
      type: 'STAGING',
      isBlocked: false,
      deletedAt: null,
      OR: [{ currentCapacity: 0 }, { currentCapacity: null }]
    },
    select: { id: true }
  })

  if (emptyStagingBin) {
    return emptyStagingBin.id
  }

  // No empty STAGING bin — find one with items and clear it to a GENERAL bin
  log('No empty STAGING bin found — relocating items to a GENERAL bin...')

  const stagingBin = await prisma.bin.findFirst({
    where: { zone: { warehouseId }, type: 'STAGING', isBlocked: false, deletedAt: null },
    select: { id: true, currentCapacity: true }
  })

  if (!stagingBin) {
    throw new Error(`No STAGING bin found in warehouse ${warehouseId}.`)
  }

  const generalBin = await prisma.bin.findFirst({
    where: {
      zone: { warehouseId },
      type: 'GENERAL',
      isBlocked: false,
      deletedAt: null,
      OR: [{ currentCapacity: 0 }, { currentCapacity: null }]
    },
    select: { id: true }
  })

  if (!generalBin) {
    throw new Error(
      `No empty GENERAL bin found in warehouse ${warehouseId} to receive relocated items.`
    )
  }

  const movedItems = await prisma.binStockItem.updateMany({
    where: { binId: stagingBin.id },
    data: { binId: generalBin.id }
  })

  // Reset staging bin capacity; set general bin capacity to count of moved items
  await prisma.bin.update({
    where: { id: stagingBin.id },
    data: { currentCapacity: 0 }
  })

  if (movedItems.count > 0) {
    await prisma.bin.update({
      where: { id: generalBin.id },
      data: { currentCapacity: { increment: movedItems.count } }
    })
  }

  log(`Relocated ${movedItems.count} item(s) from STAGING to GENERAL bin.`)

  return stagingBin.id
}

// ─── Verification phase (Prisma direct) ──────────────────────────────────────

async function verifyAuditTrail(
  prisma: PrismaClient,
  orderId: string,
  orderAssignmentId: string
): Promise<void> {
  const [activities, executionActivities, assignment, so, pick] = await Promise.all([
    prisma.userActivityEntry.findMany({
      where: { orderId },
      select: { actionType: true },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.orderExecutionActivity.findMany({
      where: { orderId, orderType: 'SALES' },
      select: { activityType: true },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.orderAssignment.findUnique({
      where: { id: orderAssignmentId },
      select: { status: true, completedAt: true }
    }),
    prisma.salesOrder.findUnique({
      where: { id: orderId },
      select: { status: true, reference: true }
    }),
    prisma.salesOrderPick.findFirst({
      where: { salesOrderId: orderId, deletedAt: null },
      select: { status: true, completedLines: true, totalLines: true }
    })
  ])

  log('')
  log('── Audit trail verification ─────────────────────────────────')
  log(`UserActivityEntry     : ${activities.length} entries  (${activities.map((a) => a.actionType).join(', ')})`)
  log(`OrderExecutionActivity: ${executionActivities.length} entries  (${executionActivities.map((a) => a.activityType).join(', ')})`)
  log(`OrderAssignment       : ${assignment?.status ?? 'NOT FOUND'}  completedAt=${assignment?.completedAt?.toISOString() ?? '-'}`)
  log(`SalesOrder            : ${so?.status ?? 'NOT FOUND'}  ref=${so?.reference ?? '-'}`)
  log(`SalesOrderPick        : ${pick?.status ?? 'NOT FOUND'}  ${pick?.completedLines ?? 0}/${pick?.totalLines ?? 0} lines`)
  log('─────────────────────────────────────────────────────────────')

  const ok =
    pick?.status === 'IN_PROGRESS' &&
    (pick?.completedLines ?? 0) === (pick?.totalLines ?? -1) &&
    (pick?.totalLines ?? 0) > 0

  if (ok) {
    log('All checks passed. ✓')
  } else {
    log('WARNING: Some checks did not pass. Review above.')
  }
}

// ─── Main simulation ──────────────────────────────────────────────────────────

async function run(): Promise<void> {
  const prisma = new PrismaClient()

  try {
    log('── Sales Order Simulation Engine ────────────────────────────')

    log('Setting up simulation context...')
    const { device, order, trolley, stagingBinId, pickTargets } = await findSimulationContext(prisma)
    log(`Device   : ${device.code}  (warehouseId=${device.warehouseId}, zoneId=${device.zoneId})`)
    log(`Order    : ${order.reference}  (id=${order.id})`)
    log(`Trolley  : ${trolley.code}  (id=${trolley.id})`)
    log(`Staging  : binId=${stagingBinId}`)
    log(`Targets  : ${pickTargets.length} pick line(s)`)
    log('')

    // Step 1: Login
    startStep('STEP 1/N  Floor login')
    const anonClient = createClient()
    const loginData = await call<FloorLoginResult>(anonClient, 'POST', '/api/auth/floor/login', {
      deviceCode: device.code,
      badgeNumber: BADGE_NUMBER,
      pin: PIN
    })
    const { accessToken } = loginData
    endStep(`userId=${loginData.user.id}`)

    const client = createClient(accessToken)

    // Step 2: List sales orders
    startStep('STEP 2/N  List sales orders')
    const orders = await call<SalesOrder[]>(client, 'GET', '/api/warehouse/orders/sales')
    const releasedOrders = orders.filter((o) => o.status === 'RELEASED')
    if (releasedOrders.length === 0) {
      throw new Error('No RELEASED sales orders returned by the API.')
    }
    const targetOrder = releasedOrders.find((o) => o.id === order.id) ?? releasedOrders[0]
    endStep(`${releasedOrders.length} RELEASED, using ${targetOrder.reference}`)

    // Step 3: Start the order
    startStep('STEP 3/N  Start sales order')
    const startData = await call<StartedOrder>(
      client,
      'POST',
      `/api/warehouse/orders/sales/${targetOrder.id}/start`
    )
    const orderAssignmentId = startData.orderAssignmentId
    endStep(`status=${startData.status}  assignmentId=${orderAssignmentId}`)

    // Step 4: Fetch pick document
    startStep('STEP 4/N  Fetch pick document')
    const pick = await call<PickData>(
      client,
      'GET',
      `/api/warehouse/orders/sales/${targetOrder.id}/pick`
    )
    endStep(`pickId=${pick.id}  lines=${pick.lines.length}`)

    // Step 5: Load + handle each pick line
    for (let i = 0; i < pickTargets.length; i++) {
      const target = pickTargets[i]
      const lineNum = `${i + 1}/${pickTargets.length}`

      startStep(`STEP 5/N  Load line ${lineNum}`)
      await call<LoadResult>(
        client,
        'POST',
        `/api/warehouse/stock/load/${target.binId}`,
        { sourceBinStockItemId: target.binStockItemId, quantity: Number(target.orderedQuantity) }
      )
      endStep(`${target.itemNameSnapshot}  qty=${target.orderedQuantity} ${target.uom}`)

      startStep(`STEP 5/N  Handle line ${lineNum}`)
      const handleResult = await call<HandleLineResult>(
        client,
        'POST',
        `/api/warehouse/orders/sales/${targetOrder.id}/pick/${pick.id}/lines/${target.pickLineId}/handle`,
        {
          quantity: Number(target.orderedQuantity),
          disposition: 'ACCEPTED',
          orderAssignmentId,
          notes: `Simulation: picked ${target.orderedQuantity} ${target.uom} of ${target.itemNameSnapshot}`
        }
      )
      endStep(`pickStatus=${handleResult.pickStatus ?? '-'}`)
    }

    // Step 6: Check trolley
    startStep('STEP 6/N  Get trolley contents')
    const trolleyData = await call<TrolleyData>(client, 'GET', '/api/warehouse/stock/trolley')
    const trolleyItems = trolleyData.items
    if (trolleyItems.length === 0) {
      throw new Error('Trolley is empty after loading — check load step.')
    }
    endStep(`${trolleyItems.length} item(s) on trolley`)

    // Step 7: Unload to staging bin
    startStep('STEP 7/N  Unload to staging bin')
    const selections = trolleyItems.map((item) => ({ transitBinStockItemId: item.id }))
    await call<unknown>(
      client,
      'POST',
      `/api/warehouse/stock/unload/${stagingBinId}`,
      { selections }
    )
    endStep(`→ staging bin ${stagingBinId.slice(0, 8)}…`)

    // Step 8: Logout
    startStep('STEP 8/N  Logout')
    await call<null>(client, 'POST', '/api/auth/logout')
    endStep()

    log('')

    // Verification
    await verifyAuditTrail(prisma, targetOrder.id, orderAssignmentId)

    log('── Simulation complete ───────────────────────────────────────')
  } catch (err) {
    console.error('\n[SIM] ERROR:', err instanceof Error ? err.message : err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

run()
