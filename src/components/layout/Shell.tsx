import type { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import styles from './Shell.module.css';

interface ShellProps {
  children: ReactNode;
}

function Shell({ children }: ShellProps) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <Header />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

export default Shell;
