import { z } from 'zod'

import { ok, fail, validationFail } from '@/lib/api/response'
import { logError } from '@/lib/loggers/error'

const errorSchema = z.object({
  message: z.string().min(1),
  stack: z.string().optional(),
  type: z.enum(['CLIENT', 'SERVER', 'NETWORK', 'UNKNOWN']),
  errorCode: z.number().int().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = errorSchema.safeParse(body)

    if (!parsed.success) {
      return validationFail(parsed.error)
    }

    await logError(parsed.data)

    return ok(null, 'Error logged.')
  } catch (error) {
    console.error('[POST /api/errors]', error)
    return fail('Failed to log error.')
  }
}
