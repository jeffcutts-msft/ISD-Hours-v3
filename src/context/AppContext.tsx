import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AppContextValue {
  currentPeriod: 'week' | 'month' | 'quarter';
  setCurrentPeriod: (period: 'week' | 'month' | 'quarter') => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPeriod, setCurrentPeriod] = useState<'week' | 'month' | 'quarter'>('week');

  return (
    <AppContext.Provider value={{ currentPeriod, setCurrentPeriod }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used inside <AppProvider>');
  }
  return ctx;
}
