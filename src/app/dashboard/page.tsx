"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardContext } from '@/src/context/DashboardContext';

import DashboardHeader from '@/src/components/dashboard/DashboardHeader';
import DashboardStatsGrid from '@/src/components/dashboard/DashboardStatsGrid';
import FitnessCalendar from '@/src/components/dashboard/FitnessCalendar';
import MealsList from '@/src/components/dashboard/MealsList';
import CalorieModal from '@/src/components/modals/CalorieModal';
import WorkoutModal from '@/src/components/modals/WorkoutModal';
import WaterModal from '@/src/components/modals/WaterModal'; // Importăm modalul

export default function Dashboard() {
  const { dailyStats } = useDashboardContext();
  const { meals, exercises, waterGlasses, burnedCalories, loading, isSavingMeal, isSavingWater, addMeal, deleteExercise, drinkWater } = dailyStats;

  const [isCalorieModalOpen, setIsCalorieModalOpen] = useState(false);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false); 
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false); // State pentru apă

  const [mealForm, setMealForm] = useState({ name: '', calories: '', protein: '' });

  const handleAddMealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealForm.name || !mealForm.calories) return;

    const success = await addMeal(mealForm.name, parseInt(mealForm.calories), parseInt(mealForm.protein) || 0);
    if (success) {
      setMealForm({ name: '', calories: '', protein: '' });
      setIsCalorieModalOpen(false); 
    } else {
      alert("A apărut o eroare la salvarea mesei.");
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } } };

  return (
    <main className="w-full flex-1 p-6 lg:p-12 relative z-10">
      <motion.div className="max-w-7xl mx-auto" initial="hidden" animate="show" variants={containerVariants}>
        
        <motion.div variants={itemVariants}>
          <DashboardHeader />
        </motion.div>

        <motion.div variants={itemVariants}>
          <DashboardStatsGrid 
             onOpenWorkout={() => setIsWorkoutModalOpen(true)} 
             onOpenWater={() => setIsWaterModalOpen(true)} // Trimitem funcția!
          />
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 min-h-[500px]">
          <motion.div variants={itemVariants} className="h-full">
            <FitnessCalendar />
          </motion.div>

          <motion.div variants={itemVariants} className="h-full">
            <MealsList 
              meals={meals} 
              loading={loading} 
              onAddClick={() => setIsCalorieModalOpen(true)} 
            />
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isCalorieModalOpen && (
          <CalorieModal isOpen={isCalorieModalOpen} onClose={() => setIsCalorieModalOpen(false)} meals={meals} newMealName={mealForm.name} setNewMealName={(val) => setMealForm(prev => ({...prev, name: val}))} newMealCalories={mealForm.calories} setNewMealCalories={(val) => setMealForm(prev => ({...prev, calories: val}))} newMealProtein={mealForm.protein} setNewMealProtein={(val) => setMealForm(prev => ({...prev, protein: val}))} isSavingMeal={isSavingMeal} handleAddMeal={handleAddMealSubmit} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isWorkoutModalOpen && (
          <WorkoutModal isOpen={isWorkoutModalOpen} onClose={() => setIsWorkoutModalOpen(false)} burnedCalories={burnedCalories || 0} exercises={exercises} deleteExercise={deleteExercise} />
        )}
      </AnimatePresence>

      {/* Adăugăm Modalul de apă și aici */}
      <AnimatePresence>
        {isWaterModalOpen && (
          <WaterModal 
            isOpen={isWaterModalOpen} 
            onClose={() => setIsWaterModalOpen(false)} 
            waterGlasses={waterGlasses}
            drinkWater={drinkWater}
            isSavingWater={isSavingWater}
          />
        )}
      </AnimatePresence>
    </main>
  );
}