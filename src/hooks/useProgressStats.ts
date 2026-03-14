"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';

export function useProgressStats(userId: string | null | undefined) {
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [weeklyBurned, setWeeklyBurned] = useState(0);
  const [evolutionData, setEvolutionData] = useState<{ zi: string, valoare: number, realCals: number }[]>([]);
  
  const [badges, setBadges] = useState({
    titan: false,
    hidratare: false,
    precizie: false
  });

  const fetchProgressData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    
    const today = new Date();
    // Generăm ultimele 7 zile (format YYYY-MM-DD)
    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const startDate = last7Days[0];
    const endDate = last7Days[6];

    try {
      // 1. Aducem datele din ultimele 7 zile (în paralel pentru viteză)
      const [
        { data: meals },
        { data: exercises },
        { data: waterStats }
      ] = await Promise.all([
        supabase.from('meals').select('date, calories').eq('user_id', userId).gte('date', startDate).lte('date', endDate),
        supabase.from('exercises').select('date, calories_burned').eq('user_id', userId).gte('date', startDate).lte('date', endDate),
        supabase.from('daily_stats').select('date, water_glasses').eq('user_id', userId).gte('date', startDate).lte('date', endDate)
      ]);

      // --- CALCUL GRAFIC EVOLUȚIE ---
      const dayNames = ["D", "L", "M", "M", "J", "V", "S"];
      const TARGET_CALORIES = 2500;
      
      const chartData = last7Days.map(dateStr => {
        const dayMeals = meals?.filter(m => m.date === dateStr) || [];
        const cals = dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
        
        const dateObj = new Date(dateStr);
        const ziName = dayNames[dateObj.getDay()];
        const percentage = cals > 0 ? Math.min(Math.round((cals / TARGET_CALORIES) * 100), 100) : 0;
        
        return { zi: ziName, valoare: percentage, realCals: cals };
      });
      setEvolutionData(chartData);

      // --- CALCUL STREAK ---
      let currentStreak = 0;
      for (let i = 6; i >= 0; i--) {
        const dateStr = last7Days[i];
        const hasActivity = (meals?.some(m => m.date === dateStr)) || (exercises?.some(e => e.date === dateStr));
        
        if (hasActivity) {
          currentStreak++;
        } else if (i !== 6) { 
          break; // Streak rupt
        }
      }
      setStreak(currentStreak);

      // --- CALCUL CALORII ARSE ---
      const totalBurned = exercises?.reduce((sum, e) => sum + (e.calories_burned || 0), 0) || 0;
      setWeeklyBurned(totalBurned);

      // --- VERIFICARE TROFEE ---
      const totalWater = waterStats?.reduce((sum, w) => sum + (w.water_glasses || 0), 0) || 0;
      const workoutCount = exercises?.length || 0;
      
      setBadges({
        titan: workoutCount >= 3,
        hidratare: totalWater >= 40,
        precizie: currentStreak >= 3
      });

    } catch (error) {
      console.error("Eroare la fetch progres:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  return {
    loading,
    streak,
    weeklyBurned,
    evolutionData,
    badges
  };
}