import { describe, it, expect } from 'vitest'
import { isValidUrl } from '../url'

describe('isValidUrl', () => {
  it('accepts valid http and https URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
    expect(isValidUrl('http://example.com/path?q=1')).toBe(true)
    expect(isValidUrl('https://sub.domain.co.uk/a/b')).toBe(true)
  })

  it('rejects strings that are not URLs', () => {
    expect(isValidUrl('')).toBe(false)
    expect(isValidUrl('not a url')).toBe(false)
    expect(isValidUrl('example.com')).toBe(false)
    expect(isValidUrl('//missing-scheme.com')).toBe(false)
  })

  it('accepts non-http schemes the URL constructor allows', () => {
    expect(isValidUrl('ftp://files.example.com')).toBe(true)
    expect(isValidUrl('mailto:test@example.com')).toBe(true)
  })
})
