import prisma from '@/lib/prisma'

async function generateWarehouseSerial() {
  const count = await prisma.warehouse.count()

  return `WH-${String(count + 1).padStart(4, '0')}`
}

export { generateWarehouseSerial }
