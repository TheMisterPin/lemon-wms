import prisma from '@/lib/prisma'
import type { ErrorType } from '@/generated/prisma'

interface LogErrorInput {
  message: string
  stack?: string | null
  type: ErrorType
  errorCode?: number | null
}

export async function logError(input: LogErrorInput) {
  try {
    await prisma.error.create({
      data: {
        message: input.message,
        stack: input.stack ?? null,
        type: input.type,
        errorCode: input.errorCode ?? null,
      },
    })
  } catch (err) {
    // Fallback to console if DB write fails — never throw from the logger
    console.error('[logError] Failed to persist error to DB:', err)
  }
}
