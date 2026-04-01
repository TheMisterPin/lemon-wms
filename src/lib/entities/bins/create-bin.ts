import type { PrismaClient } from '@/generated/prisma'
import type { BinFormValues } from '@/lib/components/configs/entities/bin/types'
import { generateBinSerial } from '@/utils/serials'

async function createBin(prisma: PrismaClient, data: BinFormValues) {
  const newID = await generateBinSerial(prisma, data.zoneId)
  const binData = { ...data, id: newID }

  return prisma.bin.create({ data: binData })
}

export { createBin }
