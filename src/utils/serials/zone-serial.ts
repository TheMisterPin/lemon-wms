import prisma from '@/lib/prisma'

async function generateZoneSerial(warehouseId: string) {
  const count = await prisma.zone.count({
    where: { id: { startsWith: `ZN-${warehouseId}-` } }
  })

  return `ZN-${String(count + 1).padStart(4, '0')}`
}

export { generateZoneSerial }
