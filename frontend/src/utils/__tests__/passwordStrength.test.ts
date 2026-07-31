import { describe, it, expect } from 'vitest'
import { getPasswordStrength } from '../passwordStrength'

describe('getPasswordStrength', () => {
  it('rates short passwords as weak', () => {
    expect(getPasswordStrength('')).toBe('weak')
    expect(getPasswordStrength('abc')).toBe('weak')
    expect(getPasswordStrength('1234567')).toBe('weak')
  })

  it('rates 8-11 char passwords as medium', () => {
    expect(getPasswordStrength('abcdefgh')).toBe('medium')
    expect(getPasswordStrength('abcdefghijk')).toBe('medium')
  })

  it('rates long passwords with upper and digit as strong', () => {
    expect(getPasswordStrength('Abcdefgh1234')).toBe('strong')
  })

  it('rates long passwords without mix as medium', () => {
    expect(getPasswordStrength('abcdefghijkl')).toBe('medium')
    expect(getPasswordStrength('ABCDEFGHIJKL')).toBe('medium')
  })

  it('uses the length-8 boundary correctly', () => {
    expect(getPasswordStrength('1234567')).toBe('weak')
    expect(getPasswordStrength('12345678')).toBe('medium')
  })
})
