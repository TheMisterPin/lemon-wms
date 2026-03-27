
import { NextRequest, NextResponse } from 'next/server'

import { getAuthFromRequest } from '@/utils/auth'
import { createLocation, getLocations } from '@/utils/location'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req)
    if (!auth.valid || !auth.userId) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const { name } = await req.json()

    console.log(`User ${auth.email} (${auth.userId}) creating location: ${name}`)

    const result = await createLocation(auth.userId, name)
    if (result.success) {
      return NextResponse.json(result.data, { status: 201 })
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req)
    if (!auth.valid || !auth.userId) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    console.log(`User ${auth.email} (${auth.userId}) fetching locations`)

    const result = await getLocations(auth.userId)
    if (result.success) {
      return NextResponse.json(result.data, { status: 200 })
    } else {
      return NextResponse.json({ error: result.message }, { status: result.code || 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
  }
}
