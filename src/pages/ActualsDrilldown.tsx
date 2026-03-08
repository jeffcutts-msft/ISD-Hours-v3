import { useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import {
  useActualsDrilldownData,
  getWeekStatusClass,
  formatIsoDate,
} from '@/hooks/useActualsDrilldownData';
import styles from './ActualsDrilldown.module.css';

function fmtHours(hours: number): string {
  return hours.toLocaleString();
}

function ActualsDrilldown() {
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);
  const [selectedWeekStart, setSelectedWeekStart] = useState<string | null>(null);

  const {
    isLoading,
    error,
    monthSummaries,
    weekSummaries,
    daySummaries,
    weekDates,
    personWeekRows,
  } = useActualsDrilldownData(selectedMonthId, selectedWeekStart);

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
        Drill from month summary to week summary to day summary, then view every person and each day for the selected week.
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
                <th>Month</th>
                <th>Total Hours</th>
                <th>Weeks</th>
                <th>People</th>
                <th>Drilldown</th>
              </tr>
            </thead>
            <tbody>
              {monthSummaries.map((month) => {
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
                <th>Week Start</th>
                <th>Total Hours</th>
                <th>Days</th>
                <th>People</th>
                <th>Drilldown</th>
              </tr>
            </thead>
            <tbody>
              {weekSummaries.map((week) => {
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

      <Card title={`3) Day Summary — ${selectedWeekStart ? `Week of ${formatIsoDate(selectedWeekStart)}` : 'No week selected'}`}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Hours</th>
                <th>People</th>
              </tr>
            </thead>
            <tbody>
              {daySummaries.map((day) => (
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

      <Card title="4) People by Day (Selected Week)">
        <p className={styles.legend}>
          Weekly total cell colours: <span className={styles.highLabel}>over 36 = green</span>,{' '}
          <span className={styles.mediumLabel}>24–26 = orange</span>,{' '}
          <span className={styles.lowLabel}>under 23 = red</span>.
        </p>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Person</th>
                <th>Role</th>
                {weekDates.map((date) => (
                  <th key={date}>{formatIsoDate(date)}</th>
                ))}
                <th>Week Total</th>
              </tr>
            </thead>
            <tbody>
              {personWeekRows.map((row) => {
                const status = getWeekStatusClass(row.totalHours);
                return (
                  <tr key={row.personId}>
                    <td>{row.personName}</td>
                    <td>{row.role || '—'}</td>
                    {weekDates.map((date) => (
                      <td key={`${row.personId}-${date}`}>{fmtHours(row.dailyHours[date] ?? 0)}</td>
                    ))}
                    <td className={status === 'normal' ? '' : styles[status]}>{fmtHours(row.totalHours)}</td>
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

export default ActualsDrilldown;