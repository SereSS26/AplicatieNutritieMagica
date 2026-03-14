"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';

export function useProgressStats(userId: string | null | undefined) {
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [weeklyBurned, setWeeklyBurned] = useState(0);
  const [evolutionData, setEvolutionData] = useState<{ zi: string, valoare: number, realCals: number, eaten: number, burned: number, water: number }[]>([]);
  
  const [avgMacros, setAvgMacros] = useState({ protein: 0, carbs: 0, fat: 0 });

  const [prevWeeklyBurned, setPrevWeeklyBurned] = useState(0);
  const [prevWeeklyEaten, setPrevWeeklyEaten] = useState(0);
  const [prevStreak, setPrevStreak] = useState(0);

  // Heatmap Data va include acum și un flag 'isFuture'
  const [heatmapData, setHeatmapData] = useState<{ date: string, intensity: number, isFuture: boolean }[]>([]);

  const [badges, setBadges] = useState({
    titan: false,
    hidratare: false,
    precizie: false
  });

  const [userGoals, setUserGoals] = useState({
    calories: 2500,
    water: 8,
    weeklyWorkouts: 3
  });

  const [weeklyWorkoutCount, setWeeklyWorkoutCount] = useState(0);

  const fetchProgressData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    
    const today = new Date();
    
    // --- SETĂRI PENTRU CALENDARUL HEATMAP ---
    const PAST_DAYS = 182; // Jumătate de an (26 săptămâni) în trecut
    const FUTURE_DAYS = 14; // 2 săptămâni în viitor
    const TOTAL_DAYS = PAST_DAYS + FUTURE_DAYS; // 196 zile total (fix 28 coloane)

    const heatmapDays = Array.from({length: TOTAL_DAYS}, (_, i) => {
      const d = new Date();
      // i = PAST_DAYS - 1 va reprezenta "Azi"
      d.setDate(today.getDate() - (PAST_DAYS - 1 - i));
      return d.toISOString().split('T')[0];
    });

    const heatmapStartDate = heatmapDays[0];
    const heatmapEndDate = heatmapDays[PAST_DAYS - 1]; // Limita de căutare in DB este ziua de azi

    // Pentru evoluția grafică și totaluri avem nevoie exact de ultimele 14 zile
    const last14Days = Array.from({length: 14}, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (13 - i));
      return d.toISOString().split('T')[0];
    });

    try {
      // 1. Aducem TOATE datele din baza de date pentru intervalul relevant (fără viitor)
      const [
        { data: { session } },
        { data: allMeals },
        { data: allExercises },
        { data: allWater }
      ] = await Promise.all([
        supabase.auth.getSession(),
        supabase.from('meals').select('date, calories, protein, carbs, fat').eq('user_id', userId).gte('date', heatmapStartDate).lte('date', heatmapEndDate),
        supabase.from('exercises').select('date, calories_burned').eq('user_id', userId).gte('date', heatmapStartDate).lte('date', heatmapEndDate),
        supabase.from('daily_stats').select('date, water_glasses').eq('user_id', userId).gte('date', heatmapStartDate).lte('date', heatmapEndDate)
      ]);

      if (session?.user?.user_metadata) {
        const meta = session.user.user_metadata;
        setUserGoals({
          calories: parseInt(meta.calorie_goal || '2500'),
          water: parseInt(meta.water_goal || '8'),
          weeklyWorkouts: parseInt(meta.weekly_workout_goal || '3')
        });
      }

      // ─── CALCUL HEATMAP (196 ZILE) ───
      const generatedHeatmap = heatmapDays.map((dateStr, index) => {
        const isFuture = index >= PAST_DAYS;

        // Dacă e în viitor, nu are sens să căutăm în DB
        if (isFuture) {
          return { date: dateStr, intensity: 0, isFuture: true };
        }

        const dayMealsCount = allMeals?.filter(m => m.date === dateStr).length || 0;
        const dayExercisesCount = allExercises?.filter(e => e.date === dateStr).length || 0;
        const dayWaterObj = allWater?.find(w => w.date === dateStr);
        const waterCount = dayWaterObj && dayWaterObj.water_glasses > 0 ? 1 : 0;

        const localMeals = JSON.parse(localStorage.getItem(`meals_${userId}_${dateStr}`) || '[]');
        const localExercises = JSON.parse(localStorage.getItem(`exercises_${userId}_${dateStr}`) || '[]');
        const localWater = localStorage.getItem(`water_${userId}_${dateStr}`);

        const totalMeals = Math.max(dayMealsCount, localMeals.length);
        const totalExercises = Math.max(dayExercisesCount, localExercises.length);
        const totalWater = Math.max(waterCount, localWater && parseInt(localWater) > 0 ? 1 : 0);

        // Algoritm Punctaj
        const activityScore = totalMeals + (totalExercises * 2) + totalWater;
        
        let intensity = 0;
        if (activityScore > 0) intensity = 1;
        if (activityScore >= 3) intensity = 2; 
        if (activityScore >= 5) intensity = 3; 
        if (activityScore >= 7) intensity = 4; 

        return { date: dateStr, intensity, isFuture: false };
      });
      setHeatmapData(generatedHeatmap);


      // ─── CALCUL EVOLUȚIE DETALIATĂ & COMPARAȚIE (Ultimele 14 Zile) ───
      const dayNames = ["D", "L", "M", "M", "J", "V", "S"];
      const TARGET_CALORIES = parseInt(session?.user?.user_metadata?.calorie_goal || '2500');
      
      let calculatedTotalBurned = 0;
      let calculatedTotalEaten = 0;
      let calculatedWorkoutCount = 0;
      let calculatedTotalWater = 0;
      
      let calculatedTotalProtein = 0;
      let calculatedTotalCarbs = 0;
      let calculatedTotalFat = 0;

      const currentWeekActivity: boolean[] = [];

      let previousTotalBurned = 0;
      let previousTotalEaten = 0;
      const previousWeekActivity: boolean[] = [];

      const chartData = [];

      for (let i = 0; i < 14; i++) {
        const dateStr = last14Days[i];
        
        const localMeals = JSON.parse(localStorage.getItem(`meals_${userId}_${dateStr}`) || '[]');
        const dayMeals = (allMeals?.filter(m => m.date === dateStr)?.length ? allMeals.filter(m => m.date === dateStr) : localMeals) || [];
        
        const calsEaten = dayMeals.reduce((sum: number, m: any) => sum + (m.calories || 0), 0);
        const dayProtein = dayMeals.reduce((sum: number, m: any) => sum + (m.protein || 0), 0);
        const dayCarbs = dayMeals.reduce((sum: number, m: any) => sum + (m.carbs || 0), 0);
        const dayFat = dayMeals.reduce((sum: number, m: any) => sum + (m.fat || 0), 0);
        
        const localExercises = JSON.parse(localStorage.getItem(`exercises_${userId}_${dateStr}`) || '[]');
        const dayExercises = (allExercises?.filter(e => e.date === dateStr)?.length ? allExercises.filter(e => e.date === dateStr) : localExercises) || [];
        const calsBurned = dayExercises.reduce((sum: number, e: any) => sum + (e.calories_burned || e.calories || 0), 0);

        const dayWaterObj = allWater?.find(w => w.date === dateStr);
        let waterCount = 0;
        if (dayWaterObj) {
          waterCount = dayWaterObj.water_glasses || 0;
        } else {
          const localWater = localStorage.getItem(`water_${userId}_${dateStr}`);
          if (localWater) waterCount = parseInt(localWater);
        }

        const hasActivity = dayMeals.length > 0 || dayExercises.length > 0;

        if (i >= 7) {
          // SĂPTĂMÂNA CURENTĂ
          calculatedTotalBurned += calsBurned;
          calculatedTotalEaten += calsEaten;
          calculatedWorkoutCount += dayExercises.length;
          calculatedTotalWater += waterCount;
          
          calculatedTotalProtein += dayProtein;
          calculatedTotalCarbs += dayCarbs;
          calculatedTotalFat += dayFat;

          currentWeekActivity.push(hasActivity);

          const dateObj = new Date(dateStr);
          const ziName = dayNames[dateObj.getDay()];
          const percentage = calsEaten > 0 ? Math.min(Math.round((calsEaten / TARGET_CALORIES) * 100), 100) : 0;
          
          chartData.push({ zi: ziName, valoare: percentage, realCals: calsEaten, eaten: calsEaten, burned: calsBurned, water: waterCount });
        } else {
          // SĂPTĂMÂNA ANTERIOARĂ
          previousTotalBurned += calsBurned;
          previousTotalEaten += calsEaten;
          previousWeekActivity.push(hasActivity);
        }
      }

      setEvolutionData(chartData);
      setWeeklyBurned(calculatedTotalBurned);
      setWeeklyWorkoutCount(calculatedWorkoutCount);
      setPrevWeeklyBurned(previousTotalBurned);
      setPrevWeeklyEaten(previousTotalEaten);
      
      setAvgMacros({
        protein: Math.round(calculatedTotalProtein / 7),
        carbs: Math.round(calculatedTotalCarbs / 7),
        fat: Math.round(calculatedTotalFat / 7)
      });

      // --- CALCUL STREAK ---
      let currentStreak = 0;
      for (let i = 6; i >= 0; i--) {
        if (currentWeekActivity[i]) {
          currentStreak++;
        } else if (i === 6) {
          continue; 
        } else {
          break;
        }
      }
      setStreak(currentStreak);

      let previousStreak = 0;
      for (let i = 6; i >= 0; i--) {
        if (previousWeekActivity[i]) {
          previousStreak++;
        } else if (i === 6) {
          continue;
        } else {
          break;
        }
      }
      setPrevStreak(previousStreak);

      const weeklyWaterGoalTotal = (parseInt(session?.user?.user_metadata?.water_goal || '8')) * 7;
      const weeklyWorkoutGoalNum = parseInt(session?.user?.user_metadata?.weekly_workout_goal || '3');

      setBadges({
        titan: calculatedWorkoutCount >= weeklyWorkoutGoalNum,
        hidratare: calculatedTotalWater >= (weeklyWaterGoalTotal * 0.8),
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
    badges,
    userGoals,
    weeklyWorkoutCount,
    prevWeeklyBurned,
    prevWeeklyEaten,
    prevStreak,
    avgMacros,
    heatmapData, 
    refreshData: fetchProgressData
  };
}