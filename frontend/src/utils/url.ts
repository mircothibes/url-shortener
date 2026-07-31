/**
 * URL validation helper.
 *
 * Uses the built-in URL constructor to check whether a string is a valid,
 * parseable URL. Pure function.
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
