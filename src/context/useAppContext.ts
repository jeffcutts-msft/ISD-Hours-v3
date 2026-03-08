import { createContext, useContext } from 'react';

interface AppContextValue {
  currentPeriod: 'week' | 'month' | 'quarter';
  setCurrentPeriod: (period: 'week' | 'month' | 'quarter') => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used inside <AppProvider>');
  }
  return ctx;
}
