import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import styles from './Dashboard.module.css';

function Dashboard() {
  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>Overview</h2>

      <section className={styles.statsGrid} aria-label="Summary statistics">
        <StatCard label="Total Hours This Week" value="38.5" unit="hrs" trend="up" trendValue="+2.5 vs last week" />
        <StatCard label="Total Hours This Month" value="152" unit="hrs" trend="neutral" trendValue="on track" />
        <StatCard label="Overtime This Month" value="4" unit="hrs" trend="down" trendValue="-2 vs last month" />
        <StatCard label="Team Members" value="12" />
      </section>

      <section className={styles.cardsGrid}>
        <Card title="Recent Activity">
          <p className={styles.placeholder}>Recent hours entries will appear here.</p>
        </Card>
        <Card title="Quick Actions">
          <p className={styles.placeholder}>Quick-entry controls will appear here.</p>
        </Card>
      </section>
    </div>
  );
}

export default Dashboard;
