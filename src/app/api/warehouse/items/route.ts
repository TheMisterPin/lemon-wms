import { NextRequest } from 'next/server'

import { fail, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import prisma from '@/lib/prisma'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50

function parsePositiveInteger(value: string | null, fallback: number) {
  if (!value) {
    return fallback
  }

  const parsedValue = Number.parseInt(value, 10)

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return fallback
  }

  return parsedValue
}

export async function GET(req: NextRequest) {
  const payload = verifyAccessTokenFromRequest(req)

  if (!payload) {
    return unauthorized()
  }

  const userID = payload.userId
  const user = await prisma.user.findUnique({ where: { id: userID } })

  if (!user) {
    return unauthorized()
  }

  const page = parsePositiveInteger(req.nextUrl.searchParams.get('page'), DEFAULT_PAGE)
  const pageSize = Math.min(
    parsePositiveInteger(req.nextUrl.searchParams.get('pageSize'), DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE
  )

  const rawQuery = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  const searchQuery = rawQuery.length >= 3 ? rawQuery : ''

  const where = searchQuery
    ? {
      deletedAt: null,
      OR: [
        { name: { contains: searchQuery, mode: 'insensitive' as const } },
        { sku: { contains: searchQuery, mode: 'insensitive' as const } },
        { barcode: { contains: searchQuery, mode: 'insensitive' as const } }
      ]
    }
    : { deletedAt: null }

  try {
    const totalItems = await prisma.item.count({ where })

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
    const currentPage = Math.min(page, totalPages)

    const items = await prisma.item.findMany({
      where,
      orderBy: [
        { name: 'asc' },
        { id: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        sku: true,
        uom: true
      },
      skip: (currentPage - 1) * pageSize,
      take: pageSize
    })

    return ok({
      items,
      pagination: {
        page: currentPage,
        pageSize,
        totalItems,
        totalPages,
        hasPreviousPage: currentPage > 1,
        hasNextPage: currentPage < totalPages
      }
    }, 'Items retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/warehouse/items]', error)

    return fail('Failed to retrieve items.', '', 500)
  }
}
