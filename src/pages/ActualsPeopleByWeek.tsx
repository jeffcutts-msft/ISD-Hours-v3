import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '@/components/ui/Card';
import { getWeekStatusClass } from '@/hooks/useActualsPeopleByDayData';
import {
  useActualsPeopleByWeekData,
  formatWeekLabel,
  getWindowTotalStatusClass,
} from '@/hooks/useActualsPeopleByWeekData';
import styles from './ActualsPeopleByWeek.module.css';

type SortDir = 'asc' | 'desc';
type PeopleSortKey = 'personName' | 'role' | 'totalHours' | string;

function fmtHours(hours: number): string {
  return hours.toLocaleString();
}

function toggleSort<K extends string>(
  current: { key: K; dir: SortDir },
  key: K,
): { key: K; dir: SortDir } {
  if (current.key === key) {
    return {
      key,
      dir: current.dir === 'asc' ? 'desc' : 'asc',
    };
  }

  return { key, dir: 'asc' };
}

function getAriaSort(isActive: boolean, dir: SortDir): 'none' | 'ascending' | 'descending' {
  if (!isActive) {
    return 'none';
  }

  return dir === 'asc' ? 'ascending' : 'descending';
}

function getSortIndicator(isActive: boolean, dir: SortDir): string {
  if (!isActive) {
    return '↕';
  }

  return dir === 'asc' ? '↑' : '↓';
}

