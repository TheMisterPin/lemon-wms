import bcrypt from 'bcrypt'

import prisma from '@/lib/prisma'
import { BasicResponse } from '@/types/responses/basic-response'

import { checkUser } from './user-utility'

const SALT_ROUNDS = 10

export const createUser = async (name: string, email: string, password: string): Promise<BasicResponse> => {
  try {
    const existing = await checkUser(email)
    if (existing) {
      return { success: false, message: 'User already exists', data: null, code: 409 }
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    })
    return { success: true, data: user }
  } catch (error) {
    return { success: false, message: 'Error creating user', data: null, error: error, code: 500 }
  }
}
