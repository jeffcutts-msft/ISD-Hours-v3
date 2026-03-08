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
