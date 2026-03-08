import type { CsvRow, DashboardData, PersonMeta, WorkType } from '@/types';

const CSV_URL = '/data/hours.csv';

/** Minimum number of columns required in a valid data row. */
const MIN_COLUMN_COUNT = 21; // columns 0-20 must exist; notes (21) is optional

/** Column indices in the CSV (0-based, after header row). */
const COL = {
  date: 0,
  year: 1,
  month: 2,
  monthNum: 3,
  weekStart: 4,
  dayOfWeek: 5,
  isWeekday: 6,
  isPublicHoliday: 7,
  publicHolidayName: 8,
  workType: 9,
  personId: 10,
  personName: 11,
  role: 12,
  level: 13,
  practice: 14,
  homeLocation: 15,
  fte: 16,
  projectCode: 17,
  projectName: 18,
  allocationPct: 19,
  hours: 20,
  notes: 21,
} as const;

/** Fetches and parses the raw CSV text. */
async function fetchRawCsv(): Promise<string> {
  const res = await fetch(CSV_URL);
  if (!res.ok) {
    throw new Error(`Failed to load CSV: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

/**
 * Splits a single CSV line into fields, respecting double-quoted fields
 * that may contain commas.
 */
function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote inside a quoted field
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

/**
 * Parses a raw CSV string into an array of CsvRow objects.
 * Skips the header row and any row where Hours is 0.
 */
export function parseCsv(raw: string): CsvRow[] {
  const lines = raw.split('\n');
  const rows: CsvRow[] = [];

  // Start at 1 to skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = splitCsvLine(line);
    if (cols.length < MIN_COLUMN_COUNT) continue;

    const hours = parseFloat(cols[COL.hours]);
    if (isNaN(hours) || hours === 0) continue;

    const workType = cols[COL.workType].trim() as WorkType;
    if (workType !== 'Actual' && workType !== 'Forecast') continue;

    rows.push({
      date: cols[COL.date].trim(),
      weekStart: cols[COL.weekStart].trim(),
      workType,
      personId: cols[COL.personId].trim(),
      personName: cols[COL.personName].trim(),
      role: cols[COL.role].trim(),
      level: cols[COL.level].trim(),
      practice: cols[COL.practice].trim(),
      homeLocation: cols[COL.homeLocation].trim(),
      fte: parseFloat(cols[COL.fte]) || 1,
      projectCode: cols[COL.projectCode].trim(),
      projectName: cols[COL.projectName].trim(),
      hours,
    });
  }

  return rows;
}

/**
 * Builds the DashboardData structure from parsed CSV rows:
 * - Unique sorted weeks
 * - Unique sorted people (by name)
 * - lookup[personId][weekStart][workType] = totalHours
 */
export function buildDashboardData(rows: CsvRow[]): DashboardData {
  const weeksSet = new Set<string>();
  const peopleMap = new Map<string, PersonMeta>();
  const lookup: DashboardData['lookup'] = {};

  for (const row of rows) {
    weeksSet.add(row.weekStart);

    if (!peopleMap.has(row.personId)) {
      peopleMap.set(row.personId, {
        personId: row.personId,
        personName: row.personName,
        role: row.role,
        level: row.level,
        practice: row.practice,
      });
    }

    if (!lookup[row.personId]) {
      lookup[row.personId] = {};
    }
    if (!lookup[row.personId][row.weekStart]) {
      lookup[row.personId][row.weekStart] = { Actual: 0, Forecast: 0 };
    }
    lookup[row.personId][row.weekStart][row.workType] =
      (lookup[row.personId][row.weekStart][row.workType] ?? 0) + row.hours;
  }

  const weeks = Array.from(weeksSet).sort();
  const people = Array.from(peopleMap.values()).sort((a, b) =>
    a.personName.localeCompare(b.personName),
  );

  return { weeks, people, lookup };
}

/** Fetches, parses, and aggregates the CSV dataset in one call. */
export async function loadDashboardData(): Promise<DashboardData> {
  const raw = await fetchRawCsv();
  const rows = parseCsv(raw);
  return buildDashboardData(rows);
}
