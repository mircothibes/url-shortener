/**
 * Derive a human-friendly display name from an email address.
 *
 * Takes the local part (before @), splits on separators, capitalizes each
 * word, and joins with spaces. Falls back to "User" when nothing usable.
 * Used as a fallback when the backend has no stored name.
 */
export function deriveName(email: string): string {
  const local = email.split('@')[0] || 'user'
  const pretty = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
  return pretty || 'User'
}
