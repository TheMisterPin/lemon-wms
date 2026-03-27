import { NextRequest, NextResponse } from 'next/server'

import { getAuthFromRequest } from '@/utils/auth'
import { deleteBox, getBoxById, updateBox } from '@/utils/box'

export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const boxId = params?.id ?? req.nextUrl.pathname.split('/').pop()
    if (!boxId) {
      return NextResponse.json({ error: 'Box id is required' }, { status: 400 })
    }

    const auth = await getAuthFromRequest(req)
    if (!auth.valid || !auth.userId) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const result = await getBoxById(auth.userId, boxId)
    if (result.success) {
      return NextResponse.json(result.data, { status: 200 })
    }

    return NextResponse.json({ error: result.message }, { status: result.code || 404 })
  } catch (error) {
    console.error('Failed to fetch box', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch box' },
      { status: 500 },
    )
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const boxId = params?.id ?? req.nextUrl.pathname.split('/').pop()
    if (!boxId) {
      return NextResponse.json({ error: 'Box id is required' }, { status: 400 })
    }

    const auth = await getAuthFromRequest(req)
    if (!auth.valid || !auth.userId) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const { name, description, closedImage, contentsImage } = await req.json()

    const result = await updateBox(auth.userId, boxId, {
      name,
      description,
      closedImage,
      contentsImage,
    })
    if (result.success) {
      return NextResponse.json(result.data, { status: 200 })
    }

    return NextResponse.json({ error: result.message }, { status: result.code || 400 })
  } catch (error) {
    console.error('Failed to update box', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update box' },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const boxId = params?.id ?? req.nextUrl.pathname.split('/').pop()
    if (!boxId) {
      return NextResponse.json({ error: 'Box id is required' }, { status: 400 })
    }

    const auth = await getAuthFromRequest(req)
    if (!auth.valid || !auth.userId) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const result = await deleteBox(auth.userId, boxId)
    if (result.success) {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    return NextResponse.json({ error: result.message }, { status: result.code || 400 })
  } catch (error) {
    console.error('Failed to delete box', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete box' },
      { status: 500 },
    )
  }
}
