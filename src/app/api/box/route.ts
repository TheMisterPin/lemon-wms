import { NextRequest, NextResponse } from 'next/server'

import { getAuthFromRequest } from '@/utils/auth'
import { createBox, getBoxesByLocation, getBoxesByUser } from '@/utils/box'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req)
    if (!auth.valid || !auth.userId) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const { name, description, locationId, closedImage, contentsImage } = await req.json()

    if (!name || !locationId) {
      return NextResponse.json({ error: 'Name and locationId are required' }, { status: 400 })
    }

    const result = await createBox(
      auth.userId,
      locationId,
      name,
      description,
      closedImage,
      contentsImage,
    )
    if (result.success) {
      return NextResponse.json(result.data, { status: 201 })
    }

    return NextResponse.json({ error: result.message }, { status: result.code || 400 })
  } catch (error) {
    console.error('Failed to create box', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create box' },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req)
    if (!auth.valid || !auth.userId) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const locationId = req.nextUrl.searchParams.get('locationId')
    const result = locationId
      ? await getBoxesByLocation(auth.userId, locationId)
      : await getBoxesByUser(auth.userId)
    if (result.success) {
      return NextResponse.json(result.data, { status: 200 })
    }

    return NextResponse.json({ error: result.message }, { status: result.code || 400 })
  } catch (error) {
    console.error('Failed to fetch boxes', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch boxes' },
      { status: 500 },
    )
  }
}
