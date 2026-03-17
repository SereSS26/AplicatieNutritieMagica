"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Meal } from '@/src/types';

export function useDailyStats(userId: string | null | undefined, refreshProgress?: () => void) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [todayWorkout, setTodayWorkout] = useState("Fără antrenament");
  const [burnedCalories, setBurnedCalories] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSavingMeal, setIsSavingMeal] = useState(false);
  const [isSavingWater, setIsSavingWater] = useState(false);
  const [isSavingExercise, setIsSavingExercise] = useState(false);

  const fetchTodayData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    try {
      const [waterRes, mealsRes, exercisesRes] = await Promise.all([
        supabase.from('daily_stats').select('water_glasses').eq('user_id', userId).eq('date', today).maybeSingle(),
        supabase.from('meals').select('*').eq('user_id', userId).eq('date', today).order('created_at', { ascending: true }),
        supabase.from('exercises').select('id, name, calories_burned').eq('user_id', userId).eq('date', today)
      ]);

      // Încearcă localStorage dacă Supabase nu are date
      if (waterRes.data) {
        setWaterGlasses(waterRes.data.water_glasses || 0);
      } else {
        const localKey = `water_${userId}_${today}`;
        const localWater = localStorage.getItem(localKey);
        if (localWater) {
          setWaterGlasses(parseInt(localWater));
        } else {
          setWaterGlasses(0);
        }
      }

      if (mealsRes.data && mealsRes.data.length > 0) {
        setMeals(mealsRes.data);
      } else {
        // Încearcă localStorage pentru mese dacă Supabase nu are date
        const localMealsKey = `meals_${userId}_${today}`;
        const localMeals = JSON.parse(localStorage.getItem(localMealsKey) || '[]');
        setMeals(localMeals);
      }

      if (exercisesRes.data && exercisesRes.data.length > 0) {
        setExercises(exercisesRes.data);
        setTodayWorkout(exercisesRes.data[0].name);
        const totalBurned = exercisesRes.data.reduce((sum, ex) => sum + (ex.calories_burned || 0), 0);
        setBurnedCalories(totalBurned);
      } else {
        // Încearcă localStorage pentru antrenamente dacă Supabase nu are date
        const localExercisesKey = `exercises_${userId}_${today}`;
        const localExercises = JSON.parse(localStorage.getItem(localExercisesKey) || '[]');
        if (localExercises.length > 0) {
          setExercises(localExercises);
          setTodayWorkout(localExercises[0].name);
          const totalBurned = localExercises.reduce((sum: number, ex: any) => sum + (ex.calories_burned || 0), 0);
          setBurnedCalories(totalBurned);
        } else {
          setExercises([]);
          setTodayWorkout("Fără antrenament");
          setBurnedCalories(0);
        }
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

      // Folosim datele din DB dacă există, altfel generăm local
      const newMeal = (data && !error) ? data : { id: Date.now().toString(), user_id: userId, date: today, name, calories, protein, created_at: new Date().toISOString() };

      // Salvăm MEREU și în localStorage pentru a preveni resetarea la 0 dacă DB nu returnează date
      const localKey = `meals_${userId}_${today}`;
      const existingMeals = JSON.parse(localStorage.getItem(localKey) || '[]');
      existingMeals.push(newMeal);
      localStorage.setItem(localKey, JSON.stringify(existingMeals));
      setMeals(prev => [...prev, newMeal]);
      return true;
    } catch (error) {
      console.error("Eroare la addMeal:", error);
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

      // Salvăm MEREU și în localStorage
      const key = `water_${userId}_${today}`;
      localStorage.setItem(key, JSON.stringify(newWaterCount));

      // Încearcă UPDATE mai întâi
      const { data: existingData, error: checkError } = await supabase
        .from('daily_stats')
        .select('id')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();

      let supabaseSuccess = false;

      if (existingData) {
        // Înregistrarea există - UPDATE
        const { error: updateError } = await supabase
          .from('daily_stats')
          .update({ water_glasses: newWaterCount })
          .eq('user_id', userId)
          .eq('date', today);

        if (!updateError) {
          console.log("Apa actualizată cu succes:", newWaterCount);
          supabaseSuccess = true;
        }
      } else {
        // Înregistrarea nu există - INSERT
        const { error: insertError } = await supabase
          .from('daily_stats')
          .insert({ user_id: userId, date: today, water_glasses: newWaterCount });

        if (!insertError) {
          console.log("Apa salvată cu succes (INSERT):", newWaterCount);
          supabaseSuccess = true;
        }
      }

      return true;
    } catch (error) {
      console.error("Eroare la drinkWater:", error);
      // Fallback pe localStorage în caz de eroare
      const today = new Date().toISOString().split('T')[0];
      const key = `water_${userId}_${today}`;
      localStorage.setItem(key, JSON.stringify(waterGlasses));
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
      await supabase.from('meals').delete().eq('id', mealId).eq('user_id', userId);
    } catch (error) {
      console.error("Eroare DB la ștergerea mesei:", error);
    }
    try {
      const today = new Date().toISOString().split('T')[0];
      const localMealsKey = `meals_${userId}_${today}`;
      const localMeals = JSON.parse(localStorage.getItem(localMealsKey) || '[]');
      const updatedMeals = localMeals.filter((meal: any) => meal.id !== mealId);
      localStorage.setItem(localMealsKey, JSON.stringify(updatedMeals));
      setMeals(prev => prev.filter(meal => meal.id !== mealId));
      return true;
    } catch (error) {
      return false;
    }
  };

  const deleteExercise = async (exerciseId: string) => {
    if (!userId) return false;
    try {
      await supabase.from('exercises').delete().eq('id', exerciseId).eq('user_id', userId);
    } catch (error) {
      console.error("Eroare DB la ștergerea exercițiului:", error);
    }
    try {
      const today = new Date().toISOString().split('T')[0];
      const localExercisesKey = `exercises_${userId}_${today}`;
      const localExercises = JSON.parse(localStorage.getItem(localExercisesKey) || '[]');
      const updatedExercises = localExercises.filter((ex: any) => ex.id !== exerciseId);
      localStorage.setItem(localExercisesKey, JSON.stringify(updatedExercises));

      setExercises(prev => {
        const newExercises = prev.filter(ex => ex.id !== exerciseId);
        const newTotal = newExercises.reduce((sum, ex) => sum + (ex.calories_burned || 0), 0);
        setBurnedCalories(newTotal);
        if (newExercises.length > 0) setTodayWorkout(newExercises[0].name);
        else setTodayWorkout("Fără antrenament");
        return newExercises;
      });
      if (refreshProgress) refreshProgress();
      return true;
    } catch (error) {
      return false;
    }
  };

  // --- UPDATE (NOU: Aici e logica de editare) ---
  const editMeal = async (id: string, name: string, calories: number, protein: number) => {
    if (!userId) return false;
    try {
      await supabase
        .from('meals')
        .update({ name, calories, protein })
        .eq('id', id)
        .eq('user_id', userId);
    } catch (error) {
      console.error("Eroare DB la editarea mesei:", error);
    }
    try {
      const today = new Date().toISOString().split('T')[0];
      const localMealsKey = `meals_${userId}_${today}`;
      const localMeals = JSON.parse(localStorage.getItem(localMealsKey) || '[]');
      const updatedMeals = localMeals.map((meal: any) =>
        meal.id === id ? { ...meal, name, calories, protein } : meal
      );
      localStorage.setItem(localMealsKey, JSON.stringify(updatedMeals));
      setMeals(prev => prev.map(meal => meal.id === id ? { ...meal, name, calories, protein } : meal));
      return true;
    } catch (error) {
      return false;
    }
  };

  const editExercise = async (id: string, name: string, calories_burned: number) => {
    if (!userId) return false;
    try {
      await supabase
        .from('exercises')
        .update({ name, calories_burned })
        .eq('id', id)
        .eq('user_id', userId);
    } catch (error) {
      console.error("Eroare DB la editarea antrenamentului:", error);
    }
    try {
      const today = new Date().toISOString().split('T')[0];
      const localExercisesKey = `exercises_${userId}_${today}`;
      const localExercises = JSON.parse(localStorage.getItem(localExercisesKey) || '[]');
      const updatedExercises = localExercises.map((ex: any) =>
        ex.id === id ? { ...ex, name, calories_burned } : ex
      );
      localStorage.setItem(localExercisesKey, JSON.stringify(updatedExercises));

      setExercises(prev => {
        const updated = prev.map(ex => ex.id === id ? { ...ex, name, calories_burned } : ex);
        const newTotal = updated.reduce((sum, e) => sum + (e.calories_burned || 0), 0);
        setBurnedCalories(newTotal);
        if (updated.length > 0) setTodayWorkout(updated[0].name);
        return updated;
      });
      if (refreshProgress) refreshProgress();
      return true;
    } catch (error) {
      return false;
    }
  };

  // --- ADD EXERCISE ---
  const addExercise = async (name: string, calories_burned: number) => {
    if (!userId) return false;
    setIsSavingExercise(true);
    const today = new Date().toISOString().split('T')[0];
    try {
      const { data, error } = await supabase
        .from('exercises')
        .insert([{ user_id: userId, date: today, name, calories_burned }])
        .select()
        .single();

      // Ne bazăm mereu pe copia locală ca metodă de siguranță
      const newExercise = (data && !error) ? data : { id: Date.now().toString(), user_id: userId, date: today, name, calories_burned, created_at: new Date().toISOString() };

      const localKey = `exercises_${userId}_${today}`;
      const existingExercises = JSON.parse(localStorage.getItem(localKey) || '[]');
      existingExercises.push(newExercise);
      localStorage.setItem(localKey, JSON.stringify(existingExercises));

      setExercises(prev => {
        const updated = [...prev, newExercise];
        const newTotal = updated.reduce((sum, ex) => sum + (ex.calories_burned || 0), 0);
        setBurnedCalories(newTotal);
        if (updated.length > 0) setTodayWorkout(updated[0].name);
        return updated;
      });
      if (refreshProgress) refreshProgress();
      return true;
    } catch (error) {
      console.error("Eroare la addExercise:", error);
      return false;
    } finally {
      setIsSavingExercise(false);
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
    isSavingExercise,
    addMeal,
    addExercise,
    drinkWater,
    deleteMeal,
    deleteExercise,
    editMeal,
    editExercise,
    refreshData: fetchTodayData
  };
}