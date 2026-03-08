/** Represents one row from the hours dataset CSV. */
export interface DataRow {
  date: string;
  year: number;
  month: string;
  monthNum: number;
  weekStart: string;
  dayOfWeek: string;
  isWeekday: boolean;
  isPublicHoliday: boolean;
  publicHolidayName: string;
  workType: 'Actual' | 'Forecast';
  personId: string;
  personName: string;
  role: string;
  level: string;
  practice: string;
  homeLocation: string;
  fte: number;
  projectCode: string;
  projectName: string;
  allocationPct: number;
  hours: number;
  notes: string;
}

/** Aggregated hours total for a period label (e.g. a month). */
export interface PeriodTotal {
  period: string;
  hours: number;
}

/** Actual vs Forecast comparison for a period. */
export interface ActualVsForecast {
  period: string;
  actual: number;
  forecast: number;
  variance: number;
}
