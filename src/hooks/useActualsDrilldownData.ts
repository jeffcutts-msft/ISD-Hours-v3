import { useEffect, useMemo, useState } from 'react';
import { getDatasetRows } from '@/services/csvService';
import type { DataRow } from '@/types';
import { roundOne } from '@/utils';

export interface MonthSummary {
  id: string;
  label: string;
  year: number;
  monthNum: number;
  month: string;
  totalHours: number;
  weekCount: number;
  peopleCount: number;
}

export interface WeekSummary {
  weekStart: string;
  monthId: string;
  totalHours: number;
  peopleCount: number;
  dayCount: number;
}

export interface DaySummary {
  date: string;
  totalHours: number;
  peopleCount: number;
}

export interface PersonWeekRow {
  personId: string;
  personName: string;
  role: string;
  dailyHours: Record<string, number>;
  totalHours: number;
}

export interface ActualsDrilldownData {
  isLoading: boolean;
  error: string | null;
  monthSummaries: MonthSummary[];
  weekSummaries: WeekSummary[];
  daySummaries: DaySummary[];
  weekDates: string[];
  personWeekRows: PersonWeekRow[];
}

function toMonthId(row: DataRow): string {
  return `${row.year}-${String(row.monthNum).padStart(2, '0')}`;
}

export function useActualsDrilldownData(selectedMonthId: string | null, selectedWeekStart: string | null): ActualsDrilldownData {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<DataRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getDatasetRows()
      .then((allRows) => {
        if (!cancelled) {
          const actualRows = allRows.filter((row) => row.workType === 'Actual');
          setRows(actualRows);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load data.');
          console.error('[useActualsDrilldownData]', err);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const monthSummaries = useMemo<MonthSummary[]>(() => {
    const monthMap = new Map<
      string,
      {
        year: number;
        monthNum: number;
        month: string;
        totalHours: number;
        weeks: Set<string>;
        people: Set<string>;
      }
    >();

    for (const row of rows) {
      const monthId = toMonthId(row);
      const current =
        monthMap.get(monthId) ??
        {
          year: row.year,
          monthNum: row.monthNum,
          month: row.month,
          totalHours: 0,
          weeks: new Set<string>(),
          people: new Set<string>(),
        };

      current.totalHours += row.hours;
      current.weeks.add(row.weekStart);
      current.people.add(row.personId);
      monthMap.set(monthId, current);
    }

    return Array.from(monthMap.entries())
      .map(([id, data]) => ({
        id,
        label: `${data.month} ${data.year}`,
        year: data.year,
        monthNum: data.monthNum,
        month: data.month,
        totalHours: roundOne(data.totalHours),
        weekCount: data.weeks.size,
        peopleCount: data.people.size,
      }))
      .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.monthNum - b.monthNum));
  }, [rows]);

  const weekSummaries = useMemo<WeekSummary[]>(() => {
    if (!selectedMonthId) {
      return [];
    }

    const weekMap = new Map<
      string,
      {
        totalHours: number;
        people: Set<string>;
        dates: Set<string>;
      }
    >();

    for (const row of rows) {
      if (toMonthId(row) !== selectedMonthId) {
        continue;
      }

      const current =
        weekMap.get(row.weekStart) ?? {
          totalHours: 0,
          people: new Set<string>(),
          dates: new Set<string>(),
        };

      current.totalHours += row.hours;
      current.people.add(row.personId);
      current.dates.add(row.date);
      weekMap.set(row.weekStart, current);
    }

    return Array.from(weekMap.entries())
      .map(([weekStart, data]) => ({
        weekStart,
        monthId: selectedMonthId,
        totalHours: roundOne(data.totalHours),
        peopleCount: data.people.size,
        dayCount: data.dates.size,
      }))
      .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  }, [rows, selectedMonthId]);

  const daySummaries = useMemo<DaySummary[]>(() => {
    if (!selectedWeekStart) {
      return [];
    }

    const dayMap = new Map<string, { totalHours: number; people: Set<string> }>();

    for (const row of rows) {
      if (row.weekStart !== selectedWeekStart) {
        continue;
      }

      const current = dayMap.get(row.date) ?? { totalHours: 0, people: new Set<string>() };
      current.totalHours += row.hours;
      current.people.add(row.personId);
      dayMap.set(row.date, current);
    }

    return Array.from(dayMap.entries())
      .map(([date, data]) => ({
        date,
        totalHours: roundOne(data.totalHours),
        peopleCount: data.people.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [rows, selectedWeekStart]);

  const weekDates = useMemo<string[]>(() => daySummaries.map((day) => day.date), [daySummaries]);

  const personWeekRows = useMemo<PersonWeekRow[]>(() => {
    if (!selectedWeekStart) {
      return [];
    }

    const personMap = new Map<
      string,
      {
        personId: string;
        personName: string;
        role: string;
        dailyHours: Record<string, number>;
        totalHours: number;
      }
    >();

    for (const row of rows) {
      if (row.weekStart !== selectedWeekStart) {
        continue;
      }

      const current =
        personMap.get(row.personId) ??
        {
          personId: row.personId,
          personName: row.personName,
          role: row.role,
          dailyHours: {},
          totalHours: 0,
        };

      current.dailyHours[row.date] = roundOne((current.dailyHours[row.date] ?? 0) + row.hours);
      current.totalHours = roundOne(current.totalHours + row.hours);
      personMap.set(row.personId, current);
    }

    return Array.from(personMap.values()).sort((a, b) => a.personName.localeCompare(b.personName));
  }, [rows, selectedWeekStart]);

  return {
    isLoading,
    error,
    monthSummaries,
    weekSummaries,
    daySummaries,
    weekDates,
    personWeekRows,
  };
}

export function getWeekStatusClass(totalHours: number): 'high' | 'medium' | 'low' | 'normal' {
  if (totalHours > 36) {
    return 'high';
  }

  if (totalHours >= 24 && totalHours <= 26) {
    return 'medium';
  }

  if (totalHours < 23) {
    return 'low';
  }

  return 'normal';
}

export function formatIsoDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
