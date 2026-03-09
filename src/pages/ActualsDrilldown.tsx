import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import { useActualsDrilldownData, formatIsoDate } from '@/hooks/useActualsDrilldownData';
import styles from './ActualsDrilldown.module.css';

function fmtHours(hours: number): string {
  return hours.toLocaleString();
}

type SortDir = 'asc' | 'desc';
type MonthSortKey = 'label' | 'totalHours' | 'weekCount' | 'peopleCount';
type WeekSortKey = 'weekStart' | 'totalHours' | 'dayCount' | 'peopleCount';
type DaySortKey = 'date' | 'totalHours' | 'peopleCount';

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

function ActualsDrilldown() {
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);
  const [selectedWeekStart, setSelectedWeekStart] = useState<string | null>(null);
  const [monthSort, setMonthSort] = useState<{ key: MonthSortKey; dir: SortDir }>({
    key: 'label',
    dir: 'asc',
  });
  const [weekSort, setWeekSort] = useState<{ key: WeekSortKey; dir: SortDir }>({
    key: 'weekStart',
    dir: 'asc',
  });
  const [daySort, setDaySort] = useState<{ key: DaySortKey; dir: SortDir }>({
    key: 'date',
    dir: 'asc',
  });
  const { isLoading, error, monthSummaries, weekSummaries, daySummaries, personWeekRows } =
    useActualsDrilldownData(selectedMonthId, selectedWeekStart);

  useEffect(() => {
    if (!selectedMonthId && monthSummaries.length > 0) {
      setSelectedMonthId(monthSummaries[0].id);
    }
  }, [monthSummaries, selectedMonthId]);

  useEffect(() => {
    if (weekSummaries.length === 0) {
      if (selectedWeekStart !== null) {
        setSelectedWeekStart(null);
      }
      return;
    }

    const selectedExists = selectedWeekStart
      ? weekSummaries.some((week) => week.weekStart === selectedWeekStart)
      : false;

    if (!selectedExists) {
      setSelectedWeekStart(weekSummaries[0].weekStart);
    }
  }, [weekSummaries, selectedWeekStart]);

  const monthLabel = useMemo(() => {
    const selectedMonth = monthSummaries.find((month) => month.id === selectedMonthId);
    return selectedMonth ? selectedMonth.label : 'No month selected';
  }, [monthSummaries, selectedMonthId]);

  const sortedMonthSummaries = useMemo(() => {
    return [...monthSummaries].sort((a, b) => {
      if (monthSort.key === 'label') {
        const value = a.label.localeCompare(b.label);
        return monthSort.dir === 'asc' ? value : -value;
      }

      const value = a[monthSort.key] - b[monthSort.key];
      return monthSort.dir === 'asc' ? value : -value;
    });
  }, [monthSort, monthSummaries]);

  const sortedWeekSummaries = useMemo(() => {
    return [...weekSummaries].sort((a, b) => {
      if (weekSort.key === 'weekStart') {
        const value = a.weekStart.localeCompare(b.weekStart);
        return weekSort.dir === 'asc' ? value : -value;
      }

      const value = a[weekSort.key] - b[weekSort.key];
      return weekSort.dir === 'asc' ? value : -value;
    });
  }, [weekSort, weekSummaries]);

  const sortedDaySummaries = useMemo(() => {
    return [...daySummaries].sort((a, b) => {
      if (daySort.key === 'date') {
        const value = a.date.localeCompare(b.date);
        return daySort.dir === 'asc' ? value : -value;
      }

      const value = a[daySort.key] - b[daySort.key];
      return daySort.dir === 'asc' ? value : -value;
    });
  }, [daySort, daySummaries]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <h2 className={styles.heading}>Actuals Drilldown</h2>
        <p className={styles.status}>Loading data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <h2 className={styles.heading}>Actuals Drilldown</h2>
        <p className={styles.statusError}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>Actuals Drilldown</h2>
      <p className={styles.subheading}>
        Drill from month summary to week summary to day summary, then view every person and each day
        for the selected week.
      </p>

      <section className={styles.statsGrid} aria-label="Drilldown summary statistics">
        <StatCard label="Months" value={monthSummaries.length} />
        <StatCard label="Weeks in Selected Month" value={weekSummaries.length} />
        <StatCard label="Days in Selected Week" value={daySummaries.length} />
        <StatCard label="People in Selected Week" value={personWeekRows.length} />
      </section>

      <Card title="1) Month Summary">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th aria-sort={getAriaSort(monthSort.key === 'label', monthSort.dir)}>
                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => setMonthSort((prev) => toggleSort(prev, 'label'))}
                  >
                    Month{' '}
                    <span className={styles.sortIndicator}>
                      {getSortIndicator(monthSort.key === 'label', monthSort.dir)}
                    </span>
                  </button>
                </th>
                <th aria-sort={getAriaSort(monthSort.key === 'totalHours', monthSort.dir)}>
                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => setMonthSort((prev) => toggleSort(prev, 'totalHours'))}
                  >
                    Total Hours{' '}
                    <span className={styles.sortIndicator}>
                      {getSortIndicator(monthSort.key === 'totalHours', monthSort.dir)}
                    </span>
                  </button>
                </th>
                <th aria-sort={getAriaSort(monthSort.key === 'weekCount', monthSort.dir)}>
                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => setMonthSort((prev) => toggleSort(prev, 'weekCount'))}
                  >
                    Weeks{' '}
                    <span className={styles.sortIndicator}>
                      {getSortIndicator(monthSort.key === 'weekCount', monthSort.dir)}
                    </span>
                  </button>
                </th>
                <th aria-sort={getAriaSort(monthSort.key === 'peopleCount', monthSort.dir)}>
                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => setMonthSort((prev) => toggleSort(prev, 'peopleCount'))}
                  >
                    People{' '}
                    <span className={styles.sortIndicator}>
                      {getSortIndicator(monthSort.key === 'peopleCount', monthSort.dir)}
                    </span>
                  </button>
                </th>
                <th>Drilldown</th>
              </tr>
            </thead>
            <tbody>
              {sortedMonthSummaries.map((month) => {
                const isSelected = month.id === selectedMonthId;
                return (
                  <tr key={month.id} className={isSelected ? styles.selectedRow : ''}>
                    <td>{month.label}</td>
                    <td>{fmtHours(month.totalHours)}</td>
                    <td>{month.weekCount}</td>
                    <td>{month.peopleCount}</td>
                    <td>
                      <button
                        type="button"
                        className={styles.linkButton}
                        onClick={() => setSelectedMonthId(month.id)}
                        aria-label={`Select month ${month.label}`}
                      >
                        View weeks
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title={`2) Week Summary — ${monthLabel}`}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th aria-sort={getAriaSort(weekSort.key === 'weekStart', weekSort.dir)}>
                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => setWeekSort((prev) => toggleSort(prev, 'weekStart'))}
                  >
                    Week Start{' '}
                    <span className={styles.sortIndicator}>
                      {getSortIndicator(weekSort.key === 'weekStart', weekSort.dir)}
                    </span>
                  </button>
                </th>
                <th aria-sort={getAriaSort(weekSort.key === 'totalHours', weekSort.dir)}>
                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => setWeekSort((prev) => toggleSort(prev, 'totalHours'))}
                  >
                    Total Hours{' '}
                    <span className={styles.sortIndicator}>
                      {getSortIndicator(weekSort.key === 'totalHours', weekSort.dir)}
                    </span>
                  </button>
                </th>
                <th aria-sort={getAriaSort(weekSort.key === 'dayCount', weekSort.dir)}>
                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => setWeekSort((prev) => toggleSort(prev, 'dayCount'))}
                  >
                    Days{' '}
                    <span className={styles.sortIndicator}>
                      {getSortIndicator(weekSort.key === 'dayCount', weekSort.dir)}
                    </span>
                  </button>
                </th>
                <th aria-sort={getAriaSort(weekSort.key === 'peopleCount', weekSort.dir)}>
                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => setWeekSort((prev) => toggleSort(prev, 'peopleCount'))}
                  >
                    People{' '}
                    <span className={styles.sortIndicator}>
                      {getSortIndicator(weekSort.key === 'peopleCount', weekSort.dir)}
                    </span>
                  </button>
                </th>
                <th>Drilldown</th>
              </tr>
            </thead>
            <tbody>
              {sortedWeekSummaries.map((week) => {
                const isSelected = week.weekStart === selectedWeekStart;
                return (
                  <tr key={week.weekStart} className={isSelected ? styles.selectedRow : ''}>
                    <td>{formatIsoDate(week.weekStart)}</td>
                    <td>{fmtHours(week.totalHours)}</td>
                    <td>{week.dayCount}</td>
                    <td>{week.peopleCount}</td>
                    <td>
                      <button
                        type="button"
                        className={styles.linkButton}
                        onClick={() => setSelectedWeekStart(week.weekStart)}
                        aria-label={`Select week starting ${formatIsoDate(week.weekStart)}`}
                      >
                        View days
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card
        title={`3) Day Summary — ${selectedWeekStart ? `Week of ${formatIsoDate(selectedWeekStart)}` : 'No week selected'}`}
      >
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th aria-sort={getAriaSort(daySort.key === 'date', daySort.dir)}>
                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => setDaySort((prev) => toggleSort(prev, 'date'))}
                  >
                    Date{' '}
                    <span className={styles.sortIndicator}>
                      {getSortIndicator(daySort.key === 'date', daySort.dir)}
                    </span>
                  </button>
                </th>
                <th aria-sort={getAriaSort(daySort.key === 'totalHours', daySort.dir)}>
                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => setDaySort((prev) => toggleSort(prev, 'totalHours'))}
                  >
                    Total Hours{' '}
                    <span className={styles.sortIndicator}>
                      {getSortIndicator(daySort.key === 'totalHours', daySort.dir)}
                    </span>
                  </button>
                </th>
                <th aria-sort={getAriaSort(daySort.key === 'peopleCount', daySort.dir)}>
                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => setDaySort((prev) => toggleSort(prev, 'peopleCount'))}
                  >
                    People{' '}
                    <span className={styles.sortIndicator}>
                      {getSortIndicator(daySort.key === 'peopleCount', daySort.dir)}
                    </span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedDaySummaries.map((day) => (
                <tr key={day.date}>
                  <td>{formatIsoDate(day.date)}</td>
                  <td>{fmtHours(day.totalHours)}</td>
                  <td>{day.peopleCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="4) People by Day">
        <p className={styles.legend}>
          This view now lives on its own page with week-by-week navigation.
        </p>
        <Link
          to={
            selectedWeekStart
              ? `/actuals-people-by-day?weekStart=${selectedWeekStart}`
              : '/actuals-people-by-day'
          }
          className={styles.linkButton}
        >
          Open People by Day
        </Link>
      </Card>
    </div>
  );
}

export default ActualsDrilldown;
