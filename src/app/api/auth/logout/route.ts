import { NextRequest, NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

export const runtime = 'nodejs'

/**
 * Logout endpoint - removes token from database
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Delete the session from database
    const deleted = await prisma.session.deleteMany({
      where: { token },
    })

    if (deleted.count === 0) {
      return NextResponse.json(
        {
          error: 'Token not found or already logged out',
        },
        { status: 404 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 })
  }
}

/**
 * Logout from all devices - removes all user's tokens
 */
export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // First, verify token and get user ID
    const session = await prisma.session.findUnique({
      where: { token },
    })

    if (!session) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Delete all sessions for this user
    const deleted = await prisma.session.deleteMany({
      where: { userId: session.userId },
    })

    return NextResponse.json(
      {
        success: true,
        message: `Logged out from ${deleted.count} device(s)`,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Logout all devices error:', error)
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 })
  }
}
