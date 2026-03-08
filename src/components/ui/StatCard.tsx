import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

function StatCard({ label, value, unit, trend, trendValue }: StatCardProps) {
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : null;

  return (
    <div className={styles.statCard}>
      <span className={styles.label}>{label}</span>
      <div className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>
      {trend && trendValue && (
        <span className={`${styles.trend} ${styles[trend]}`}>
          {trendIcon} {trendValue}
        </span>
      )}
    </div>
  );
}

export default StatCard;
