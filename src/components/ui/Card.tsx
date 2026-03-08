import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`${styles.card} ${className}`}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <div className={styles.body}>{children}</div>
    </div>
  );
}

export default Card;
