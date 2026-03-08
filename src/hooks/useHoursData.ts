import { useState, useEffect } from 'react';
import type { HoursEntry } from '@/types';
import { getHoursEntries } from '@/services/hoursService';

interface UseHoursDataResult {
  entries: HoursEntry[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useHoursData(): UseHoursDataResult {
  const [entries, setEntries] = useState<HoursEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getHoursEntries()
      .then((data) => {
        if (!cancelled) {
          setEntries(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load hours data.');
          console.error('[useHoursData]', err);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  function refresh() {
    setTick((t) => t + 1);
  }

  return { entries, isLoading, error, refresh };
}
