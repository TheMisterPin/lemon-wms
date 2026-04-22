import { NextResponse } from 'next/server'
import { getWarehouseHomeData } from '@/lib/locations/warehouses/warehouses-queries'
import prisma from '@/lib/prisma'

/**
 * @swagger
 * /api/test/pages/dashboard/home:
 *   get:
 *     summary: GET /api/test/pages/dashboard/home
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function GET() {
  const data = await getWarehouseHomeData(prisma)

  return NextResponse.json(data)
}
