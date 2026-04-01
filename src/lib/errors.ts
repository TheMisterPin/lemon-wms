/**
 * Domain error thrown by entity functions when a business rule is violated.
 * API routes catch this and return a structured error response.
 */
export class DomainError extends Error {
  readonly code: string
  readonly status: number

  constructor(message: string, code: string, status = 400) {
    super(message)
    this.name = 'DomainError'
    this.code = code
    this.status = status
  }
}
