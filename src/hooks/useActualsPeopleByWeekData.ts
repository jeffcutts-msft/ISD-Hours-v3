import { useEffect, useMemo, useState } from 'react';
import { getDatasetRows } from '@/services/csvService';
import type { DataRow } from '@/types';
import { roundOne } from '@/utils';
import { getWeekStatusClass } from '@/hooks/useActualsPeopleByDayData';

export interface PersonWindowRow {
  personId: string;
  personName: string;
  role: string;
  weeklyHours: Record<string, number>;
  totalHours: number;
}

export interface ActualsPeopleByWeekData {
  isLoading: boolean;
  error: string | null;
  weekStarts: string[];
  selectedWeekStart: string | null;
  visibleWeekStarts: string[];
  personWindowRows: PersonWindowRow[];
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

export function formatWeekLabel(isoDate: string): string {
  const date = parseIsoDate(isoDate);
  if (!date) {
    return isoDate;
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function getWindowTotalStatusClass(
  totalHours: number,
  weekCount: number,
): 'high' | 'medium' | 'low' {
  if (weekCount <= 0) {
    return getWeekStatusClass(0);
  }

  const averagePerWeek = totalHours / weekCount;
  return getWeekStatusClass(averagePerWeek);
}

export function useActualsPeopleByWeekData(
  targetWeekStart: string | null,
): ActualsPeopleByWeekData {
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
          console.error('[useActualsPeopleByWeekData]', err);
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

  const visibleWeekStarts = useMemo<string[]>(() => {
    if (!selectedWeekStart) {
      return [];
    }

    const selectedIndex = weekStarts.findIndex((weekStart) => weekStart === selectedWeekStart);
    if (selectedIndex < 0) {
      return [];
    }

    return weekStarts.slice(selectedIndex, selectedIndex + 4);
  }, [selectedWeekStart, weekStarts]);

  const personWindowRows = useMemo<PersonWindowRow[]>(() => {
    if (visibleWeekStarts.length === 0) {
      return [];
    }

    const visibleWeekSet = new Set(visibleWeekStarts);

    const personMap = new Map<
      string,
      {
        personId: string;
        personName: string;
        role: string;
        weeklyHours: Record<string, number>;
        totalHours: number;
      }
    >();

    for (const row of rows) {
      const weekStart = getSaturdayWeekStart(row.date);
      if (!visibleWeekSet.has(weekStart)) {
        continue;
      }

      const current = personMap.get(row.personId) ?? {
        personId: row.personId,
        personName: row.personName,
        role: row.role,
        weeklyHours: {},
        totalHours: 0,
      };

      current.weeklyHours[weekStart] = roundOne((current.weeklyHours[weekStart] ?? 0) + row.hours);
      current.totalHours = roundOne(current.totalHours + row.hours);
      personMap.set(row.personId, current);
    }

    return Array.from(personMap.values()).sort((a, b) => a.personName.localeCompare(b.personName));
  }, [rows, visibleWeekStarts]);

  return {
    isLoading,
    error,
    weekStarts,
    selectedWeekStart,
    visibleWeekStarts,
    personWindowRows,
  };
}
