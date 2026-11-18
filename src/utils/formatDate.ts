/**
 * Formats an ISO date (`YYYY-MM-DD`) as a long date: "30 noiembrie 2027" in
 * Romanian by default, "30 November 2027" with `en-GB`.
 */
export function formatLongDate(iso: string, locale = 'ro-RO'): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso));
}
