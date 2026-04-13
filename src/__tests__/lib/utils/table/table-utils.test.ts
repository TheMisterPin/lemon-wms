import { describe, expect, it } from 'vitest'

import {
  buildRowSearchText,
  evaluateOperation,
  evaluateStyleCondition,
  filterRowsBySearch,
  resolveColumnStyleClassNames,
  shouldHideDataColumnForDataset,
  sortRowsByDataColumn
} from '@/lib/utils/table'
import type { DataColumnConfig } from '@/types/components/table/column.types'

describe('evaluateOperation', () => {
  const row = { id: '1', a: 10, b: 2, c: 0 }

  it('adds', () => {
    const tv = { operation: '+' as const, values: ['a', 'b'] }

    expect(evaluateOperation(row, tv)).toBe(12)
  })

  it('divides left-associatively', () => {
    const tv = { operation: '/' as const, values: ['a', 'b'] }

    expect(evaluateOperation(row, tv)).toBe(5)
  })

  it('returns undefined on divide by zero', () => {
    const tv = { operation: '/' as const, values: ['a', 'c'] }

    expect(evaluateOperation(row, tv)).toBeUndefined()
  })

  it('fraction uses first two paths', () => {
    const tv = { operation: 'fraction' as const, values: ['a', 'b'] }

    expect(evaluateOperation(row, tv)).toBe(5)
  })

  it('fraction undefined when denominator zero', () => {
    const tv = { operation: 'fraction' as const, values: ['a', 'c'] }

    expect(evaluateOperation(row, tv)).toBeUndefined()
  })
})

describe('sortRowsByDataColumn', () => {
  const rows = [
    { id: 'a', n: 3 },
    { id: 'b', n: null },
    { id: 'c', n: 1 }
  ]
  const col: DataColumnConfig = { label: 'N', accessor: 'n', type: 'number', typeValues: { mode: 'int' } }

  it('orders nulls last ascending', () => {
    const sorted = sortRowsByDataColumn(rows, col, 'asc').map(r => r.id)

    expect(sorted).toEqual(['c', 'a', 'b'])
  })

  it('orders nulls last descending', () => {
    const sorted = sortRowsByDataColumn(rows, col, 'desc').map(r => r.id)

    expect(sorted).toEqual(['a', 'c', 'b'])
  })

  it('uses progress ratio', () => {
    const pr = [
      { id: 'x', c: 50, m: 100 },
      { id: 'y', c: 25, m: 50 },
      { id: 'z', c: 1, m: 10 }
    ]
    const pcol: DataColumnConfig = {
      label: 'P',
      accessor: 'c',
      type: 'progress',
      typeValues: { current: 'c', max: 'm' }
    }

    const asc = sortRowsByDataColumn(pr, pcol, 'asc').map(r => r.id)

    expect(asc).toEqual(['z', 'x', 'y'])
  })
})

describe('compareRowsByDataColumn tie-breaker', () => {
  it('uses id when sort keys equal', () => {
    const rows = [
      { id: 'b', v: 1 },
      { id: 'a', v: 1 }
    ]
    const col: DataColumnConfig = { label: 'V', accessor: 'v', type: 'number', typeValues: { mode: 'int' } }

    const sorted = sortRowsByDataColumn(rows, col, 'asc').map(r => r.id)

    expect(sorted).toEqual(['a', 'b'])
  })
})

describe('filterRowsBySearch', () => {
  const columns: DataColumnConfig[] = [
    { label: 'Name', accessor: 'name', type: 'text' },
    { label: 'Code', accessor: 'code', type: 'text' }
  ]
  const records = [
    { id: '1', name: 'Alpha', code: 'A1' },
    { id: '2', name: 'Beta', code: 'B2' }
  ]

  it('filters case-insensitive substring', () => {
    const out = filterRowsBySearch(records, columns, 'beta')

    expect(out.map(r => r.id)).toEqual(['2'])
  })

  it('respects search.fields', () => {
    const out = filterRowsBySearch(records, columns, 'a1', { fields: ['code'] })

    expect(out.map(r => r.id)).toEqual(['1'])
  })
})

describe('buildRowSearchText', () => {
  it('joins column display strings with separator', () => {
    const columns: DataColumnConfig[] = [
      { label: 'A', accessor: 'a', type: 'text' },
      { label: 'B', accessor: 'b', type: 'text' }
    ]
    const row = { id: '1', a: 'x', b: 'y' }
    const text = buildRowSearchText(row, columns)

    expect(text.includes('x')).toBe(true)
    expect(text.includes('y')).toBe(true)
  })
})

describe('shouldHideDataColumnForDataset', () => {
  const col: DataColumnConfig = {
    label: 'X',
    accessor: 'x',
    type: 'text',
    hideIfNulls: true
  }

  it('does not hide when some row has value', () => {
    const records = [{ id: '1', x: '' }, { id: '2', x: 'hi' }]

    expect(shouldHideDataColumnForDataset(col, records)).toBe(false)
  })

  it('hides when all rows empty', () => {
    const records = [{ id: '1', x: '' }, { id: '2', x: null }]

    expect(shouldHideDataColumnForDataset(col, records)).toBe(true)
  })
})

describe('evaluateStyleCondition', () => {
  it('truthy excludes empty string', () => {
    expect(evaluateStyleCondition('truthy', 'x')).toBe(true)
    expect(evaluateStyleCondition('truthy', '')).toBe(false)
  })

  it('positive detects numbers', () => {
    expect(evaluateStyleCondition('positive', 3)).toBe(true)
    expect(evaluateStyleCondition('positive', -1)).toBe(false)
  })
})

describe('resolveColumnStyleClassNames', () => {
  it('merges base and first matching rule', () => {
    const className = resolveColumnStyleClassNames(
      {
        className: 'a',
        styleIf: [{ condition: 'eq', value: 1, className: 'b' }]
      },
      1
    )

    expect(className).toBe('a b')
  })
})
