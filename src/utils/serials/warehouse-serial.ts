import prisma from '@/lib/prisma'

async function generateWarehouseSerial(warehouseId: string) {
  const count = await prisma.wARItem.count({
    where: { id: { startsWith: `WH-${warehouseId}-` } }
  })

  return `WH-${String(count + 1).padStart(4, '0')}`
}

export { generateWarehouseSerial }
