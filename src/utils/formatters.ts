/**
 * Formats a decimal hours value into a human-readable "Xh Ym" string.
 * @example formatDuration(8.75) // "8h 45m"
 */
export function formatDuration(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Returns an ISO 8601 date string (YYYY-MM-DD) for the given Date object.
 * Defaults to today if no date is provided.
 */
export function toISODate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

/**
 * Returns a display-friendly date string, e.g. "Mon, 3 Mar 2025".
 */
export function formatDisplayDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Rounds a number to one decimal place. */
export function roundOne(n: number): number {
  return Math.round(n * 10) / 10;
}
