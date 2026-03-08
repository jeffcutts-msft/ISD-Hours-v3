import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/hours', label: 'Hours Log', icon: '🕐' },
  { to: '/reports', label: 'Reports', icon: '📋' },
];

function Sidebar() {
  return (
    <aside className={styles.sidebar} aria-label="Main navigation">
      <div className={styles.brand}>
        <span className={styles.brandIcon}>🕐</span>
        <span className={styles.brandName}>ISD Hours</span>
      </div>
      <nav>
        <ul className={styles.navList}>
          {navItems.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                }
              >
                <span className={styles.navIcon} aria-hidden="true">
                  {icon}
                </span>
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
