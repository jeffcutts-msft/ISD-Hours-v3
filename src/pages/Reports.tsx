import Card from '@/components/ui/Card';
import styles from './Reports.module.css';

function Reports() {
  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>Reports</h2>
      <Card>
        <p className={styles.placeholder}>
          Charts, exports, and summary reports will be built here. View weekly, monthly, and
          quarterly hours breakdowns.
        </p>
      </Card>
    </div>
  );
}

export default Reports;
