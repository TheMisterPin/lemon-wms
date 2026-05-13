/**
 * Warehouse Purchase Order Simulation
 *
 * Exercises the full floor-side PO execution flow using real HTTP endpoints.
 * Mirrors what the seeding functions do, but via the actual API.
 *
 * Prerequisites:
 *   1. pnpm seed:all  (populates DB with devices, users, and RELEASED orders)
 *   2. pnpm dev       (Next.js dev server must be running)
 *
 * Usage:
 *   pnpm simulate
 *
 * Env vars (optional):
 *   SIMULATION_BASE_URL   Base URL of the running server (default: http://localhost:3000)
 */

import axios, { type AxiosInstance } from 'axios'
import { PrismaClient } from '../src/generated/prisma'

const BASE_URL = process.env.SIMULATION_BASE_URL ?? 'http://localhost:3000'

// Owner user credentials — seeded deterministically in every environment
// See seed/lib/users.ts: badgeNumber='USR-0000', pin=bcrypt('1234')
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

type WarehousePurchaseOrder = {
  id: string
  reference: string
  status: string
  warehouseId: string
}

type StartedOrder = {
  id: string
  status: string
  orderAssignmentId: string
}

type ReceiptLine = {
  id: string
  purchaseOrderLineId: string
  itemId: string
  itemNameSnapshot: string
  uom: string
  quantity: string
  orderedQuantity: string
  disposition: string
  notes: string | null
}

type ReceiptData = {
  id: string
  reference: string
  status: string
  lines: ReceiptLine[]
}

type HandleLineResult = {
  orderExecutionActivityId: string
  receiptLineId: string
  receiptStatus: string | null
}

type CompleteReceiptResult = {
  success: boolean
  orderId: string
  orderStatus: string
  receiptId: string
  receiptStatus: string
  assignmentStatus: string
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
  const res = await client.request<ApiResponse<T>>({
    method,
    url: path,
    data: body
  })
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
  // Find an authorized device with both warehouse and zone context
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

  // Find a RELEASED purchase order in that warehouse
  const order = await prisma.purchaseOrder.findFirst({
    where: { warehouseId: device.warehouseId, status: 'RELEASED', deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: { id: true, reference: true, warehouseId: true }
  })

  if (!order) {
    throw new Error(
      `No RELEASED purchase orders found in warehouse ${device.warehouseId}. ` +
        'Run "pnpm seed:all" first.'
    )
  }

  return { device, order }
}

// ─── Verification phase (Prisma direct) ──────────────────────────────────────

async function verifyAuditTrail(
  prisma: PrismaClient,
  orderId: string,
  orderAssignmentId: string
): Promise<void> {
  const [activities, executionActivities, assignment, po] = await Promise.all([
    prisma.userActivityEntry.findMany({
      where: { orderId },
      select: { actionType: true },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.orderExecutionActivity.findMany({
      where: { orderId, orderType: 'PURCHASE' },
      select: { activityType: true },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.orderAssignment.findUnique({
      where: { id: orderAssignmentId },
      select: { status: true, completedAt: true }
    }),
    prisma.purchaseOrder.findUnique({
      where: { id: orderId },
      select: { status: true, reference: true }
    })
  ])

  log('')
  log('── Audit trail verification ─────────────────────────────────')
  log(`UserActivityEntry    : ${activities.length} entries  (${activities.map((a) => a.actionType).join(', ')})`)
  log(`OrderExecutionActivity: ${executionActivities.length} entries  (${executionActivities.map((a) => a.activityType).join(', ')})`)
  log(`OrderAssignment      : ${assignment?.status ?? 'NOT FOUND'}  completedAt=${assignment?.completedAt?.toISOString() ?? '-'}`)
  log(`PurchaseOrder        : ${po?.status ?? 'NOT FOUND'}  ref=${po?.reference ?? '-'}`)
  log('─────────────────────────────────────────────────────────────')

  const ok =
    assignment?.status === 'COMPLETED' &&
    (po?.status === 'EXECUTED' || po?.status === 'EXECUTED_WITH_PROBLEMS')

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
    log('── Warehouse Simulation Engine ──────────────────────────────')

    // Setup: find device + order
    log('Setting up simulation context...')
    const { device, order } = await findSimulationContext(prisma)
    log(`Device : ${device.code}  (warehouseId=${device.warehouseId}, zoneId=${device.zoneId})`)
    log(`Order  : ${order.reference}  (id=${order.id})`)
    log('')

    // Step 1: Login
    startStep('STEP 1/7  Floor login')
    const anonClient = createClient()
    const loginData = await call<FloorLoginResult>(anonClient, 'POST', '/api/auth/floor/login', {
      deviceCode: device.code,
      badgeNumber: BADGE_NUMBER,
      pin: PIN
    })
    const { accessToken } = loginData
    endStep(`userId=${loginData.user.id}`)

    const client = createClient(accessToken)

    // Step 2: List purchase orders
    startStep('STEP 2/7  List purchase orders')
    const orders = await call<WarehousePurchaseOrder[]>(client, 'GET', '/api/warehouse/orders/purchase')
    const releasedOrders = orders.filter((o) => o.status === 'RELEASED')
    if (releasedOrders.length === 0) {
      throw new Error('No RELEASED purchase orders returned by the API.')
    }
    const targetOrder = releasedOrders.find((o) => o.id === order.id) ?? releasedOrders[0]
    endStep(`${releasedOrders.length} RELEASED, using ${targetOrder.reference}`)

    // Step 3: Start the order
    startStep('STEP 3/7  Start PO')
    const startData = await call<StartedOrder>(
      client,
      'POST',
      `/api/warehouse/orders/purchase/${targetOrder.id}/start`
    )
    const orderAssignmentId = startData.orderAssignmentId
    endStep(`status=${startData.status}  assignmentId=${orderAssignmentId}`)

    // Step 4: Fetch receipt
    startStep('STEP 4/7  Fetch receipt')
    const receipt = await call<ReceiptData>(
      client,
      'GET',
      `/api/warehouse/orders/purchase/${targetOrder.id}/receipt`
    )
    endStep(`receiptId=${receipt.id}  lines=${receipt.lines.length}`)

    // Step 5: Handle each receipt line
    let lineIndex = 0
    for (const line of receipt.lines) {
      lineIndex += 1
      startStep(`STEP 5/7  Handle line ${lineIndex}/${receipt.lines.length}`)
      const handleData = await call<HandleLineResult>(
        client,
        'POST',
        `/api/warehouse/orders/purchase/${targetOrder.id}/receipt/${receipt.id}/lines/${line.id}/handle`,
        {
          quantity: Number(line.orderedQuantity),
          disposition: 'ACCEPTED',
          orderAssignmentId,
          notes: `Simulation: received ${line.orderedQuantity} ${line.uom} of ${line.itemNameSnapshot}`
        }
      )
      endStep(`activityId=${handleData.orderExecutionActivityId}`)
    }

    // Step 6: Complete receipt
    startStep('STEP 6/7  Complete receipt')
    const completeData = await call<CompleteReceiptResult>(
      client,
      'POST',
      `/api/warehouse/orders/purchase/${targetOrder.id}/receipt/${receipt.id}/complete`,
      { orderAssignmentId, notes: 'Simulation complete' }
    )
    endStep(`orderStatus=${completeData.orderStatus}  receiptStatus=${completeData.receiptStatus}`)

    // Step 7: Logout
    startStep('STEP 7/7  Logout')
    await call<null>(client, 'POST', '/api/auth/logout')
    endStep()

    log('')

    // Verification: read audit trail directly from DB
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
