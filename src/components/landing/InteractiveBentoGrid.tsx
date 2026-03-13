"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';

import { useAuth } from '@/src/hooks/useAuth';
import { useDailyStats } from '@/src/hooks/useDailyStats';
import StatsBentoGrid from './StatsBentoGrid';

import CalorieModal from '@/src/components/modals/CalorieModal';
import WorkoutModal from '@/src/components/modals/WorkoutModal';
import WaterModal from '@/src/components/modals/WaterModal'; // Importăm noul modal

export default function InteractiveBentoGrid() {
  const { userId } = useAuth();
  const router = useRouter();

  const dailyStats = useDailyStats(userId);

  const [mockWater, setMockWater] = useState(5);
  const mockStats = { totalCalories: 1850, mealsCount: 3, totalProteins: 145, burnedCalories: 420, isSavingWater: false };

  const displayWater = userId ? dailyStats.waterGlasses : mockWater;
  const displayCalories = userId ? dailyStats.totalCalories : mockStats.totalCalories;
  const displayMealsCount = userId ? dailyStats.meals.length : mockStats.mealsCount;
  const displayProteins = userId ? dailyStats.totalProteins : mockStats.totalProteins;
  const displayBurnedCalories = userId ? dailyStats.burnedCalories : mockStats.burnedCalories;
  const displayIsSavingWater = userId ? dailyStats.isSavingWater : mockStats.isSavingWater;

  const [isCalorieModalOpen, setIsCalorieModalOpen] = useState(false);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false); // State pentru modalul de apă
  
  const [mealForm, setMealForm] = useState({ name: '', calories: '', protein: '' });

  const handleCalorieClick = () => {
    if (userId) setIsCalorieModalOpen(true);
    else alert("Pika! ⚡ Loghează-te pentru a-ți adăuga mesele!");
  };

  const handleProteinClick = () => {
    if (userId) setIsCalorieModalOpen(true); 
    else alert("Pika! ⚡ Loghează-te pentru a vedea aportul proteic!");
  };

  const handleWaterClick = () => {
    if (userId) setIsWaterModalOpen(true); // Deschide modalul în loc să ruteze
    else alert("Pika-pi! 💧 Loghează-te pentru a salva hidratarea!");
  };

  const handleWorkoutClick = () => {
    if (userId) setIsWorkoutModalOpen(true);
    else alert("Pika! ⚡ Loghează-te pentru a-ți vedea antrenamentele!");
  };

  // Această funcție o pasăm modalului de apă
  const handleDrinkWaterSubmit = async () => {
    if (userId) {
      await dailyStats.drinkWater();
    } else {
      if (mockWater < 8) setMockWater(prev => prev + 1);
      else alert("Pika-pi! 💧 Ai atins limita de test! Loghează-te pentru a salva pe bune!");
    }
  };

  // Click-ul direct pe butonul mic de pe card (dacă îl mai ai)
  const handleDrinkWaterDirectly = async (e: React.MouseEvent) => {
    e.stopPropagation();
    handleDrinkWaterSubmit();
  };

  const handleAddMealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealForm.name || !mealForm.calories) return;

    const success = await dailyStats.addMeal(mealForm.name, parseInt(mealForm.calories), parseInt(mealForm.protein) || 0);
    if (success) {
      setMealForm({ name: '', calories: '', protein: '' }); 
      setIsCalorieModalOpen(false); 
    } else {
      alert("A apărut o eroare la salvarea mesei.");
    }
  };

  return (
    <>
      <StatsBentoGrid
        totalCalories={displayCalories}
        mealsCount={displayMealsCount}
        totalProteins={displayProteins}
        currentWater={displayWater}
        isSavingWater={displayIsSavingWater}
        burnedCalories={displayBurnedCalories}
        handleCalorieClick={handleCalorieClick}
        handleProteinClick={handleProteinClick}
        handleWaterClick={handleWaterClick}
        handleDrinkWater={handleDrinkWaterDirectly}
        handleWorkoutClick={handleWorkoutClick}
      />

      <AnimatePresence>
        {isCalorieModalOpen && (
          <CalorieModal isOpen={isCalorieModalOpen} onClose={() => setIsCalorieModalOpen(false)} meals={dailyStats.meals} newMealName={mealForm.name} setNewMealName={(val) => setMealForm(prev => ({ ...prev, name: val }))} newMealCalories={mealForm.calories} setNewMealCalories={(val) => setMealForm(prev => ({ ...prev, calories: val }))} newMealProtein={mealForm.protein} setNewMealProtein={(val) => setMealForm(prev => ({ ...prev, protein: val }))} isSavingMeal={dailyStats.isSavingMeal} handleAddMeal={handleAddMealSubmit} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isWorkoutModalOpen && (
          <WorkoutModal isOpen={isWorkoutModalOpen} onClose={() => setIsWorkoutModalOpen(false)} burnedCalories={dailyStats.burnedCalories || 0} exercises={dailyStats.exercises || []} deleteExercise={dailyStats.deleteExercise} />
        )}
      </AnimatePresence>

      {/* MODALUL DE APĂ */}
      <AnimatePresence>
        {isWaterModalOpen && (
          <WaterModal 
            isOpen={isWaterModalOpen} 
            onClose={() => setIsWaterModalOpen(false)} 
            waterGlasses={displayWater}
            drinkWater={handleDrinkWaterSubmit}
            isSavingWater={displayIsSavingWater}
          />
        )}
      </AnimatePresence>
    </>
  );
}