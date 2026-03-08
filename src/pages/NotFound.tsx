import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

function NotFound() {
  return (
    <div className={styles.page}>
      <h2 className={styles.code}>404</h2>
      <p className={styles.message}>Page not found.</p>
      <Link to="/" className={styles.link}>
        ← Back to Dashboard
      </Link>
    </div>
  );
}

export default NotFound;
