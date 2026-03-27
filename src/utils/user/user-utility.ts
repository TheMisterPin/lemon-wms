import bcrypt from 'bcrypt'

import prisma from '@/lib/prisma'
import { BasicResponse } from '@/types/responses/basic-response'

export const getUserByEmail = async (email: string): Promise<BasicResponse> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })
    if (user) {
      return { success: true, data: user }
    } else {
      return { success: false, message: 'User not found', data: null, code: 404 }
    }
  } catch (error) {
    return { success: false, message: 'Error fetching user', error: error, data: null, code: 500 }
  }
}
export const getAllUsers = async (): Promise<BasicResponse> => {
  try {
    const users = await prisma.user.findMany()
    if (users) {
      return { success: true, data: users }
    } else {
      return { success: false, message: 'No users found', data: null, code: 404 }
    }
  } catch (error) {
    return { success: false, message: 'Error fetching users', error: error, data: null, code: 500 }
  }
}

export const checkUser = async (email: string): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })
    return !!user
  } catch (error) {
    return false
  }
}

export const checkPassword = async (email: string, password: string): Promise<BasicResponse> => {
  const result = await getUserByEmail(email)
  if (!result.success) {
    return { success: false, message: 'User not found', data: null, code: 404 }
  }

  const user = result.data

  // Check if password is hashed (bcrypt hashes start with $2b$ or $2a$)
  const isHashed = user.password.startsWith('$2')

  let isValid = false
  if (isHashed) {
    // Use bcrypt compare for hashed passwords
    isValid = await bcrypt.compare(password, user.password)
  } else {
    // MIGRATION PATH: Support plaintext passwords temporarily
    // This allows existing users to log in while we migrate
    isValid = user.password === password

    // If valid, hash the password for future logins (opportunistic migration)
    if (isValid) {
      const hashedPassword = await bcrypt.hash(password, 10)
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      })
    }
  }

  if (isValid) {
    return { success: true, data: user }
  }

  return { success: false, message: 'Incorrect password', data: null, code: 401 }
}
