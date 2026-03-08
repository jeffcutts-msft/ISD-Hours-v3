import Card from '@/components/ui/Card';
import styles from './HoursLog.module.css';

function HoursLog() {
  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>Hours Log</h2>
      <Card>
        <p className={styles.placeholder}>
          The hours log table and entry form will be built here. You will be able to add, edit,
          and delete hours entries for individual team members.
        </p>
      </Card>
    </div>
  );
}

export default HoursLog;
