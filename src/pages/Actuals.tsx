import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import { useActualsData } from '@/hooks/useActualsData';
import styles from './Actuals.module.css';

const PRACTICE_COLOURS = ['#0078d4', '#00b4d8', '#48cae4', '#90e0ef', '#ade8f4', '#caf0f8'];

function fmtHrs(val: ValueType): string {
  return `${Number(val).toLocaleString()} hrs`;
}

function Actuals() {
  const { totalHours, byMonth, byPractice, byRole, uniquePeople, uniqueProjects, isLoading, error } =
    useActualsData();

  if (isLoading) {
    return (
      <div className={styles.page}>
        <h2 className={styles.heading}>Actuals</h2>
        <p className={styles.status}>Loading data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <h2 className={styles.heading}>Actuals</h2>
        <p className={styles.statusError}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>Actuals</h2>
      <p className={styles.subheading}>Historical actual hours recorded across all team members.</p>

      <section className={styles.statsGrid} aria-label="Actuals summary statistics">
        <StatCard label="Total Hours Logged" value={totalHours.toLocaleString()} unit="hrs" />
        <StatCard label="Team Members" value={uniquePeople} />
        <StatCard label="Active Projects" value={uniqueProjects} />
        <StatCard label="Months of Data" value={byMonth.length} />
      </section>

      <section className={styles.chartsGrid}>
        <Card title="Monthly Hours">
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byMonth} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" />
                <XAxis dataKey="period" tick={{ fontSize: 13 }} />
                <YAxis tick={{ fontSize: 13 }} unit=" h" />
                <Tooltip formatter={(val: ValueType) => [fmtHrs(val), 'Hours']} />
                <Bar dataKey="hours" fill="#0078d4" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Hours by Practice">
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byPractice} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" />
                <XAxis type="number" tick={{ fontSize: 13 }} unit=" h" />
                <YAxis type="category" dataKey="period" tick={{ fontSize: 12 }} width={100} />
                <Tooltip formatter={(val: ValueType) => [fmtHrs(val), 'Hours']} />
                <Bar dataKey="hours" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                  {byPractice.map((_, index) => (
                    <Cell key={index} fill={PRACTICE_COLOURS[index % PRACTICE_COLOURS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Hours by Role">
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byRole} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" />
                <XAxis dataKey="period" tick={{ fontSize: 13 }} />
                <YAxis tick={{ fontSize: 13 }} unit=" h" />
                <Tooltip formatter={(val: ValueType) => [fmtHrs(val), 'Hours']} />
                <Bar dataKey="hours" fill="#00b4d8" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>
    </div>
  );
}

export default Actuals;
