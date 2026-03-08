import { useState } from 'react';
import type { ReactNode } from 'react';
import { AppContext } from './useAppContext';

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPeriod, setCurrentPeriod] = useState<'week' | 'month' | 'quarter'>('week');

  return (
    <AppContext.Provider value={{ currentPeriod, setCurrentPeriod }}>
      {children}
    </AppContext.Provider>
  );
}
