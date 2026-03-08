import { useState, useMemo } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { PersonMeta } from '@/types';
import styles from './Dashboard.module.css';

/** Weekly hours threshold: at or above this value is considered on target (green). */
const TARGET_HOURS = 36;
/** Weekly hours threshold: at or above this value is considered under target (orange). */
const UNDER_TARGET_HOURS = 24;

/** Returns the heat colour class for a weekly actual-hours value. */
function heatClass(hours: number): string {
  if (hours >= TARGET_HOURS) return styles.green;
  if (hours >= UNDER_TARGET_HOURS) return styles.orange;
  return styles.red;
}

/** Short display for a week-start date, e.g. "29 Dec" or "05 Jan". */
function formatWeek(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' });
}

const ALL_ROLES = 'All Roles';

function Dashboard() {
  const { data, isLoading, error } = useDashboardData();

  const [roleFilter, setRoleFilter] = useState(ALL_ROLES);
  const [nameFilter, setNameFilter] = useState('');

  const roles = useMemo(() => {
    if (!data) return [];
    const set = new Set(data.people.map((p) => p.role));
    return [ALL_ROLES, ...Array.from(set).sort()];
  }, [data]);

  const filteredPeople = useMemo((): PersonMeta[] => {
    if (!data) return [];
    return data.people.filter((p) => {
      if (roleFilter !== ALL_ROLES && p.role !== roleFilter) return false;
      if (nameFilter.trim()) {
        return p.personName.toLowerCase().includes(nameFilter.trim().toLowerCase());
      }
      return true;
    });
  }, [data, roleFilter, nameFilter]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <h2 className={styles.heading}>Hours Heatmap</h2>
        <p className={styles.loading}>Loading data…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.page}>
        <h2 className={styles.heading}>Hours Heatmap</h2>
        <p className={styles.errorMsg}>{error ?? 'No data available.'}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>Hours Heatmap</h2>

      {/* Filters */}
      <div className={styles.filters} role="search" aria-label="Filter heatmap">
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="roleFilter">
            Role
          </label>
          <select
            id="roleFilter"
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
          <label className={styles.filterLabel} htmlFor="nameFilter">
            Search name
          </label>
          <input
            id="nameFilter"
            type="search"
            className={styles.filterInput}
            placeholder="e.g. Riley Hall"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend} aria-label="Colour legend">
        <span className={styles.legendTitle}>Actual hours/week:</span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.swatchGreen}`} aria-hidden="true" />
          ≥ 36 h (on target)
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.swatchOrange}`} aria-hidden="true" />
          24 – 35 h (under target)
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.swatchRed}`} aria-hidden="true" />
          ≤ 23 h (low utilisation)
        </span>
      </div>

      <p className={styles.resultCount}>
        Showing {filteredPeople.length} of {data.people.length} people
      </p>

      {/* Heatmap table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table} aria-label="Hours heatmap">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Role</th>
              {data.weeks.map((w) => (
                <th key={w} scope="col" title={w}>
                  {formatWeek(w)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredPeople.map((person) => (
              <tr key={person.personId}>
                <td className={styles.nameCell}>{person.personName}</td>
                <td className={styles.roleCell}>{person.role}</td>
                {data.weeks.map((week) => {
                  const weekData = data.lookup[person.personId]?.[week];
                  const actual = weekData?.Actual ?? 0;

                  if (actual === 0) {
                    return (
                      <td key={week} className={`${styles.hoursCell} ${styles.empty}`}>
                        –
                      </td>
                    );
                  }

                  return (
                    <td
                      key={week}
                      className={`${styles.hoursCell} ${heatClass(actual)}`}
                      title={`${person.personName} · w/c ${week} · ${actual.toFixed(1)} actual hrs`}
                    >
                      {actual.toFixed(1)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
