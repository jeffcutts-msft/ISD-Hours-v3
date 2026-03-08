import { useState, useMemo } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import styles from './Comparison.module.css';

/** Tolerance (in hours) used to determine whether a variance is effectively zero. */
const VARIANCE_THRESHOLD = 0.05;

/** Short display for a week-start date. */
function formatWeek(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

const ALL = 'All';

interface ComparisonRow {
  personId: string;
  personName: string;
  role: string;
  weekStart: string;
  forecast: number;
  actual: number;
  variance: number; // actual - forecast
  variancePct: number | null; // percentage, null if forecast = 0
}

function Comparison() {
  const { data, isLoading, error } = useDashboardData();

  const [roleFilter, setRoleFilter] = useState(ALL);
  const [weekFilter, setWeekFilter] = useState(ALL);
  const [nameFilter, setNameFilter] = useState('');
  const [sortField, setSortField] = useState<'name' | 'week' | 'variance'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const roles = useMemo(() => {
    if (!data) return [];
    const set = new Set(data.people.map((p) => p.role));
    return [ALL, ...Array.from(set).sort()];
  }, [data]);

  const weeks = useMemo(() => {
    if (!data) return [];
    return [ALL, ...data.weeks];
  }, [data]);

  /** Flatten lookup into comparison rows. */
  const allRows = useMemo((): ComparisonRow[] => {
    if (!data) return [];
    const rows: ComparisonRow[] = [];
    for (const person of data.people) {
      for (const week of data.weeks) {
        const weekData = data.lookup[person.personId]?.[week];
        if (!weekData) continue;
        const forecast = weekData.Forecast ?? 0;
        const actual = weekData.Actual ?? 0;
        if (forecast === 0 && actual === 0) continue;
        const variance = actual - forecast;
        const variancePct = forecast !== 0 ? (variance / forecast) * 100 : null;
        rows.push({
          personId: person.personId,
          personName: person.personName,
          role: person.role,
          weekStart: week,
          forecast,
          actual,
          variance,
          variancePct,
        });
      }
    }
    return rows;
  }, [data]);

  const filteredRows = useMemo((): ComparisonRow[] => {
    let result = allRows;

    if (roleFilter !== ALL) {
      result = result.filter((r) => r.role === roleFilter);
    }
    if (weekFilter !== ALL) {
      result = result.filter((r) => r.weekStart === weekFilter);
    }
    if (nameFilter.trim()) {
      const q = nameFilter.trim().toLowerCase();
      result = result.filter((r) => r.personName.toLowerCase().includes(q));
    }

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = a.personName.localeCompare(b.personName);
      else if (sortField === 'week') cmp = a.weekStart.localeCompare(b.weekStart);
      else if (sortField === 'variance') cmp = a.variance - b.variance;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [allRows, roleFilter, weekFilter, nameFilter, sortField, sortDir]);

  /** Totals for the summary bar. */
  const totals = useMemo(() => {
    const totalForecast = filteredRows.reduce((s, r) => s + r.forecast, 0);
    const totalActual = filteredRows.reduce((s, r) => s + r.actual, 0);
    const totalVariance = totalActual - totalForecast;
    return { totalForecast, totalActual, totalVariance };
  }, [filteredRows]);

  function handleSortClick(field: typeof sortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function sortIndicator(field: typeof sortField): string {
    if (sortField !== field) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <h2 className={styles.heading}>Forecast vs Actual</h2>
        <p className={styles.loading}>Loading data…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.page}>
        <h2 className={styles.heading}>Forecast vs Actual</h2>
        <p className={styles.errorMsg}>{error ?? 'No data available.'}</p>
      </div>
    );
  }

  const varianceClass = (v: number) => {
    if (v > VARIANCE_THRESHOLD) return styles.positiveVariance;
    if (v < -VARIANCE_THRESHOLD) return styles.negativeVariance;
    return styles.neutralVariance;
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>Forecast vs Actual</h2>

      {/* Summary bar */}
      <div className={styles.summaryBar} aria-label="Summary totals">
        <div className={styles.summaryCard}>
          <p className={styles.summaryCardLabel}>Total Forecast</p>
          <p className={styles.summaryCardValue}>{totals.totalForecast.toFixed(1)} h</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryCardLabel}>Total Actual</p>
          <p className={styles.summaryCardValue}>{totals.totalActual.toFixed(1)} h</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryCardLabel}>Variance (Actual − Forecast)</p>
          <p
            className={`${styles.summaryCardValue} ${
              totals.totalVariance > VARIANCE_THRESHOLD
                ? styles.positive
                : totals.totalVariance < -VARIANCE_THRESHOLD
                  ? styles.negative
                  : ''
            }`}
          >
            {totals.totalVariance >= 0 ? '+' : ''}
            {totals.totalVariance.toFixed(1)} h
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters} role="search" aria-label="Filter comparison table">
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="cmpRoleFilter">
            Role
          </label>
          <select
            id="cmpRoleFilter"
            className={styles.filterSelect}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="cmpWeekFilter">
            Week
          </label>
          <select
            id="cmpWeekFilter"
            className={styles.filterSelect}
            value={weekFilter}
            onChange={(e) => setWeekFilter(e.target.value)}
          >
            {weeks.map((w) => (
              <option key={w} value={w}>
                {w === ALL ? 'All Weeks' : formatWeek(w)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="cmpNameFilter">
            Search name
          </label>
          <input
            id="cmpNameFilter"
            type="search"
            className={styles.filterInput}
            placeholder="e.g. Riley Hall"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </div>
      </div>

      <p className={styles.resultCount}>Showing {filteredRows.length} records</p>

      {/* Comparison table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table} aria-label="Forecast vs actual comparison">
          <thead>
            <tr>
              <th
                scope="col"
                style={{ cursor: 'pointer' }}
                onClick={() => handleSortClick('name')}
                aria-sort={sortField === 'name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Name{sortIndicator('name')}
              </th>
              <th scope="col">Role</th>
              <th
                scope="col"
                style={{ cursor: 'pointer' }}
                onClick={() => handleSortClick('week')}
                aria-sort={sortField === 'week' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Week{sortIndicator('week')}
              </th>
              <th scope="col" className={styles.numericHeader}>
                Forecast (h)
              </th>
              <th scope="col" className={styles.numericHeader}>
                Actual (h)
              </th>
              <th
                scope="col"
                className={styles.numericHeader}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSortClick('variance')}
                aria-sort={sortField === 'variance' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Variance{sortIndicator('variance')}
              </th>
              <th scope="col" className={styles.numericHeader}>
                Variance %
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={`${row.personId}-${row.weekStart}`}>
                <td>{row.personName}</td>
                <td>{row.role}</td>
                <td>{formatWeek(row.weekStart)}</td>
                <td className={styles.numericCell}>{row.forecast.toFixed(1)}</td>
                <td className={styles.numericCell}>{row.actual.toFixed(1)}</td>
                <td className={`${styles.numericCell} ${varianceClass(row.variance)}`}>
                  {row.variance >= 0 ? '+' : ''}
                  {row.variance.toFixed(1)}
                </td>
                <td className={`${styles.numericCell} ${varianceClass(row.variance)}`}>
                  {row.variancePct !== null
                    ? `${row.variancePct >= 0 ? '+' : ''}${row.variancePct.toFixed(0)}%`
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Comparison;
