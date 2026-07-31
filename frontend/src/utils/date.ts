/**
 * Format an ISO date string as a short, human-readable date.
 *
 * Example: "2026-01-15" -> "Jan 15, 2026". If the input is not a valid
 * date, the original string is returned unchanged. Pure function.
 */
export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (isNaN(date.getTime())) {
    return iso
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
