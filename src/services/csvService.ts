import type { DataRow } from '@/types';

const CSV_URL = '/data/hours-dataset.csv';

/** Parses the raw CSV text into an array of DataRow objects. */
function parseCSV(text: string): DataRow[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  // Skip the header row (index 0)
  const rows: DataRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 21) continue;

    rows.push({
      date: cols[0].trim(),
      year: Number(cols[1]),
      month: cols[2].trim(),
      monthNum: Number(cols[3]),
      weekStart: cols[4].trim(),
      dayOfWeek: cols[5].trim(),
      isWeekday: cols[6].trim().toUpperCase() === 'TRUE',
      isPublicHoliday: cols[7].trim().toUpperCase() === 'TRUE',
      publicHolidayName: cols[8].trim(),
      workType: cols[9].trim() as DataRow['workType'],
      personId: cols[10].trim(),
      personName: cols[11].trim(),
      role: cols[12].trim(),
      level: cols[13].trim(),
      practice: cols[14].trim(),
      homeLocation: cols[15].trim(),
      fte: Number(cols[16]),
      projectCode: cols[17].trim(),
      projectName: cols[18].trim(),
      allocationPct: Number(cols[19]),
      hours: Number(cols[20]),
      notes: cols.slice(21).join(',').trim(),
    });
  }
  return rows;
}

let cachedRows: DataRow[] | null = null;

/** Fetches and parses the hours dataset CSV, with in-memory caching. */
export async function getDatasetRows(): Promise<DataRow[]> {
  if (cachedRows) return cachedRows;

  const response = await fetch(CSV_URL);
  if (!response.ok) {
    throw new Error(`Failed to load dataset (HTTP ${response.status} ${response.statusText})`);
  }
  const text = await response.text();
  cachedRows = parseCSV(text);
  return cachedRows;
}
