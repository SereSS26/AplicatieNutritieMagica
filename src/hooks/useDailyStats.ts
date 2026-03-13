"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Meal } from '@/src/types';

export function useDailyStats(userId: string | null | undefined) {
  const [meals, setMeals] = useState<Meal[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [exercises, setExercises] = useState<any[]>([]);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [todayWorkout, setTodayWorkout] = useState("Fără antrenament");
  const [burnedCalories, setBurnedCalories] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [isSavingMeal, setIsSavingMeal] = useState(false);
  const [isSavingWater, setIsSavingWater] = useState(false);

  const fetchTodayData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    try {
      const [ waterRes, mealsRes, exercisesRes ] = await Promise.all([
        supabase.from('daily_stats').select('water_glasses').eq('user_id', userId).eq('date', today).maybeSingle(),
        supabase.from('meals').select('*').eq('user_id', userId).eq('date', today).order('created_at', { ascending: true }),
        supabase.from('exercises').select('id, name, calories_burned').eq('user_id', userId).eq('date', today)
      ]);

      if (waterRes.data) setWaterGlasses(waterRes.data.water_glasses || 0);
      if (mealsRes.data) setMeals(mealsRes.data);
      
      if (exercisesRes.data) {
        setExercises(exercisesRes.data);
        if (exercisesRes.data.length > 0) {
          setTodayWorkout(exercisesRes.data[0].name);
        } else {
          setTodayWorkout("Fără antrenament"); // Resetăm dacă e gol
        }
        const totalBurned = exercisesRes.data.reduce((sum, ex) => sum + (ex.calories_burned || 0), 0);
        setBurnedCalories(totalBurned);
      }
    } catch (error) {
      console.error("Eroare la fetch-ul datelor:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTodayData();
  }, [fetchTodayData]);

  // --- CREATE ---
  const addMeal = async (name: string, calories: number, protein: number) => {
    if (!userId) return false;
    setIsSavingMeal(true);
    const today = new Date().toISOString().split('T')[0];
    try {
      const { data, error } = await supabase.from('meals').insert([{ user_id: userId, date: today, name, calories, protein }]).select().single();
      if (error) throw error;
      setMeals(prev => [...prev, data]);
      return true;
    } catch {
      return false;
    } finally {
      setIsSavingMeal(false);
    }
  };

  const drinkWater = async () => {
    if (!userId) return false;
    setIsSavingWater(true);
    const newWaterCount = waterGlasses + 1;
    setWaterGlasses(newWaterCount); 
    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase.from('daily_stats').upsert({ user_id: userId, date: today, water_glasses: newWaterCount }, { onConflict: 'user_id, date' });
      if (error) throw error;
      return true;
    } catch {
      setWaterGlasses(prev => prev - 1); 
      return false;
    } finally {
      setIsSavingWater(false);
    }
  };

  // --- DELETE ---
  const deleteMeal = async (mealId: string) => {
    if (!userId) return false;
    try {
      const { error } = await supabase.from('meals').delete().eq('id', mealId).eq('user_id', userId);
      if (error) throw error;
      setMeals(prev => prev.filter(meal => meal.id !== mealId));
      return true;
    } catch (error) {
      console.error("Eroare la ștergerea mesei:", error);
      return false;
    }
  };

  const deleteExercise = async (exerciseId: string) => {
    if (!userId) return false;
    try {
      const { error } = await supabase.from('exercises').delete().eq('id', exerciseId).eq('user_id', userId);
      if (error) throw error;
      setExercises(prev => {
        const newExercises = prev.filter(ex => ex.id !== exerciseId);
        const newTotal = newExercises.reduce((sum, ex) => sum + (ex.calories_burned || 0), 0);
        setBurnedCalories(newTotal);
        if (newExercises.length > 0) setTodayWorkout(newExercises[0].name);
        else setTodayWorkout("Fără antrenament");
        return newExercises;
      });
      return true;
    } catch (error) {
      console.error("Eroare la ștergerea exercițiului:", error);
      return false;
    }
  };

  // --- UPDATE (NOU: Aici e logica de editare) ---
  const editMeal = async (id: string, name: string, calories: number, protein: number) => {
    if (!userId) return false;
    try {
      const { error } = await supabase
        .from('meals')
        .update({ name, calories, protein })
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Actualizăm UI-ul instant fără refresh
      setMeals(prev => prev.map(meal => meal.id === id ? { ...meal, name, calories, protein } : meal));
      return true;
    } catch (error) {
      console.error("Eroare la editarea mesei:", error);
      return false;
    }
  };

  const editExercise = async (id: string, name: string, calories_burned: number) => {
    if (!userId) return false;
    try {
      const { error } = await supabase
        .from('exercises')
        .update({ name, calories_burned })
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Actualizăm UI-ul și recalulăm caloriile arse instant
      setExercises(prev => {
        const updated = prev.map(ex => ex.id === id ? { ...ex, name, calories_burned } : ex);
        const newTotal = updated.reduce((sum, e) => sum + (e.calories_burned || 0), 0);
        setBurnedCalories(newTotal);
        if (updated.length > 0) setTodayWorkout(updated[0].name);
        return updated;
      });
      return true;
    } catch (error) {
      console.error("Eroare la editarea antrenamentului:", error);
      return false;
    }
  };

  // --- CALCULE UTILE ---
  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const totalProteins = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);

  return {
    meals,
    exercises,
    waterGlasses,
    todayWorkout,
    burnedCalories, 
    totalCalories,
    totalProteins,
    loading,
    isSavingMeal,
    isSavingWater,
    addMeal,
    drinkWater,
    deleteMeal,
    deleteExercise,
    editMeal,         // Am exportat editarea pentru mâncare
    editExercise,     // Am exportat editarea pentru antrenamente
    refreshData: fetchTodayData
  };
}