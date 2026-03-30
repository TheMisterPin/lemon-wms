import { NextRequest, NextResponse } from 'next/server'

import { createWarehouse } from '@/lib/entities/warehouses/create-warehouse'
import { getWarehouses } from '@/lib/entities/warehouses/get-warehouses'
import prisma from '@/lib/prisma'

export async function POST(req : NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Seeding endpoint is disabled in production.' }, { status: 403 })
  }
  const data = await req.json()
  try {
    const result = await createWarehouse(prisma, data)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Failed to create warehouse from API:', error)

    return NextResponse.json({ error: 'Failed to create warehouse.' }, { status: 500 })
  }
}
export async function GET() {
  try {
    const result = await getWarehouses(prisma)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Failed to get warehouses from API:', error)

    return NextResponse.json({ error: 'Failed to get warehouses.' }, { status: 500 })
  }
}
