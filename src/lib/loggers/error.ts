import type { ErrorType } from '@/generated/prisma'
import prisma from '@/lib/prisma'

interface LogErrorInput {
  message: string
  stack?: string | null
  type: ErrorType
  errorCode?: number | null
}

/**
 * logError.
 * @param input - Parameter for logError.
 * @returns Result from logError.
 */
export async function logError(input: LogErrorInput) {
  try {
    await prisma.error.create({
      data: {
        message: input.message,
        stack: input.stack ?? null,
        type: input.type,
        errorCode: input.errorCode ?? null
      }
    })
  } catch (err) {
    // Fallback to console if DB write fails — never throw from the logger
    console.error('[logError] Failed to persist error to DB:', err)
  }
}
