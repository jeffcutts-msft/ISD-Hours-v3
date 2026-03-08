import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import { useActualsVsForecastData } from '@/hooks/useActualsVsForecastData';
import { roundOne } from '@/utils';
import styles from './ActualsVsForecast.module.css';

function fmtHrs(val: ValueType): string {
  return `${Number(val).toLocaleString()} hrs`;
}

function fmtVariance(val: ValueType): string {
  const n = Number(val);
  return `${n >= 0 ? '+' : ''}${n.toLocaleString()} hrs`;
}

function ActualsVsForecast() {
  const { byMonth, totalActual, totalForecast, totalVariance, isLoading, error } =
    useActualsVsForecastData();

  if (isLoading) {
    return (
      <div className={styles.page}>
        <h2 className={styles.heading}>Actuals vs Forecast</h2>
        <p className={styles.status}>Loading data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <h2 className={styles.heading}>Actuals vs Forecast</h2>
        <p className={styles.statusError}>Error: {error}</p>
      </div>
    );
  }

  const varianceTrend = totalVariance > 0 ? 'up' : totalVariance < 0 ? 'down' : 'neutral';
  const varianceLabel = `${totalVariance >= 0 ? '+' : ''}${totalVariance.toLocaleString()} hrs vs forecast`;

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>Actuals vs Forecast</h2>
      <p className={styles.subheading}>Compare recorded actual hours against the forecasted hours by month.</p>

      <section className={styles.statsGrid} aria-label="Actuals vs Forecast summary statistics">
        <StatCard label="Total Actual Hours" value={totalActual.toLocaleString()} unit="hrs" />
        <StatCard label="Total Forecast Hours" value={totalForecast.toLocaleString()} unit="hrs" />
        <StatCard
          label="Overall Variance"
          value={`${totalVariance >= 0 ? '+' : ''}${totalVariance.toLocaleString()}`}
          unit="hrs"
          trend={varianceTrend}
          trendValue={varianceLabel}
        />
      </section>

      <section className={styles.chartsGrid}>
        <Card title="Monthly Actual vs Forecast">
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byMonth} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" />
                <XAxis dataKey="period" tick={{ fontSize: 13 }} />
                <YAxis tick={{ fontSize: 13 }} unit=" h" />
                <Tooltip formatter={(val: ValueType) => [fmtHrs(val)]} />
                <Legend />
                <Bar dataKey="actual" name="Actual" fill="#0078d4" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="forecast" name="Forecast" fill="#ffc107" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Monthly Variance (Actual − Forecast)">
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byMonth} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" />
                <XAxis dataKey="period" tick={{ fontSize: 13 }} />
                <YAxis tick={{ fontSize: 13 }} unit=" h" />
                <Tooltip formatter={(val: ValueType) => [fmtVariance(val), 'Variance']} />
                <ReferenceLine y={0} stroke="#6c757d" />
                <Bar dataKey="variance" name="Variance" radius={[4, 4, 0, 0]} fill="#0078d4" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <Card title="Variance by Month">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Month</th>
                <th>Actual (hrs)</th>
                <th>Forecast (hrs)</th>
                <th>Variance (hrs)</th>
                <th>Variance %</th>
              </tr>
            </thead>
            <tbody>
              {byMonth.map(({ period, actual, forecast, variance }) => {
                const pct = forecast !== 0 ? roundOne((variance / forecast) * 100) : null;
                const isPositive = variance >= 0;
                return (
                  <tr key={period}>
                    <td>{period}</td>
                    <td>{actual.toLocaleString()}</td>
                    <td>{forecast.toLocaleString()}</td>
                    <td className={isPositive ? styles.positive : styles.negative}>
                      {isPositive ? '+' : ''}
                      {variance.toLocaleString()}
                    </td>
                    <td className={isPositive ? styles.positive : styles.negative}>
                      {pct !== null ? `${isPositive ? '+' : ''}${pct}%` : '—'}
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

export default ActualsVsForecast;
