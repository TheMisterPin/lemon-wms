
import { NextRequest, NextResponse } from 'next/server'

import jwt from 'jsonwebtoken'

import prisma from '@/lib/prisma'
import { checkPassword } from '@/utils/user'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const TOKEN_EXPIRY_DAYS = 7

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    // Step 1: Verify user credentials
    const result = await checkPassword(email, password)
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    const user = result.data

    // Step 2: Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' },
    )

    // Step 3: Extract device information
    const userAgent = req.headers.get('user-agent') || 'Unknown'
    const ipAddress =
      req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown'

    // Step 4: Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS)

    // Step 5: Store session in database
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        deviceInfo: userAgent,
        ipAddress,
        expiresAt,
        lastUsedAt: new Date(),
      },
    })

    // Step 6: Return user data and token (exclude password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        user: userWithoutPassword,
        token,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 })
  }
}
