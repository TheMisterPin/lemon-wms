import { describe, expect, it } from 'vitest'

import { formatDate, isValidDate } from '@/utils/formatters/date-utils'

describe('formatDate', () => {
  it('formats a valid date in long US format', () => {
    const result = formatDate(new Date('2025-03-15'))
    // en-US long month: "March 15, 2025" or "15 March 2025" depending on locale
    expect(result).toContain('2025')
    expect(result).toContain('15')
    expect(result).toMatch(/march/i)
  })

  it('returns an empty string for undefined', () => {
    expect(formatDate(undefined)).toBe('')
  })

  it('handles the start of the year correctly', () => {
    const result = formatDate(new Date('2025-01-01'))
    expect(result).toContain('2025')
    expect(result).toMatch(/january/i)
  })

  it('handles the end of the year correctly', () => {
    const result = formatDate(new Date('2025-12-31'))
    expect(result).toContain('2025')
    expect(result).toMatch(/december/i)
  })
})

describe('isValidDate', () => {
  it('returns true for a valid Date object', () => {
    expect(isValidDate(new Date('2025-06-01'))).toBe(true)
  })

  it('returns false for undefined', () => {
    expect(isValidDate(undefined)).toBe(false)
  })

  it('returns false for an invalid Date (NaN)', () => {
    expect(isValidDate(new Date('not-a-date'))).toBe(false)
  })

  it('returns true for dates in the distant past and future', () => {
    expect(isValidDate(new Date('1970-01-01'))).toBe(true)
    expect(isValidDate(new Date('2099-12-31'))).toBe(true)
  })
})
