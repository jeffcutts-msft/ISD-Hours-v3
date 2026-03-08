import { useState, useEffect } from 'react';
import type { ActualVsForecast } from '@/types';
import { getDatasetRows } from '@/services/csvService';
import { roundOne } from '@/utils';

const MONTH_ORDER = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface ActualsVsForecastData {
  byMonth: ActualVsForecast[];
  totalActual: number;
  totalForecast: number;
  totalVariance: number;
  isLoading: boolean;
  error: string | null;
}

/** Compares actual vs forecast hours from the dataset. */
export function useActualsVsForecastData(): ActualsVsForecastData {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [byMonth, setByMonth] = useState<ActualVsForecast[]>([]);
  const [totalActual, setTotalActual] = useState(0);
  const [totalForecast, setTotalForecast] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getDatasetRows()
      .then((all) => {
        if (cancelled) return;

        const actualByMonth = new Map<string, number>();
        const forecastByMonth = new Map<string, number>();

        for (const r of all) {
          if (r.workType === 'Actual') {
            actualByMonth.set(r.month, (actualByMonth.get(r.month) ?? 0) + r.hours);
          } else if (r.workType === 'Forecast') {
            forecastByMonth.set(r.month, (forecastByMonth.get(r.month) ?? 0) + r.hours);
          }
        }

        const allMonths = new Set([...actualByMonth.keys(), ...forecastByMonth.keys()]);
        const comparison: ActualVsForecast[] = Array.from(allMonths)
          .map((month) => {
            const actual = roundOne(actualByMonth.get(month) ?? 0);
            const forecast = roundOne(forecastByMonth.get(month) ?? 0);
            return { period: month, actual, forecast, variance: roundOne(actual - forecast) };
          })
          .sort((a, b) => MONTH_ORDER.indexOf(a.period) - MONTH_ORDER.indexOf(b.period));

        setByMonth(comparison);
        setTotalActual(roundOne(comparison.reduce((s, c) => s + c.actual, 0)));
        setTotalForecast(roundOne(comparison.reduce((s, c) => s + c.forecast, 0)));
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load data.');
          console.error('[useActualsVsForecastData]', err);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const totalVariance = roundOne(totalActual - totalForecast);

  return { byMonth, totalActual, totalForecast, totalVariance, isLoading, error };
}
