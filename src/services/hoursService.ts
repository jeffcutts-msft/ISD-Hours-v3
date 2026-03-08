import type { HoursEntry, HoursSummary } from '@/types';

/**
 * Hours service — replace the stub implementations with real API calls.
 * All methods return Promises to keep the interface consistent.
 */

/** Fetches all hours entries (stub). */
export async function getHoursEntries(): Promise<HoursEntry[]> {
  // TODO: replace with fetch('/api/hours')
  return Promise.resolve([]);
}

/** Creates a new hours entry (stub). */
export async function createHoursEntry(
  entry: Omit<HoursEntry, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<HoursEntry> {
  // TODO: replace with fetch('/api/hours', { method: 'POST', body: JSON.stringify(entry) })
  const now = new Date().toISOString();
  return Promise.resolve({
    ...entry,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  });
}

/** Updates an existing hours entry (stub). */
export async function updateHoursEntry(
  id: string,
  patch: Partial<Omit<HoursEntry, 'id' | 'createdAt'>>,
): Promise<HoursEntry> {
  // TODO: replace with fetch(`/api/hours/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
  throw new Error(`updateHoursEntry(${id}) not yet implemented: ${JSON.stringify(patch)}`);
}

/** Deletes an hours entry (stub). */
export async function deleteHoursEntry(_id: string): Promise<void> {
  // TODO: replace with fetch(`/api/hours/${_id}`, { method: 'DELETE' })
  return Promise.resolve();
}

/** Fetches the summary for a given period (stub). */
export async function getHoursSummary(_period: 'week' | 'month' | 'quarter'): Promise<HoursSummary> {
  // TODO: replace with fetch(`/api/hours/summary?period=${_period}`)
  return Promise.resolve({
    totalHours: 0,
    regularHours: 0,
    overtimeHours: 0,
    onCallHours: 0,
    trainingHours: 0,
    leaveHours: 0,
    periodLabel: 'No data yet',
  });
}
