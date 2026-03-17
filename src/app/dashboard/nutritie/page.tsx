"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, Beef, Droplets, Sparkles, Bot, Flame, Loader2, ChevronRight, X, ArrowLeft, Check, Play } from 'lucide-react';

import { useDashboardContext } from '@/src/context/DashboardContext';
import { supabase } from '@/src/lib/supabase';
import { useUserGoals } from '@/src/hooks/useUserGoals'; // Hook-ul tău global!

import MealItem from '@/src/components/dashboard/MealItem';
import CalorieModal from '@/src/components/modals/CalorieModal';

// --- TIPURI DE DATE ---
type FoodItem = {
  id: string; name: string; calories: number; protein: number; carbs: number; fat: number; amount: string;
};
type PlanMeal = { name: string; foods: FoodItem[]; };
type DailyPlan = { day: string; meals: PlanMeal[]; };

// --- SVG MATH ---
const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
  const rad = (angle - 90) * Math.PI / 180.0;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const createDonutSlice = (cx: number, cy: number, outerRadius: number, innerRadius: number, startAngle: number, endAngle: number) => {
  let end = endAngle;
  if (end - startAngle >= 360) end = startAngle + 359.999;
  const startOuter = polarToCartesian(cx, cy, outerRadius, end);
  const endOuter = polarToCartesian(cx, cy, outerRadius, startAngle);
  const startInner = polarToCartesian(cx, cy, innerRadius, end);
  const endInner = polarToCartesian(cx, cy, innerRadius, startAngle);
  const largeArc = end - startAngle <= 180 ? "0" : "1";
  return ["M", startOuter.x, startOuter.y, "A", outerRadius, outerRadius, 0, largeArc, 0, endOuter.x, endOuter.y, "L", endInner.x, endInner.y, "A", innerRadius, innerRadius, 0, largeArc, 1, startInner.x, startInner.y, "Z"].join(" ");
};

