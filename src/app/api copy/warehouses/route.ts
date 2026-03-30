import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { warehouseFormSchema } from '@/lib/components/configs/entities/warehouse/schema'
import { createWarehouse } from '@/lib/entities/warehouses/create-warehouse'
import { getWarehouses } from '@/lib/entities/warehouses/get-warehouses'
import prisma from '@/lib/prisma'

const createWarehouseRequestSchema = warehouseFormSchema.pick({
  name: true
})

export async function POST(req : NextRequest) {

  try {
    const rawdata = createWarehouseRequestSchema.parse(await req.json())
    const data = rawdata.name
    const result = await createWarehouse(prisma, { name: data })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid warehouse payload.', details: error.flatten() }, { status: 400 })
    }

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
