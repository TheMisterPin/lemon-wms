import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { seedUsers } from '@/lib/seeding/users'

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Seeding endpoint is disabled in production.' }, { status: 403 })
  }

  try {
    const result = await seedUsers(prisma)

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('Failed to seed users from API:', error)

    return NextResponse.json({ error: 'Failed to seed users.' }, { status: 500 })
  }
}