export default function NutritiePage() {
  const { dailyStats } = useDashboardContext();
  const { meals, waterGlasses, totalCalories, totalProteins, loading, isSavingMeal, addMeal, deleteMeal } = dailyStats;

  const [isCalorieModalOpen, setIsCalorieModalOpen] = useState(false);
  const [newMealName, setNewMealName] = useState('');
  const [newMealCalories, setNewMealCalories] = useState('');
  const [newMealProtein, setNewMealProtein] = useState('');

  const [viewState, setViewState] = useState<'idle' | 'generating' | 'ready'>('idle');
  const [selectedDay, setSelectedDay] = useState("Luni");
  const [selectedPlanMeal, setSelectedPlanMeal] = useState<PlanMeal | null>(null);
  const [hoveredFoodId, setHoveredFoodId] = useState<string | null>(null);
  const [plan, setPlan] = useState<DailyPlan[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [userId, setUserId] = useState<string | null>(null);
  const [hasSavedPlan, setHasSavedPlan] = useState<boolean>(false);

  // Preluăm TOATE obiectivele din hook-ul tău curat
  const { targetCalories, targetProtein, targetWater, loadingGoals } = useUserGoals();

  // EFECTUL REPARAT: Ne asigurăm că butonul "Continuă Planul" apare corect!
  useEffect(() => {
    const checkSavedPlan = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const currentUserId = session.user.id;
        setUserId(currentUserId);
        
        // Căutăm planul în memoria locală
        const savedPlan = localStorage.getItem(`ai_meal_plan_${currentUserId}`);
        if (savedPlan && savedPlan !== "undefined") {
          setHasSavedPlan(true);
        }
      }
    };
    checkSavedPlan();
  }, []);
  
  const currentDayPlan = plan.find(p => p.day === selectedDay) || plan[0];

  const handleGenerate = async () => {
    setViewState('generating');
    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetCalories: targetCalories })
      });
      if (!res.ok) throw new Error("Eroare la generare");
      const data = await res.json();
      
      setPlan(data);
      setViewState('ready');
      
      if (userId) {
        localStorage.setItem(`ai_meal_plan_${userId}`, JSON.stringify(data));
        setHasSavedPlan(true); // Actualizăm state-ul ca să apară butonul pentru dățile viitoare
      }
    } catch (err) {
      console.error(err);
      alert("AI-ul a întâmpinat o eroare de rețea. Mai încearcă o dată!");
      setViewState('idle');
    }
  };

  // Funcția pentru butonul "Continuă Planul"
  const handleContinuePlan = () => {
    if (!userId) return;
    const savedPlan = localStorage.getItem(`ai_meal_plan_${userId}`);
    if (savedPlan && savedPlan !== "undefined") {
      setPlan(JSON.parse(savedPlan));
      setViewState('ready');
    }
  };

  const handleAddMealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealName || !newMealCalories) return;
    const success = await addMeal(newMealName, parseInt(newMealCalories), parseInt(newMealProtein) || 0);
    if (success) {
      setNewMealName(''); setNewMealCalories(''); setNewMealProtein(''); setIsCalorieModalOpen(false); 
    } else {
      alert("A apărut o eroare la salvarea mesei.");
    }
  };

  const handleAddPlanMeal = async () => {
    if (!selectedPlanMeal) return;
    const totalCals = selectedPlanMeal.foods.reduce((a, b) => a + b.calories, 0);
    const totalProt = selectedPlanMeal.foods.reduce((a, b) => a + b.protein, 0);
    
    const success = await addMeal(`${selectedPlanMeal.name} (AI)`, totalCals, totalProt);
    if (success) {
      setSelectedPlanMeal(null); setHoveredFoodId(null); setViewState('idle'); 
    } else {
      alert("A apărut o eroare la salvarea mesei.");
    }
  };

  const handleDeleteMeal = async (id: string) => {
    setDeletingId(id);
    await deleteMeal(id);
    setDeletingId(null);
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } } };
  
  const dailyStatsConfig = [
    { nume: "Calorii", icon: Flame, valoare: totalCalories, max: targetCalories, unit: " kcal", color: "text-orange-400", bg: "bg-orange-500" },
    { nume: "Proteine", icon: Beef, valoare: totalProteins, max: targetProtein, unit: "g", color: "text-blue-400", bg: "bg-blue-500" },
    { nume: "Apă", icon: Droplets, valoare: waterGlasses, max: targetWater, unit: " pahare", color: "text-cyan-400", bg: "bg-cyan-500" },
  ];

  const getMealTypeByHour = (hour: number) => {
    if (hour < 11) return "Mic Dejun";
    if (hour < 16) return "Prânz";
    if (hour < 19) return "Snack";
    return "Cină";
  };

  if (loadingGoals) return <div className="p-12 text-center text-white flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-fuchsia-500 mr-3" /> Se încarcă profilul...</div>;

  return (
    <main className="w-full flex-1 overflow-x-hidden p-6 lg:p-12 relative z-10">
      <div className="fixed top-[20%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {viewState === 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="flex justify-between items-center mb-10 bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md">
              <h1 className="text-2xl font-bold flex items-center gap-2">Plan <span className="text-fuchsia-500">Nutriție AI</span></h1>
            </header>

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                <motion.div variants={itemVariants} className="bg-gradient-to-br from-fuchsia-600/20 to-purple-900/20 border border-fuchsia-500/30 p-8 rounded-[32px] backdrop-blur-md relative overflow-hidden flex flex-col justify-center">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-[40px] pointer-events-none" />
                   <h2 className="text-2xl font-black mb-2 text-white relative z-10">Obiectiv: <span className="text-fuchsia-400">{targetCalories} kcal</span> / zi</h2>
                   <p className="text-gray-300 text-sm mb-6 relative z-10">Lasă AI-ul să îți structureze mesele și macronutrienții perfecți pentru ziua ta, luând în calcul necesarul tău caloric.</p>
                   
                   {/* BUTOANELE RESTAURATE CORECT */}
                   <div className="flex flex-col gap-3 relative z-10">
                     <button onClick={handleGenerate} className="w-full bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white font-black text-sm uppercase tracking-widest px-6 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(217,70,239,0.3)] hover:-translate-y-1">
                       <Sparkles size={20} /> {hasSavedPlan ? "Generează Plan Nou" : "Generează Plan Alimentar"}
                     </button>

                     {hasSavedPlan && (
                       <button onClick={handleContinuePlan} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm uppercase tracking-widest px-6 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all hover:-translate-y-1 shadow-lg">
                         <Play size={20} className="text-fuchsia-400" /> Continuă Planul Salvat
                       </button>
                     )}
                   </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-md flex flex-col gap-6">
                  <h3 className="font-bold text-lg mb-2">Sumar Obiective Astăzi</h3>
                  {dailyStatsConfig.map((stat, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-2"><stat.icon size={18} className={stat.color} /><span className="text-sm font-medium text-gray-300">{stat.nume}</span></div>
                        <div className="text-sm"><span className="font-bold text-white">{stat.valoare}</span><span className="text-gray-500"> / {stat.max}{stat.unit}</span></div>
                      </div>
                      <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((stat.valoare / stat.max) * 100, 100)}%` }} transition={{ duration: 1, delay: 0.5 + (i * 0.2) }} className={`${stat.bg} h-full rounded-full`} />
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>

              <motion.div variants={itemVariants} className="lg:col-span-7 bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-sm flex flex-col h-full min-h-[500px]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Apple className="text-fuchsia-500" /> Meniul de azi</h3>
                  <button onClick={() => setIsCalorieModalOpen(true)} className="flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-fuchsia-600 px-4 py-2 rounded-full transition-colors">+ Adaugă Masă</button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {loading ? (
                    <p className="text-gray-500 text-sm text-center py-8">Se încarcă mesele...</p>
                  ) : meals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-8"><Bot size={40} className="text-gray-500" /><p className="text-gray-400 text-sm">Nu ai adăugat nicio masă încă azi.</p></div>
                  ) : (
                    meals.map((meal) => {
                      const dateObj = meal.created_at ? new Date(meal.created_at) : new Date();
                      const timeString = dateObj.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
                      return (
                        <MealItem key={meal.id} time={`${timeString} • ${getMealTypeByHour(dateObj.getHours())}`} name={meal.name} cals={`${meal.calories} kcal`} protein={meal.protein} status="done" onDelete={() => handleDeleteMeal(meal.id)} isDeleting={deletingId === meal.id} />
                      );
                    })
                  )}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {viewState === 'generating' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-white">
            <Loader2 className="animate-spin text-fuchsia-500 w-16 h-16 mb-6" />
            <div className="flex items-center gap-2 flex-col">
              <Sparkles className="text-yellow-400" size={24} />
              <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-blue-400 uppercase tracking-widest animate-pulse text-lg text-center mt-2">Gemini gândește... <br/><span className="text-xs text-gray-500 mt-2 block">Se construiește meniul tău personalizat (durează ~5 secunde)</span></p>
            </div>
          </motion.div>
        )}

        {viewState === 'ready' && currentDayPlan && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <button onClick={() => setViewState('idle')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors font-bold text-sm"><ArrowLeft size={16} /> Înapoi la Jurnalul Zilnic</button>
            <div className="mb-10">
              <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2 flex items-center gap-3">Plan <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Alimentar</span> <Flame size={32} className="text-orange-500" /></h1>
              <p className="text-gray-400">Structurat inteligent pentru obiectivul tău de <span className="text-white font-bold">{targetCalories} kcal</span>.</p>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar mb-8">
              {plan.map(p => (
                <button key={p.day} onClick={() => setSelectedDay(p.day)} className={`px-8 py-3 rounded-2xl font-black uppercase tracking-wider text-sm transition-all whitespace-nowrap shrink-0 ${selectedDay === p.day ? 'bg-fuchsia-600 text-white shadow-[0_0_30px_rgba(217,70,239,0.3)] scale-105' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>{p.day}</button>
              ))}
            </div>

            <motion.div key={selectedDay} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentDayPlan.meals.map((meal) => {
                const totalCals = meal.foods.reduce((acc, f) => acc + f.calories, 0);
                const totalProt = meal.foods.reduce((acc, f) => acc + f.protein, 0);
                return (
                  <div key={meal.name} onClick={() => setSelectedPlanMeal(meal)} className="bg-[#0a0a0a] border border-white/5 hover:border-fuchsia-500/50 p-6 rounded-[32px] cursor-pointer group transition-all duration-300 hover:-translate-y-2 shadow-xl hover:shadow-[0_10px_40px_rgba(217,70,239,0.1)] flex flex-col justify-between min-h-[200px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-[40px] group-hover:bg-fuchsia-500/20 transition-colors" />
                    <div>
                      <div className="flex justify-between items-center mb-2"><h3 className="text-xl font-black text-white">{meal.name}</h3><div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-fuchsia-500 transition-colors"><ChevronRight size={16} className="text-gray-400 group-hover:text-white transition-colors" /></div></div>
                      <p className="text-sm text-gray-500">{meal.foods.length} ingrediente detectate</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-end">
                      <div><p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Est. Calorii</p><p className="text-2xl font-black text-fuchsia-400">{totalCals} <span className="text-sm text-gray-500 font-medium">kcal</span></p></div>
                      <div className="text-right"><p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Proteine</p><p className="text-lg font-bold text-white">{totalProt}g</p></div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isCalorieModalOpen && viewState === 'idle' && (
          <CalorieModal isOpen={isCalorieModalOpen} onClose={() => setIsCalorieModalOpen(false)} meals={meals} newMealName={newMealName} setNewMealName={setNewMealName} newMealCalories={newMealCalories} setNewMealCalories={setNewMealCalories} newMealProtein={newMealProtein} setNewMealProtein={setNewMealProtein} isSavingMeal={isSavingMeal} handleAddMeal={handleAddMealSubmit} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPlanMeal && viewState === 'ready' && (() => {
          const totalCals = selectedPlanMeal.foods.reduce((a, b) => a + b.calories, 0);
          const COLORS = ["#d946ef", "#3b82f6", "#f97316", "#06b6d4", "#10b981", "#eab308"];
          let currentAngle = 0;
          const slices = selectedPlanMeal.foods.map((food, index) => {
            const sliceAngle = (food.calories / totalCals) * 360;
            const startAngle = currentAngle; const endAngle = currentAngle + sliceAngle; currentAngle += sliceAngle;
            return { ...food, startAngle, endAngle, color: COLORS[index % COLORS.length] };
          });
          const hoveredFood = slices.find(s => s.id === hoveredFoodId);
          const sortedSlices = [...slices].sort((a, b) => (hoveredFoodId === a.id ? 1 : (hoveredFoodId === b.id ? -1 : 0)));

          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-6">
              <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#050505] border border-white/10 rounded-[28px] p-6 md:p-8 shadow-2xl flex flex-col items-center">
                  <button onClick={() => { setSelectedPlanMeal(null); setHoveredFoodId(null); }} className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-full flex items-center justify-center transition-colors z-50"><X size={20} /></button>
                  <h2 className="text-2xl md:text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-blue-400 mb-1 text-center">{selectedPlanMeal.name}</h2>
                  <p className="text-gray-400 mb-8 text-xs md:text-sm text-center">Treci cu mouse-ul peste graficul din farfurie pentru a vedea detaliile.</p>

                  <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-8 lg:gap-4 mb-8">
                    <div className="w-full lg:w-1/3 flex flex-col justify-center min-h-[220px] bg-white/5 rounded-[24px] p-6 border border-white/10 transition-all">
                      {hoveredFood ? (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-center text-center">
                          <h4 className="text-lg font-black mb-1 leading-tight" style={{ color: hoveredFood.color }}>{hoveredFood.name}</h4>
                          <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-gray-300 font-bold tracking-widest mb-3">{hoveredFood.amount}</span>
                          <span className="text-4xl md:text-5xl font-black text-white leading-none">{hoveredFood.calories}</span>
                          <span className="text-xs text-gray-400 uppercase tracking-widest mb-4 mt-1">kcal</span>
                          <div className="flex gap-4 text-xs font-bold bg-black/30 p-4 rounded-2xl border border-white/5 w-full justify-center">
                            <span className="text-blue-400 flex flex-col items-center gap-1"><span className="text-lg leading-none">{hoveredFood.protein}g</span> P</span><div className="w-[1px] bg-white/10" />
                            <span className="text-yellow-400 flex flex-col items-center gap-1"><span className="text-lg leading-none">{hoveredFood.carbs}g</span> C</span><div className="w-[1px] bg-white/10" />
                            <span className="text-red-400 flex flex-col items-center gap-1"><span className="text-lg leading-none">{hoveredFood.fat}g</span> F</span>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-gray-500"><Sparkles size={32} className="mb-3 opacity-20" /><p className="text-sm font-bold uppercase tracking-widest text-center">Atinge un aliment<br/>pentru detalii</p></motion.div>
                      )}
                    </div>

                    <div className="relative w-52 h-52 md:w-72 md:h-72 lg:w-80 lg:h-80 flex-shrink-0 my-2 lg:my-0">
                      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl overflow-visible">
                        <circle cx="100" cy="100" r="90" fill="#111" stroke="#222" strokeWidth="2" />
                        <circle cx="100" cy="100" r="55" fill="#050505" stroke="#1a1a1a" strokeWidth="2" />
                        {sortedSlices.map((slice) => {
                          const isHovered = hoveredFoodId === slice.id;
                          return (
                            <motion.path key={slice.id} animate={{ d: createDonutSlice(100, 100, isHovered ? 98 : 90, 55, slice.startAngle, slice.endAngle) }} transition={{ type: "spring", stiffness: 300, damping: 20 }} fill={slice.color} stroke="#050505" strokeWidth="3" className="cursor-pointer outline-none" onMouseEnter={() => setHoveredFoodId(slice.id)} onMouseLeave={() => setHoveredFoodId(null)} style={{ filter: isHovered ? `drop-shadow(0 0 15px ${slice.color})` : 'none' }} />
                          );
                        })}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                          <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Masă</p>
                          <span className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-none">{totalCals}</span>
                          <span className="text-xs md:text-sm text-gray-400 mt-1 uppercase tracking-widest">kcal</span>
                        </motion.div>
                      </div>
                    </div>

                    <div className="w-full lg:w-1/3 flex flex-col gap-2 max-h-[250px] lg:max-h-[320px] overflow-y-auto custom-scrollbar px-2">
                      {slices.map(slice => (
                        <div key={slice.id} onMouseEnter={() => setHoveredFoodId(slice.id)} onMouseLeave={() => setHoveredFoodId(null)} className={`flex flex-col justify-center px-4 py-3 rounded-2xl border transition-all cursor-pointer ${hoveredFoodId === slice.id ? 'bg-white/10 scale-105 shadow-xl' : 'bg-white/5 border-white/10 hover:bg-white/10'}`} style={{ borderColor: hoveredFoodId === slice.id ? slice.color : 'rgba(255,255,255,0.1)' }}>
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: slice.color, boxShadow: `0 0 8px ${slice.color}` }} /><span className="text-sm font-bold text-gray-200 line-clamp-1">{slice.name}</span></div>
                            <span className="text-sm font-black flex-shrink-0" style={{ color: slice.color }}>{Math.round((slice.calories/totalCals)*100)}%</span>
                          </div>
                          <span className="text-xs text-gray-500 ml-5">{slice.amount} • {slice.calories} kcal</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full flex flex-col md:flex-row gap-4 justify-between items-center pt-6 border-t border-white/10">
                    <div className="flex gap-8 items-center">
                      <div className="text-center md:text-left"><span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Total Calorii Masă</span><span className="text-2xl font-black text-white">{totalCals} <span className="text-sm text-gray-400 font-medium">kcal</span></span></div>
                      <div className="w-[1px] h-10 bg-white/10 hidden md:block"></div>
                      <div className="text-center md:text-left"><span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Total Proteine Masă</span><span className="text-2xl font-black text-blue-400">{selectedPlanMeal.foods.reduce((a,b) => a+b.protein, 0)} <span className="text-sm text-gray-400 font-medium">g</span></span></div>
                    </div>
                    <button onClick={handleAddPlanMeal} disabled={isSavingMeal} className="w-full md:w-auto mt-3 md:mt-0 bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 hover:from-fuchsia-500 hover:to-fuchsia-400 text-white font-black text-sm uppercase tracking-widest py-3 md:py-4 px-8 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] disabled:opacity-50 flex-shrink-0">
                      {isSavingMeal ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />} {isSavingMeal ? "Se salvează..." : "Am mâncat asta!"}
                    </button>
                  </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </main>
  );
}