function ActualsPeopleByWeek() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedWeekStart = searchParams.get('weekStart');
  const [peopleSort, setPeopleSort] = useState<{ key: PeopleSortKey; dir: SortDir }>({
    key: 'personName',
    dir: 'asc',
  });

  const { isLoading, error, weekStarts, selectedWeekStart, visibleWeekStarts, personWindowRows } =
    useActualsPeopleByWeekData(requestedWeekStart);

  useEffect(() => {
    if (!selectedWeekStart) {
      return;
    }

    if (requestedWeekStart !== selectedWeekStart) {
      setSearchParams({ weekStart: selectedWeekStart }, { replace: true });
    }
  }, [requestedWeekStart, selectedWeekStart, setSearchParams]);

  const selectedWeekIndex = useMemo(() => {
    if (!selectedWeekStart) {
      return -1;
    }

    return weekStarts.findIndex((weekStart) => weekStart === selectedWeekStart);
  }, [selectedWeekStart, weekStarts]);

  const previousWeekStart = selectedWeekIndex > 0 ? weekStarts[selectedWeekIndex - 1] : null;
  const nextWeekStart =
    selectedWeekIndex >= 0 && selectedWeekIndex < weekStarts.length - 1
      ? weekStarts[selectedWeekIndex + 1]
      : null;

  const sortedPersonWindowRows = useMemo(() => {
    return [...personWindowRows].sort((a, b) => {
      if (peopleSort.key === 'personName') {
        const value = a.personName.localeCompare(b.personName);
        return peopleSort.dir === 'asc' ? value : -value;
      }

      if (peopleSort.key === 'role') {
        const value = a.role.localeCompare(b.role);
        return peopleSort.dir === 'asc' ? value : -value;
      }

      if (peopleSort.key === 'totalHours') {
        const value = a.totalHours - b.totalHours;
        return peopleSort.dir === 'asc' ? value : -value;
      }

      const weekKey = peopleSort.key;
      const value = (a.weeklyHours[weekKey] ?? 0) - (b.weeklyHours[weekKey] ?? 0);
      return peopleSort.dir === 'asc' ? value : -value;
    });
  }, [peopleSort, personWindowRows]);

  const goToWeek = (weekStart: string) => {
    setSearchParams({ weekStart });
  };

  const windowStartLabel = visibleWeekStarts[0] ? formatWeekLabel(visibleWeekStarts[0]) : null;
  const windowEndLabel = visibleWeekStarts[visibleWeekStarts.length - 1]
    ? formatWeekLabel(visibleWeekStarts[visibleWeekStarts.length - 1])
    : null;

  if (isLoading) {
    return (
      <div className={styles.page}>
        <h2 className={styles.heading}>People by Week</h2>
        <p className={styles.status}>Loading data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <h2 className={styles.heading}>People by Week</h2>
        <p className={styles.statusError}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>People by Week</h2>
      <p className={styles.subheading}>
        Review individual weekly totals across a rolling 4-week window and move one week at a time.
      </p>

      <Card title="Week Navigation">
        <div className={styles.navRow}>
          <button
            type="button"
            className={styles.weekButton}
            onClick={() => previousWeekStart && goToWeek(previousWeekStart)}
            disabled={!previousWeekStart}
            aria-label="Go to previous week"
          >
            Previous Week
          </button>

          <div className={styles.currentWeek}>
            {windowStartLabel && windowEndLabel
              ? `Weeks ${windowStartLabel} to ${windowEndLabel}`
              : 'No weeks selected'}
          </div>

          <button
            type="button"
            className={styles.weekButton}
            onClick={() => nextWeekStart && goToWeek(nextWeekStart)}
            disabled={!nextWeekStart}
            aria-label="Go to next week"
          >
            Next Week
          </button>
        </div>
      </Card>

      <Card title="People by Week (4-Week Window)">
        <p className={styles.legend}>
          Weekly total cell colours: <span className={styles.highLabel}>over 36 = green</span>,{' '}
          <span className={styles.mediumLabel}>23-36 = orange</span>,{' '}
          <span className={styles.lowLabel}>under 23 = red</span>. 4-week total uses the same
          colours based on average weekly hours.
        </p>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th aria-sort={getAriaSort(peopleSort.key === 'personName', peopleSort.dir)}>
                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => setPeopleSort((prev) => toggleSort(prev, 'personName'))}
                  >
                    Person{' '}
                    <span className={styles.sortIndicator}>
                      {getSortIndicator(peopleSort.key === 'personName', peopleSort.dir)}
                    </span>
                  </button>
                </th>
                <th aria-sort={getAriaSort(peopleSort.key === 'role', peopleSort.dir)}>
                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => setPeopleSort((prev) => toggleSort(prev, 'role'))}
                  >
                    Role{' '}
                    <span className={styles.sortIndicator}>
                      {getSortIndicator(peopleSort.key === 'role', peopleSort.dir)}
                    </span>
                  </button>
                </th>
                {visibleWeekStarts.map((weekStart) => (
                  <th
                    key={weekStart}
                    aria-sort={getAriaSort(peopleSort.key === weekStart, peopleSort.dir)}
                  >
                    <button
                      type="button"
                      className={styles.sortButton}
                      onClick={() => setPeopleSort((prev) => toggleSort(prev, weekStart))}
                    >
                      Week of {formatWeekLabel(weekStart)}{' '}
                      <span className={styles.sortIndicator}>
                        {getSortIndicator(peopleSort.key === weekStart, peopleSort.dir)}
                      </span>
                    </button>
                  </th>
                ))}
                <th aria-sort={getAriaSort(peopleSort.key === 'totalHours', peopleSort.dir)}>
                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => setPeopleSort((prev) => toggleSort(prev, 'totalHours'))}
                  >
                    4-Week Total{' '}
                    <span className={styles.sortIndicator}>
                      {getSortIndicator(peopleSort.key === 'totalHours', peopleSort.dir)}
                    </span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPersonWindowRows.map((row) => {
                const totalStatus = getWindowTotalStatusClass(
                  row.totalHours,
                  visibleWeekStarts.length,
                );
                return (
                  <tr key={row.personId}>
                    <td>{row.personName}</td>
                    <td>{row.role || '—'}</td>
                    {visibleWeekStarts.map((weekStart) => {
                      const weeklyHours = row.weeklyHours[weekStart] ?? 0;
                      const weeklyStatus = getWeekStatusClass(weeklyHours);
                      return (
                        <td key={`${row.personId}-${weekStart}`} className={styles[weeklyStatus]}>
                          {fmtHours(weeklyHours)}
                        </td>
                      );
                    })}
                    <td className={styles[totalStatus]}>{fmtHours(row.totalHours)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default ActualsPeopleByWeek;
