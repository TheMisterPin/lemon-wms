import { PrismaClient } from '@/generated/prisma'

async function generateUserSerial(prisma: PrismaClient) {
  const count = await prisma.user.count({
    where: { id: { startsWith: 'USR-' } }
  })

  const newID = `USR-${String(count + 1).padStart(4, '0')}`

  return newID
}

async function generateWarehouseSerial(prisma: PrismaClient) {
  const count = await prisma.warehouse.count()
  const newID = `WH-${String(count + 1).padStart(4, '0')}`

  return newID
}

async function generateDeviceSerial(prisma: PrismaClient) {
  const count = await prisma.device.count()
  const newID = `DV-${String(count + 1).padStart(4, '0')}`

  return newID
}

async function generateBinSerial(prisma: PrismaClient, zoneId: string) {
  const zoneCode = zoneId.split('-')[2]
  const warehouseCode = zoneId.split('-')[1]
  const count = await prisma.bin.count({
    where: { id: { startsWith: `BIN-${warehouseCode}-${zoneCode}-` } }
  })

  const newID = `BIN-${warehouseCode}-${zoneCode}-${String(count + 1).padStart(4, '0')}`

  return newID
}

async function generateZoneSerial(prisma: PrismaClient, warehouseId: string) {
  const warehouseCode = warehouseId.split('-')[1]
  const count = await prisma.zone.count({
    where: { id: { startsWith: `ZN-${warehouseCode}-` } }
  })

  const newID = `ZN-${warehouseCode}-${String(count + 1).padStart(4, '0')}`

  return newID
}

export { generateUserSerial,  generateWarehouseSerial,  generateZoneSerial, generateBinSerial, generateDeviceSerial }
