import { NextRequest, NextResponse } from 'next/server'

import { getAuthFromRequest } from '@/utils/auth'
import { deleteLocation, updateLocation } from '@/utils/location'

export const runtime = 'nodejs'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthFromRequest(req)
    if (!auth.valid || !auth.userId) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const { name, icon } = await req.json()

    const result = await updateLocation(auth.userId, params.id, { name, icon })
    if (result.success) {
      return NextResponse.json(result.data, { status: 200 })
    }

    return NextResponse.json({ error: result.message }, { status: result.code || 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthFromRequest(req)
    if (!auth.valid || !auth.userId) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const result = await deleteLocation(auth.userId, params.id)
    if (result.success) {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    return NextResponse.json({ error: result.message }, { status: result.code || 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 })
  }
}
