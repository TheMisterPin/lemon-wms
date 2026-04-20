import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

import type { ApiResponse } from '@/types/responses/basic-response'

/**
 * ok.
 * @param data - Parameter for ok.
 * @param message - Parameter for ok.
 * @param status - Parameter for ok.
 * @returns Result from ok.
 */
export function ok<T>(data: T, message = 'Success', status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, message, data },
    { status }
  )
}

/**
 * created.
 * @param data - Parameter for created.
 * @param message - Parameter for created.
 * @returns Result from created.
 */
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

/**
 * validationFail.
 * @param error - Parameter for validationFail.
 * @returns Result from validationFail.
 */
export function validationFail(error: ZodError) {
  return fail('Validation failed.', 'VALIDATION_ERROR', 400, error.flatten())
}

/**
 * notFound.
 * @param entity - Parameter for notFound.
 * @returns Result from notFound.
 */
export function notFound(entity: string) {
  return fail(`${entity} not found.`, 'NOT_FOUND', 404)
}

/**
 * unauthorized.
 * @param message - Parameter for unauthorized.
 * @returns Result from unauthorized.
 */
export function unauthorized(message = 'Unauthorized.') {
  return fail(message, 'UNAUTHORIZED', 401)
}

/**
 * forbidden.
 * @param message - Parameter for forbidden.
 * @returns Result from forbidden.
 */
export function forbidden(message = 'Forbidden.') {
  return fail(message, 'FORBIDDEN', 403)
}

/**
 * conflict.
 * @param message - Parameter for conflict.
 * @returns Result from conflict.
 */
export function conflict(message: string) {
  return fail(message, 'CONFLICT', 409)
}
