import { describe, expect, it } from 'vitest'

import {
  capitalizeFirstLetter,
  convertFromCamelCase,
  convertFromKebabCase,
  convertFromSnakeCase
} from '@/utils/formatters/string-utils'

describe('capitalizeFirstLetter', () => {
  it('capitalizes the first letter of a lowercase word', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello')
  })

  it('leaves an already-capitalized word unchanged', () => {
    expect(capitalizeFirstLetter('Hello')).toBe('Hello')
  })

  it('returns an empty string for an empty input', () => {
    expect(capitalizeFirstLetter('')).toBe('')
  })

  it('handles single-character strings', () => {
    expect(capitalizeFirstLetter('a')).toBe('A')
    expect(capitalizeFirstLetter('A')).toBe('A')
  })

  it('only capitalizes the first character, leaving the rest untouched', () => {
    expect(capitalizeFirstLetter('hELLO')).toBe('HELLO')
  })
})

describe('convertFromCamelCase', () => {
  it('inserts a space before uppercase letters', () => {
    expect(convertFromCamelCase('camelCase')).toBe('camel Case')
  })

  it('handles multiple humps', () => {
    expect(convertFromCamelCase('myVariableName')).toBe('my Variable Name')
  })

  it('returns the string unchanged when there are no uppercase letters', () => {
    expect(convertFromCamelCase('lowercase')).toBe('lowercase')
  })

  it('returns an empty string for an empty input', () => {
    expect(convertFromCamelCase('')).toBe('')
  })

  it('handles consecutive uppercase letters (acronyms) without splitting them', () => {
    // "SKU" — no lowercase→uppercase transition, so no split
    expect(convertFromCamelCase('itemSKU')).toBe('item SKU')
  })
})

describe('convertFromSnakeCase', () => {
  it('replaces underscores with spaces', () => {
    expect(convertFromSnakeCase('snake_case_string')).toBe('snake case string')
  })

  it('handles a single underscore', () => {
    expect(convertFromSnakeCase('a_b')).toBe('a b')
  })

  it('returns the string unchanged when there are no underscores', () => {
    expect(convertFromSnakeCase('nounderscores')).toBe('nounderscores')
  })

  it('returns an empty string for an empty input', () => {
    expect(convertFromSnakeCase('')).toBe('')
  })
})

describe('convertFromKebabCase', () => {
  it('replaces hyphens with spaces', () => {
    expect(convertFromKebabCase('kebab-case-string')).toBe('kebab case string')
  })

  it('handles a single hyphen', () => {
    expect(convertFromKebabCase('a-b')).toBe('a b')
  })

  it('returns the string unchanged when there are no hyphens', () => {
    expect(convertFromKebabCase('nohyphens')).toBe('nohyphens')
  })

  it('returns an empty string for an empty input', () => {
    expect(convertFromKebabCase('')).toBe('')
  })
})
