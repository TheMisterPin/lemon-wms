import { NextResponse } from 'next/server'
import { getCategoryStockOverview } from '@/lib/catalog/categories/categories-queries'
import prisma from '@/lib/prisma'

/**
 * @swagger
 * /api/test/categories:
 *   get:
 *     summary: GET /api/test/categories
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function GET() {
  const categories = await getCategoryStockOverview(prisma)

  return NextResponse.json(categories)
}
