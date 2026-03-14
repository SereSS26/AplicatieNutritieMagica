"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, Beef, Droplets, Sparkles, Bot, Flame } from 'lucide-react';

// Importăm contextul global pentru performanță instantanee
import { useDashboardContext } from '@/src/context/DashboardContext';

// Componente Shared & Dashboard
import MealItem from '@/src/components/dashboard/MealItem';
import CalorieModal from '@/src/components/modals/CalorieModal';

export default function NutritiePage() {
  // Extragem datele din contextul global (gestionat în DashboardProvider)
  const { dailyStats } = useDashboardContext();
  
  const { 
    meals, 
    waterGlasses, 
    totalCalories, 
    totalProteins, 
    loading, 
    isSavingMeal, 
    addMeal 
  } = dailyStats;

  // Stări locale pentru gestionarea input-urilor din modal
  const [isCalorieModalOpen, setIsCalorieModalOpen] = useState(false);
  const [newMealName, setNewMealName] = useState('');
  const [newMealCalories, setNewMealCalories] = useState('');
  const [newMealProtein, setNewMealProtein] = useState('');

  // Funcție pentru salvarea unei mese noi folosind metoda din context
  const handleAddMealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealName || !newMealCalories) return;

    const success = await addMeal(newMealName, parseInt(newMealCalories), parseInt(newMealProtein) || 0);
    if (success) {
      setNewMealName(''); 
      setNewMealCalories(''); 
      setNewMealProtein('');
      setIsCalorieModalOpen(false); 
    } else {
      alert("A apărut o eroare la salvarea mesei.");
    }
  };

  const containerVariants = { 
    hidden: { opacity: 0 }, 
    show: { opacity: 1, transition: { staggerChildren: 0.1 } } 
  };
  
  const itemVariants = { 
    hidden: { opacity: 0, y: 20 }, 
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } } 
  };

  const TARGET_CALORIES = 2500;
  
  const dailyStatsConfig = [
    { nume: "Calorii", icon: Flame, valoare: totalCalories, max: TARGET_CALORIES, unit: " kcal", color: "text-orange-400", bg: "bg-orange-500" },
    { nume: "Proteine", icon: Beef, valoare: totalProteins, max: 180, unit: "g", color: "text-blue-400", bg: "bg-blue-500" },
    { nume: "Apă", icon: Droplets, valoare: waterGlasses, max: 8, unit: " pahare", color: "text-cyan-400", bg: "bg-cyan-500" },
  ];

  const getMealTypeByHour = (hour: number) => {
    if (hour < 11) return "Mic Dejun";
    if (hour < 16) return "Prânz";
    if (hour < 19) return "Snack";
    return "Cină";
  };

  return (
    <main className="w-full flex-1 overflow-x-hidden p-6 lg:p-12 relative z-10">
      
      {/* Lumini fundal (fixate pentru a nu lărgi pagina) */}
      <div className="fixed top-[20%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        <header className="flex justify-between items-center mb-10 bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Plan <span className="text-fuchsia-500">Nutriție AI</span>
          </h1>
          
          
          
        </header>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Partea Stângă: Statistici și Obiective */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-fuchsia-600/20 to-purple-900/20 border border-fuchsia-500/30 p-8 rounded-[32px] backdrop-blur-md relative overflow-hidden">
               <Sparkles className="absolute top-4 right-4 text-fuchsia-500/40" size={40} />
               <h2 className="text-gray-400 font-medium mb-2">Total Calorii (Azi)</h2>
               <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-6xl font-black text-white tracking-tighter">
                    {loading ? "..." : totalCalories.toLocaleString('en-US')}
                  </span>
                  <span className="text-fuchsia-400 font-medium">/ {TARGET_CALORIES} kcal</span>
               </div>
               <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-4">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((totalCalories / TARGET_CALORIES) * 100, 100)}%` }} 
                    className="bg-fuchsia-500 h-full rounded-full" 
                  />
               </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-md flex flex-col gap-6">
              <h3 className="font-bold text-lg mb-2">Sumar Obiective</h3>
              {dailyStatsConfig.map((stat, i) => (
                <div key={i}>
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                      <stat.icon size={18} className={stat.color} />
                      <span className="text-sm font-medium text-gray-300">{stat.nume}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-bold text-white">{stat.valoare}</span>
                      <span className="text-gray-500"> / {stat.max}{stat.unit}</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${Math.min((stat.valoare / stat.max) * 100, 100)}%` }} 
                      transition={{ duration: 1, delay: 0.5 + (i * 0.2) }} 
                      className={`${stat.bg} h-full rounded-full`} 
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Partea Dreaptă: Lista de Mese */}
          <motion.div variants={itemVariants} className="lg:col-span-7 bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-sm flex flex-col h-full min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Apple className="text-fuchsia-500" /> Meniul de azi
              </h3>
              <button 
                onClick={() => setIsCalorieModalOpen(true)} 
                className="flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-fuchsia-600 px-4 py-2 rounded-full transition-colors"
              >
                + Adaugă Masă
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {loading ? (
                <p className="text-gray-500 text-sm text-center py-8">Se încarcă mesele...</p>
              ) : meals.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-8">
                  <Bot size={40} className="text-gray-500" />
                  <p className="text-gray-400 text-sm">Nu ai adăugat nicio masă încă azi.</p>
                </div>
              ) : (
                meals.map((meal) => {
                  const dateObj = meal.created_at ? new Date(meal.created_at) : new Date();
                  const timeString = dateObj.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <MealItem 
                      key={meal.id} 
                      time={`${timeString} • ${getMealTypeByHour(dateObj.getHours())}`} 
                      name={meal.name} 
                      cals={`${meal.calories} kcal`} 
                      protein={meal.protein} 
                      status="done" 
                    />
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Modal de Adăugare Mese */}
      <AnimatePresence>
        {isCalorieModalOpen && (
          <CalorieModal 
            isOpen={isCalorieModalOpen} 
            onClose={() => setIsCalorieModalOpen(false)} 
            meals={meals} 
            newMealName={newMealName} 
            setNewMealName={setNewMealName} 
            newMealCalories={newMealCalories} 
            setNewMealCalories={setNewMealCalories} 
            newMealProtein={newMealProtein} 
            setNewMealProtein={setNewMealProtein} 
            isSavingMeal={isSavingMeal} 
            handleAddMeal={handleAddMealSubmit} 
          />
        )}
      </AnimatePresence>

    </main>
  );
}