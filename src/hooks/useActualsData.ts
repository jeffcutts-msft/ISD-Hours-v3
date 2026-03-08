import { useState, useEffect } from 'react';
import type { DataRow, PeriodTotal } from '@/types';
import { getDatasetRows } from '@/services/csvService';
import { roundOne } from '@/utils';

const MONTH_ORDER = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function sortByMonth(a: PeriodTotal, b: PeriodTotal): number {
  return MONTH_ORDER.indexOf(a.period) - MONTH_ORDER.indexOf(b.period);
}

export interface ActualsData {
  rows: DataRow[];
  totalHours: number;
  byMonth: PeriodTotal[];
  byPractice: PeriodTotal[];
  byRole: PeriodTotal[];
  uniquePeople: number;
  uniqueProjects: number;
  isLoading: boolean;
  error: string | null;
}

/** Aggregates actual hours from the dataset for the Actuals page. */
export function useActualsData(): ActualsData {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<DataRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getDatasetRows()
      .then((all) => {
        if (!cancelled) {
          setRows(all.filter((r) => r.workType === 'Actual'));
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load data.');
          console.error('[useActualsData]', err);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const totalHours = roundOne(rows.reduce((sum, r) => sum + r.hours, 0));

  const byMonthMap = new Map<string, number>();
  for (const r of rows) {
    byMonthMap.set(r.month, (byMonthMap.get(r.month) ?? 0) + r.hours);
  }
  const byMonth: PeriodTotal[] = Array.from(byMonthMap.entries())
    .map(([period, hours]) => ({ period, hours: roundOne(hours) }))
    .sort(sortByMonth);

  const byPracticeMap = new Map<string, number>();
  for (const r of rows) {
    if (r.practice) {
      byPracticeMap.set(r.practice, (byPracticeMap.get(r.practice) ?? 0) + r.hours);
    }
  }
  const byPractice: PeriodTotal[] = Array.from(byPracticeMap.entries())
    .map(([period, hours]) => ({ period, hours: roundOne(hours) }))
    .sort((a, b) => b.hours - a.hours);

  const byRoleMap = new Map<string, number>();
  for (const r of rows) {
    if (r.role) {
      byRoleMap.set(r.role, (byRoleMap.get(r.role) ?? 0) + r.hours);
    }
  }
  const byRole: PeriodTotal[] = Array.from(byRoleMap.entries())
    .map(([period, hours]) => ({ period, hours: roundOne(hours) }))
    .sort((a, b) => b.hours - a.hours);

  const uniquePeople = new Set(rows.map((r) => r.personId)).size;
  const uniqueProjects = new Set(rows.filter((r) => r.projectCode).map((r) => r.projectCode)).size;

  return {
    rows,
    totalHours,
    byMonth,
    byPractice,
    byRole,
    uniquePeople,
    uniqueProjects,
    isLoading,
    error,
  };
}
