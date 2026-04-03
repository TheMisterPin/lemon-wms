import { describe, expect, it } from 'vitest'

import {
  formatDate,
  formatDateTime,
  formatDateValue,
  formatTime,
  isValidDate,
  parseDateValue
} from '@/utils/formatters/date-utils'

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

describe('parseDateValue', () => {
  it('parses ISO timestamp strings into valid Date objects', () => {
    const result = parseDateValue('2025-03-15T09:45:00Z')

    expect(result).toBeInstanceOf(Date)
    expect(result?.toISOString()).toBe('2025-03-15T09:45:00.000Z')
  })

  it('returns undefined for invalid values', () => {
    expect(parseDateValue('not-a-date')).toBeUndefined()
    expect(parseDateValue(null)).toBeUndefined()
  })
})

describe('formatDateValue', () => {
  it('formats datetime values with both date and time', () => {
    const result = formatDateTime('2025-03-15T09:45:00Z')

    expect(result).toContain('2025')
    expect(result).toMatch(/march/i)
    expect(result).toMatch(/09:45|9:45/)
  })

  it('formats time-only values', () => {
    const result = formatTime('2025-03-15T21:05:00Z')

    expect(result).toMatch(/09:05|9:05/)
    expect(result).toMatch(/PM/i)
  })

  it('formats dates through the shared formatter', () => {
    const result = formatDateValue('2025-12-31T00:00:00Z', 'date')

    expect(result).toContain('2025')
    expect(result).toMatch(/december/i)
  })

  it('returns an empty string for invalid temporal values', () => {
    expect(formatDateValue('bad-input', 'datetime')).toBe('')
  })
})
