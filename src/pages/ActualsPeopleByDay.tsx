import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '@/components/ui/Card';
import {
  useActualsPeopleByDayData,
  getWeekStatusClass,
  formatIsoDate,
} from '@/hooks/useActualsPeopleByDayData';
import styles from './ActualsPeopleByDay.module.css';

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

function ActualsPeopleByDay() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedWeekStart = searchParams.get('weekStart');
  const [peopleSort, setPeopleSort] = useState<{ key: PeopleSortKey; dir: SortDir }>({
    key: 'personName',
    dir: 'asc',
  });

  const { isLoading, error, weekStarts, selectedWeekStart, weekDates, personWeekRows } =
    useActualsPeopleByDayData(requestedWeekStart);

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

  const sortedPersonWeekRows = useMemo(() => {
    return [...personWeekRows].sort((a, b) => {
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

      const dateKey = peopleSort.key;
      const value = (a.dailyHours[dateKey] ?? 0) - (b.dailyHours[dateKey] ?? 0);
      return peopleSort.dir === 'asc' ? value : -value;
    });
  }, [peopleSort, personWeekRows]);

  const goToWeek = (weekStart: string) => {
    setSearchParams({ weekStart });
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <h2 className={styles.heading}>People by Day</h2>
        <p className={styles.status}>Loading data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <h2 className={styles.heading}>People by Day</h2>
        <p className={styles.statusError}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>People by Day</h2>
      <p className={styles.subheading}>
        Review individual hours per day for a selected week and move week-by-week.
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
            {selectedWeekStart ? `Week of ${formatIsoDate(selectedWeekStart)}` : 'No week selected'}
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

      <Card title="People by Day (Selected Week)">
        <p className={styles.legend}>
          Weekly total cell colours: <span className={styles.highLabel}>over 36 = green</span>,{' '}
          <span className={styles.mediumLabel}>24-26 = orange</span>,{' '}
          <span className={styles.lowLabel}>under 23 = red</span>.
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
                {weekDates.map((date) => (
                  <th key={date} aria-sort={getAriaSort(peopleSort.key === date, peopleSort.dir)}>
                    <button
                      type="button"
                      className={styles.sortButton}
                      onClick={() => setPeopleSort((prev) => toggleSort(prev, date))}
                    >
                      {formatIsoDate(date)}{' '}
                      <span className={styles.sortIndicator}>
                        {getSortIndicator(peopleSort.key === date, peopleSort.dir)}
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
                    Week Total{' '}
                    <span className={styles.sortIndicator}>
                      {getSortIndicator(peopleSort.key === 'totalHours', peopleSort.dir)}
                    </span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPersonWeekRows.map((row) => {
                const status = getWeekStatusClass(row.totalHours);
                return (
                  <tr key={row.personId}>
                    <td>{row.personName}</td>
                    <td>{row.role || '—'}</td>
                    {weekDates.map((date) => (
                      <td key={`${row.personId}-${date}`}>{fmtHours(row.dailyHours[date] ?? 0)}</td>
                    ))}
                    <td className={status === 'normal' ? '' : styles[status]}>
                      {fmtHours(row.totalHours)}
                    </td>
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

export default ActualsPeopleByDay;
