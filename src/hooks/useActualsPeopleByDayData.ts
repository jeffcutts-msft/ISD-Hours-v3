import { useEffect, useMemo, useState } from 'react';
import { getDatasetRows } from '@/services/csvService';
import type { DataRow } from '@/types';
import { roundOne } from '@/utils';

export interface PersonWeekRow {
  personId: string;
  personName: string;
  role: string;
  dailyHours: Record<string, number>;
  totalHours: number;
}

export interface ActualsPeopleByDayData {
  isLoading: boolean;
  error: string | null;
  weekStarts: string[];
  selectedWeekStart: string | null;
  weekDates: string[];
  personWeekRows: PersonWeekRow[];
}

function parseIsoDate(isoDate: string): Date | null {
  const [yearPart, monthPart, dayPart] = isoDate.split('-');
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

function toIsoDate(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getSaturdayWeekStart(isoDate: string): string {
  const date = parseIsoDate(isoDate);
  if (!date) {
    return isoDate;
  }

  const dayOfWeek = date.getDay();
  const daysSinceSaturday = (dayOfWeek + 1) % 7;
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - daysSinceSaturday);

  return toIsoDate(weekStart);
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
  const date = parseIsoDate(isoDate);
  if (!date) {
    return isoDate;
  }

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function useActualsPeopleByDayData(targetWeekStart: string | null): ActualsPeopleByDayData {
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
          console.error('[useActualsPeopleByDayData]', err);
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

  const weekStarts = useMemo<string[]>(() => {
    const weekSet = new Set<string>();
    for (const row of rows) {
      weekSet.add(getSaturdayWeekStart(row.date));
    }

    return Array.from(weekSet).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const selectedWeekStart = useMemo<string | null>(() => {
    if (weekStarts.length === 0) {
      return null;
    }

    if (targetWeekStart && weekStarts.includes(targetWeekStart)) {
      return targetWeekStart;
    }

    return weekStarts[0];
  }, [targetWeekStart, weekStarts]);

  const daySet = useMemo(() => {
    if (!selectedWeekStart) {
      return new Set<string>();
    }

    const set = new Set<string>();
    for (const row of rows) {
      if (getSaturdayWeekStart(row.date) === selectedWeekStart) {
        set.add(row.date);
      }
    }

    return set;
  }, [rows, selectedWeekStart]);

  const weekDates = useMemo<string[]>(() => {
    return Array.from(daySet).sort((a, b) => a.localeCompare(b));
  }, [daySet]);

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
      if (getSaturdayWeekStart(row.date) !== selectedWeekStart) {
        continue;
      }

      const current = personMap.get(row.personId) ?? {
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
    weekStarts,
    selectedWeekStart,
    weekDates,
    personWeekRows,
  };
}
