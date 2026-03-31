import prisma from '@/lib/prisma'

async function generateUserSerial(warehouseId: string) {
  const count = await prisma.user.count({
    where: { id: { startsWith: `USR-${warehouseId}-` } }
  })

  return `USR-${String(count + 1).padStart(4, '0')}`
}

export { generateUserSerial }
