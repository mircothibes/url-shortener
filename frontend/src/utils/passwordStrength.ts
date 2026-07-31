/**
 * Password strength estimation.
 *
 * Returns a qualitative strength label based on length and character mix.
 * Pure function — no side effects, easy to unit test.
 */
export type PasswordStrength = 'weak' | 'medium' | 'strong'

export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < 8) return 'weak'
  if (password.length < 12) return 'medium'
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return 'strong'
  return 'medium'
}
