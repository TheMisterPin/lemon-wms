import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

import type { ApiResponse } from '@/types/responses/basic-response'

export function ok<T>(data: T, message = 'Success', status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, message, data },
    { status }
  )
}

export function created<T>(data: T, message = 'Created successfully.') {
  return ok(data, message, 201)
}

export function fail(
  message: string,
  code = 'INTERNAL_ERROR',
  status = 500,
  details?: unknown
) {
  return NextResponse.json<ApiResponse<null>>(
    { success: false, message, data: null, error: { code, details } },
    { status }
  )
}

export function validationFail(error: ZodError) {
  return fail('Validation failed.', 'VALIDATION_ERROR', 400, error.flatten())
}

export function notFound(entity: string) {
  return fail(`${entity} not found.`, 'NOT_FOUND', 404)
}

export function unauthorized(message = 'Unauthorized.') {
  return fail(message, 'UNAUTHORIZED', 401)
}

export function forbidden(message = 'Forbidden.') {
  return fail(message, 'FORBIDDEN', 403)
}

export function conflict(message: string) {
  return fail(message, 'CONFLICT', 409)
}
