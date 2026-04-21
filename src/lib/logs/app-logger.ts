function formatContext(context: string) {
  return context.startsWith('[') ? context : `[${context}]`
}

/**
 * logAppError.
 * @param context - Parameter for logAppError.
 * @param error - Parameter for logAppError.
 */
export function logAppError(context: string, error?: unknown) {
  if (typeof error === 'undefined') {
    console.error(formatContext(context))

    return
  }

  console.error(formatContext(context), error)
}
