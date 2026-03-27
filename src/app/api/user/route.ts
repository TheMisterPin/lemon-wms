
import { NextRequest, NextResponse } from 'next/server'

import { getAuthFromRequest } from '@/utils/auth'
import { createUser, getAllUsers } from '@/utils/user'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json()
  try {
    const result = await createUser(name, email, password)
    if (result.success) {
      // Exclude password from response
      const { password: _, ...userWithoutPassword } = result.data
      return NextResponse.json({ user: userWithoutPassword }, { status: 201 })
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req)
    if (!auth.valid || !auth.userId) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    console.log(`User ${auth.email} (${auth.userId}) fetching all users`)

    const users = await getAllUsers()
    if (users.success) {
      // Exclude passwords from response
      const usersWithoutPasswords = (users.data as any[]).map((user) => {
        const { password, ...userWithoutPassword } = user
        return userWithoutPassword
      })
      return NextResponse.json(usersWithoutPasswords, { status: 200 })
    } else {
      return NextResponse.json({ error: users.message }, { status: users.code || 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
