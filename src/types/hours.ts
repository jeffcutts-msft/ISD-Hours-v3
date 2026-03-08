/** Represents a single hours entry for a team member. */
export interface HoursEntry {
  id: string;
  userId: string;
  date: string; // ISO 8601 date string: YYYY-MM-DD
  hoursWorked: number;
  category: HoursCategory;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Categories for classifying hours. */
export type HoursCategory = 'regular' | 'overtime' | 'on-call' | 'training' | 'leave';

/** A user / team member record. */
export interface TeamMember {
  id: string;
  displayName: string;
  email: string;
  role: string;
}

/** Summary statistics for a given period. */
export interface HoursSummary {
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  onCallHours: number;
  trainingHours: number;
  leaveHours: number;
  periodLabel: string;
}

// ── CSV dataset types ──────────────────────────────────────────────────────

/** Work type discriminator in the CSV. */
export type WorkType = 'Actual' | 'Forecast';

/** A single parsed row from the CSV dataset. */
export interface CsvRow {
  date: string; // YYYY-MM-DD
  weekStart: string; // YYYY-MM-DD (Monday of that week)
  workType: WorkType;
  personId: string;
  personName: string;
  role: string; // Consultant | Architect | Project Manager
  level: string;
  practice: string;
  homeLocation: string;
  fte: number;
  projectCode: string;
  projectName: string;
  hours: number;
}

/** Aggregated hours for one person in one week, for one WorkType. */
export interface PersonWeekData {
  personId: string;
  personName: string;
  role: string;
  weekStart: string; // YYYY-MM-DD
  workType: WorkType;
  totalHours: number;
}

/**
 * All unique weeks and people extracted from the dataset,
 * plus a quick-lookup map: `personId -> weekStart -> WorkType -> totalHours`.
 */
export interface DashboardData {
  weeks: string[]; // sorted YYYY-MM-DD week-start dates
  people: PersonMeta[]; // sorted by name
  /** lookup[personId][weekStart][workType] = totalHours */
  lookup: Record<string, Record<string, Record<WorkType, number>>>;
}

/** Lightweight person metadata used in dashboard tables. */
export interface PersonMeta {
  personId: string;
  personName: string;
  role: string;
  level: string;
  practice: string;
}
