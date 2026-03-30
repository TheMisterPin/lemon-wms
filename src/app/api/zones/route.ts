import { NextResponse } from 'next/server'

import { getZones } from '@/lib/entities/zones/get-zones'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const zones = await getZones(prisma)
    const warehouseList = await prisma.warehouse.findMany({ select: { name: true } })

    return NextResponse.json({ success: true, data: { zones: zones, warehouseList: warehouseList } })
  } catch (error) {
    console.error('Failed to get zones from API:', error)

    return NextResponse.json({ error: 'Failed to get zones.' }, { status: 500 })
  }
}
