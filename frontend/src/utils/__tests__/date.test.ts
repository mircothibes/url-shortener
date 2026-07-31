import { describe, it, expect } from 'vitest'
import { formatDate } from '../date'

describe('formatDate', () => {
  it('formats a valid ISO date as short US format', () => {
    expect(formatDate('2026-01-15')).toBe('Jan 15, 2026')
  })

  it('returns the original string for an invalid date', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
    expect(formatDate('')).toBe('')
  })
})
