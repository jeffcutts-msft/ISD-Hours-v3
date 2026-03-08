import styles from './Header.module.css';

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.pageTitle}>ISD Hours Dashboard</h1>
      </div>
      <div className={styles.right}>
        <span className={styles.userName} aria-label="Current user">
          IT Service Desk
        </span>
      </div>
    </header>
  );
}

export default Header;
