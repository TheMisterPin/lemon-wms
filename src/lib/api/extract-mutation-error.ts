import { AxiosError } from 'axios'

import type { MutationError } from '@/types/errors'
import type { ApiResponse } from '@/types/responses/basic-response'

export function extractMutationError(err: unknown): MutationError {
  if (err instanceof AxiosError && err.response?.data) {
    const body = err.response.data as ApiResponse<null>

    return {
      message: body.message ?? 'An unexpected error occurred.',
      code: body.error?.code,
      details: body.error?.details
    }
  }

  if (err instanceof Error) {
    return { message: err.message }
  }

  return { message: 'An unexpected error occurred.' }
}
