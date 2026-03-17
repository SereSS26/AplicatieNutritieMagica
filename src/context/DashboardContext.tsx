"use client";

import React, { createContext, useContext } from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import { useDailyStats } from '@/src/hooks/useDailyStats';
import { useProgressStats } from '@/src/hooks/useProgressStats';

// Creăm contextul
const DashboardContext = createContext<any>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  
  // Avem nevoie ca useDailyStats să triggereze un refresh și în Progres când are loc o adăugare de antrenament
  const progressStats = useProgressStats(userId);
  const dailyStats = useDailyStats(userId, progressStats?.refreshData);

  return (
    <DashboardContext.Provider value={{ dailyStats, progressStats }}>
      {children}
    </DashboardContext.Provider>
  );
}

// Un hook micuț ca să accesăm datele ușor din pagini
export function useDashboardContext() {
  return useContext(DashboardContext);
}