import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { PrismaClient } from '../generated/prisma'
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}
const prisma = globalForPrisma.prisma ?? (() => {
  const connectionString = process.env.DATABASE_URL ?? 'postgresql://localhost:5432/wms_db'

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)

  return new PrismaClient({ adapter })
})()
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
export default prisma
