export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T | null
  error?: {
    code: string
    details?: unknown
  }
}

// Legacy alias — kept for backwards compatibility
export type BasicResponse = ApiResponse
