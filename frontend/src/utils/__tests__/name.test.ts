import { describe, it, expect } from 'vitest'
import { deriveName } from '../name'

describe('deriveName', () => {
  it('capitalizes a simple local part', () => {
    expect(deriveName('john@example.com')).toBe('John')
  })

  it('splits separators into words and capitalizes each', () => {
    expect(deriveName('john.doe@example.com')).toBe('John Doe')
    expect(deriveName('jane_smith@example.com')).toBe('Jane Smith')
    expect(deriveName('a-b-c@example.com')).toBe('A B C')
  })

  it('falls back to "User" when the local part is empty', () => {
    expect(deriveName('@example.com')).toBe('User')
  })

  it('handles an email with no domain', () => {
    expect(deriveName('mirco')).toBe('Mirco')
  })
})
