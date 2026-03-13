"use client";

import React, { useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { TrendingUp, Trophy, Zap, Star, Droplets, Flame, X, Calendar, Sparkles, User } from 'lucide-react';

// Importăm contextul global pentru a accesa datele deja încărcate în memorie
import { useDashboardContext } from '@/src/context/DashboardContext';
import { AnimatedCounter } from '@/src/components/shared/AnimatedCounter';

// Componente shared


export default function ProgresPage() {
  const { progressStats, dailyStats } = useDashboardContext();

  // --- LOGICĂ MERGE DATE LOCALE (DEMO) ---
  // Combinăm datele din context cu cele salvate local în browser
  const [mergedStats, setMergedStats] = React.useState(progressStats || {});
  const [showBurnedModal, setShowBurnedModal] = React.useState(false);
  const [recentHistory, setRecentHistory] = React.useState<any[]>([]);

  React.useEffect(() => {
    // 1. Luăm datele din localStorage
    const localExercises = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('demo_exercises') || '[]') : [];
    
    // Facem o copie a datelor din context
    let newStats = JSON.parse(JSON.stringify(progressStats || {}));

    if (localExercises.length > 0) {
      // 2. Calculăm totalul caloriilor arse local în ultima săptămână
      let localWeeklyBurned = 0;
      const today = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 6); // Ultimele 7 zile
      
      const localMap: Record<string, number> = {};

      localExercises.forEach((ex: any) => {
        const exDate = new Date(ex.date);
        // Verificăm dacă data e în intervalul relevant
        if (exDate >= oneWeekAgo) {
          localWeeklyBurned += (ex.calories_burned || 0);
          localMap[ex.date] = (localMap[ex.date] || 0) + (ex.calories_burned || 0);
        }
      });

      // Adăugăm la totalul săptămânal existent
      newStats.weeklyBurned = (newStats.weeklyBurned || 0) + localWeeklyBurned;

      // 3. Actualizăm graficul (Evolution Data)
      if (!newStats.evolutionData || newStats.evolutionData.length === 0) {
         newStats.evolutionData = Array(7).fill(0).map((_, i) => ({ valoare: 0, realCals: 0, zi: '' }));
      }

      newStats.evolutionData = newStats.evolutionData.map((item: any, index: number) => {
        // Calculăm data corespunzătoare barei (index 6 = Azi, index 5 = Ieri...)
        const d = new Date();
        d.setDate(d.getDate() - (6 - index));
        const dateStr = d.toISOString().split('T')[0];
        
        const localVal = localMap[dateStr] || 0;
        const totalVal = (item.realCals || 0) + localVal;
        
        return {
          ...item,
          realCals: totalVal,
          // Recalculăm înălțimea barei (procent din targetul de 2500 kcal)
          valoare: Math.min((totalVal / 2500) * 100, 100)
        };
      });

      // 4. Pregătim lista pentru modal (istoric)
      const history = localExercises
        .filter((ex: any) => new Date(ex.date) >= oneWeekAgo)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setRecentHistory(history);
    }

    setMergedStats(newStats);
  }, [progressStats]);
  
  const { 
    loading = true, 
    streak = 0, 
    weeklyBurned = 0, 
    evolutionData = [],
    dailyWater = [],
    macroAverages = { protein: 0, carbs: 0, fats: 0 },
    badges = { titan: false, hidratare: false, precizie: false }
  } = mergedStats || {};

  // Calcul Balanță Calorică Medie
  const avgIntake = evolutionData?.reduce?.((sum: number, d: any) => sum + (d?.realCals || 0), 0) / 7 || 0;
  const avgBurned = (weeklyBurned || 0) / 7;
  const bmr = 2000; // Valoare fixată pentru calcul orientativ
  const netCalories = Math.round(avgIntake - (bmr + avgBurned)) || 0;
  const balanceText = netCalories < -100 ? "Deficit caloric" : netCalories > 100 ? "Surplus caloric" : "Menținere";
  const balanceColor = netCalories < -100 ? "text-green-500" : netCalories > 100 ? "text-orange-500" : "text-fuchsia-500";

  // --- AI INSIGHTS GENERATOR ---
  const aiInsights = useMemo(() => {
    if (loading) return ["Analizăm datele tale pentru a genera insight-uri magice..."];
    const insights: string[] = [];
    
    // Insight Balanță Calorică
    if (netCalories < -500) insights.push("Deficitul tău caloric este destul de mare (>500 kcal/zi). Asigură-te că oferi corpului suficient combustibil pentru recuperare!");
    else if (netCalories < 0) insights.push("Ești într-un deficit caloric optim. Continuă așa pentru o slăbire constantă și sănătoasă!");
    else if (netCalories > 300) insights.push("Ai un ușor surplus caloric. Perfect dacă obiectivul tău este creșterea masei musculare!");
    else insights.push("Balanța ta calorică este excelentă pentru menținere. Ritm perfect!");

    // Insight Macros
    if (macroAverages.protein < 100) insights.push("Aportul tău de proteine este cam scăzut. Încearcă să adaugi o gustare bogată în proteine după antrenament.");
    if (weeklyBurned > 1500 && macroAverages.carbs < 150) insights.push("Arzi multe calorii! Nu te feri de carbohidrați complecși pentru a-ți reface energia.");

    // Insight Streak/Activitate
    if (streak >= 3) insights.push(`Felicitări pentru streak-ul de ${streak} zile! Consecvența este cheia magiei.`);
    else if (streak === 0) insights.push("Fiecare zi e o nouă șansă de a începe. Hai să înregistrăm prima masă sau antrenament azi!");

    return insights;
  }, [loading, netCalories, macroAverages, weeklyBurned, streak]);

  // Configurare animații Bento Box
  const containerVariants: Variants = { 
    hidden: { opacity: 0 }, 
    show: { opacity: 1, transition: { staggerChildren: 0.08 } } 
  };
  
  const bentoItemVariants: Variants = { 
    hidden: { opacity: 0, scale: 0.95, y: 15 }, 
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } } 
  };

  // Nume / Salutare Dinamică
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bună dimineața" : hour < 18 ? "Bună ziua" : "Bună seara";

  // --- SKELETON LOADER ---
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[220px] gap-6 animate-pulse">
      {/* Skeleton Evolutie (2x2) */}
      <div className="lg:col-span-2 lg:row-span-2 bg-white/5 border border-white/10 p-8 rounded-[32px] flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 w-48 bg-white/10 rounded-xl"></div>
          <div className="h-12 w-12 bg-white/10 rounded-2xl"></div>
        </div>
        <div className="flex-1 flex items-end gap-3 w-full pb-2">
          {Array(7).fill(0).map((_, i) => (
             <div key={i} className="flex-1 h-full flex flex-col items-center gap-3">
               <div className="w-full bg-white/10 rounded-2xl h-full"></div>
               <div className="h-4 w-8 bg-white/10 rounded-md"></div>
             </div>
          ))}
        </div>
      </div>
      {/* Skeleton Streak */}
      <div className="bg-white/5 border border-white/10 rounded-[32px] flex flex-col items-center justify-center gap-4">
        <div className="h-16 w-16 bg-white/10 rounded-full"></div>
        <div className="h-12 w-24 bg-white/10 rounded-xl"></div>
      </div>
      {/* Skeleton Balanta */}
      <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="h-10 w-10 bg-white/10 rounded-xl"></div>
          <div className="h-6 w-20 bg-white/10 rounded-full"></div>
        </div>
        <div>
          <div className="h-4 w-24 bg-white/10 rounded-md mb-2"></div>
          <div className="h-10 w-32 bg-white/10 rounded-xl"></div>
        </div>
      </div>
      {/* Skeleton AI Insights (2x1) */}
      <div className="md:col-span-2 bg-white/5 border border-white/10 p-6 rounded-[32px] flex gap-4 items-center">
        <div className="h-16 w-16 min-w-[64px] bg-white/10 rounded-2xl"></div>
        <div className="flex flex-col gap-2 w-full">
           <div className="h-4 w-24 bg-white/10 rounded-md"></div>
           <div className="h-3 w-3/4 bg-white/10 rounded-md"></div>
           <div className="h-3 w-5/6 bg-white/10 rounded-md"></div>
        </div>
      </div>
      {/* Skeleton Macros (3x) */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-[32px] flex flex-col items-center justify-center p-6 gap-4">
           <div className="h-4 w-24 bg-white/10 rounded-md"></div>
           <div className="h-24 w-24 bg-white/10 rounded-full"></div>
        </div>
      ))}
    </div>
  );

  return (
    <main className="h-full w-full p-6 lg:p-12 overflow-y-auto relative z-10">
      
      {/* Background Glows decorative */}
      <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header-ul paginii */}
        <header className="flex justify-between items-center mb-10 bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {greeting}, <span className="text-fuchsia-500">Alex!</span>
          </h1>
          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-fuchsia-600 to-purple-600 p-[2px] hover:scale-105 transition-transform shadow-[0_0_20px_rgba(217,70,239,0.3)]">
            <div className="h-full w-full bg-black rounded-full flex items-center justify-center overflow-hidden">
              <User className="text-fuchsia-500/80" size={24} />
            </div>
          </div>
        </header>

        {/* AICI DECIDEM CE RANDĂM */}
        {loading ? (
          renderSkeleton()
        ) : (
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="show" 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[220px] gap-6"
          >
            
            {/* 1. HERO CARD: EVOLUȚIE (Span 2x2 pe Desktop) */}
          <motion.div variants={bentoItemVariants} className="lg:col-span-2 lg:row-span-2 bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-md flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                  Evoluție Calorii
                </h2>
                <p className="text-gray-400 text-sm mt-1">Ultimele 7 zile vs Target (2500 kcal)</p>
              </div>
              <div className="bg-fuchsia-500/20 p-3 rounded-2xl">
                <TrendingUp className="text-fuchsia-400" size={24} />
              </div>
            </div>
            
            <div className="flex-1 flex items-end gap-3 w-full relative z-10 pb-2">
              {(evolutionData || []).map((item: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar cursor-pointer h-full relative">
                  <div className="absolute -top-12 opacity-0 group-hover/bar:opacity-100 transition-all transform translate-y-2 group-hover/bar:translate-y-0 bg-white/15 backdrop-blur-xl border border-white/20 text-xs font-bold px-3 py-2 rounded-xl text-white whitespace-nowrap z-30 shadow-2xl">
                    {item?.realCals || 0} kcal
                  </div>
                  <div className="w-full bg-white/5 rounded-2xl relative overflow-hidden flex items-end justify-center" style={{ height: '100%' }}>
                    <motion.div 
                      initial={{ height: 0 }} 
                      animate={{ height: `${item?.valoare || 0}%` }} 
                      transition={{ duration: 1.2, delay: i * 0.1, type: "spring" }} 
                      className={`w-full rounded-2xl ${(item?.valoare || 0) >= 90 ? 'bg-gradient-to-t from-fuchsia-600 to-fuchsia-400' : 'bg-fuchsia-600/30 group-hover/bar:bg-fuchsia-500/60 transition-colors'}`} 
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-500 group-hover/bar:text-white transition-colors">
                    {i === 6 ? "Azi" : (item?.zi || "-")}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 2. SQUARE WIDGET: STREAK */}
          <motion.div variants={bentoItemVariants} className="bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/30 p-6 rounded-[32px] backdrop-blur-md relative overflow-hidden flex flex-col items-center justify-center text-center group hover:-translate-y-1 transition-transform cursor-default">
             <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-3xl rounded-full" />
             <div className="bg-orange-500/20 p-4 rounded-full mb-3 relative z-10 group-hover:scale-110 transition-transform">
               <Zap className="text-orange-500" size={28} />
             </div>
             <h2 className="text-gray-300 font-medium mb-1 relative z-10">Streak Activ</h2>
             <div className="flex items-baseline gap-1 justify-center relative z-10">
                <span className="text-5xl font-black text-white tracking-tighter">
                  <AnimatedCounter value={streak || 0} />
                </span>
                <span className="text-orange-400 font-bold">zile</span>
             </div>
          </motion.div>

          {/* 3. SQUARE WIDGET: BALANȚĂ CALORICĂ */}
          <motion.div variants={bentoItemVariants} className="bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-transform cursor-default">
             <div className="flex items-start justify-between">
               <div className="bg-white/10 p-3 rounded-2xl transition-colors group-hover:bg-white/15">
                  <Flame size={20} className={netCalories < 0 ? "text-green-400" : netCalories > 0 ? "text-orange-400" : "text-fuchsia-400"} />
               </div>
               <span className={`text-xs font-bold bg-black/40 px-3 py-1.5 rounded-full ${balanceColor}`}>
                 {balanceText}
               </span>
             </div>
             <div>
               <h2 className="text-gray-400 font-medium text-sm mb-1">Balanță (Net)</h2>
               <div className="flex items-baseline gap-1">
                 <span className={`text-4xl font-black flex items-center ${balanceColor}`}>
                   <React.Fragment>
                     {netCalories > 0 ? "+" : ""}
                     <AnimatedCounter value={Math.abs(netCalories)} />
                   </React.Fragment>
                 </span>
                 <span className="text-gray-500 text-sm font-medium">kcal/zi</span>
               </div>
             </div>
          </motion.div>

          {/* 4. WIDE WIDGET: AI INSIGHTS (Span 2x1 pe Desktop) */}
          <motion.div variants={bentoItemVariants} className="md:col-span-2 bg-gradient-to-r from-purple-900/40 to-fuchsia-900/20 border border-fuchsia-500/30 p-6 rounded-[32px] backdrop-blur-md relative overflow-hidden flex gap-4 items-center group">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
            <div className="h-16 w-16 min-w-[64px] rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(217,70,239,0.3)] relative z-10 group-hover:scale-105 transition-transform">
              <Sparkles className="text-white" size={28} />
            </div>
            <div className="relative z-10">
              <h3 className="text-fuchsia-300 font-bold text-sm mb-1 uppercase tracking-wider">AI Insights</h3>
              <div className="text-white/90 text-sm leading-relaxed font-medium">
                {aiInsights.map((insight, idx) => (
                  <p key={idx} className="mb-1 last:mb-0">• {insight}</p>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 5. SQUARE WIDGET: MACRO - PROTEINE */}
          <motion.div variants={bentoItemVariants} className="bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-md flex flex-col items-center justify-center text-center group hover:-translate-y-1 transition-transform">
            <h3 className="text-gray-400 font-medium mb-4">Proteine (Medie)</h3>
            <div className="relative w-24 h-24 flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                <motion.circle 
                  cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  className="text-fuchsia-500 drop-shadow-[0_0_12px_rgba(217,70,239,0.8)]" 
                  strokeDasharray="264" 
                  initial={{ strokeDashoffset: 264 }}
                  animate={{ strokeDashoffset: Math.max(0, 264 - (264 * Math.min((macroAverages?.protein || 0) / 150, 1))) || 0 }}
                  transition={{ duration: 1.5, type: "spring" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-black text-2xl text-white tracking-tighter">
                  <AnimatedCounter value={macroAverages?.protein || 0} />
                </span>
                <span className="text-[10px] text-gray-500 uppercase font-bold mt-[-2px]">Gol: 150g</span>
              </div>
            </div>
          </motion.div>

          {/* 6. SQUARE WIDGET: MACRO - CARBS */}
          <motion.div variants={bentoItemVariants} className="bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-md flex flex-col items-center justify-center text-center group hover:-translate-y-1 transition-transform">
            <h3 className="text-gray-400 font-medium mb-4">Carbohidrați</h3>
            <div className="relative w-24 h-24 flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                <motion.circle 
                  cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  className="text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" 
                  strokeDasharray="264" 
                  initial={{ strokeDashoffset: 264 }}
                  animate={{ strokeDashoffset: Math.max(0, 264 - (264 * Math.min((macroAverages?.carbs || 0) / 250, 1))) || 0 }}
                  transition={{ duration: 1.5, type: "spring", delay: 0.1 }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-black text-2xl text-white tracking-tighter">
                  <AnimatedCounter value={macroAverages?.carbs || 0} />
                </span>
                <span className="text-[10px] text-gray-500 uppercase font-bold mt-[-2px]">Gol: 250g</span>
              </div>
            </div>
          </motion.div>

          {/* 7. SQUARE WIDGET: MACRO - FATS */}
          <motion.div variants={bentoItemVariants} className="bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-md flex flex-col items-center justify-center text-center group hover:-translate-y-1 transition-transform">
            <h3 className="text-gray-400 font-medium mb-4">Grăsimi (Medie)</h3>
            <div className="relative w-24 h-24 flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                <motion.circle 
                  cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  className="text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" 
                  strokeDasharray="264" 
                  initial={{ strokeDashoffset: 264 }}
                  animate={{ strokeDashoffset: Math.max(0, 264 - (264 * Math.min((macroAverages?.fats || 0) / 80, 1))) || 0 }}
                  transition={{ duration: 1.5, type: "spring", delay: 0.2 }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-black text-2xl text-white tracking-tighter">
                  <AnimatedCounter value={macroAverages?.fats || 0} />
                </span>
                <span className="text-[10px] text-gray-500 uppercase font-bold mt-[-2px]">Gol: 80g</span>
              </div>
            </div>
          </motion.div>

          {/* 8. SQUARE WIDGET: WATER */}
          <motion.div variants={bentoItemVariants} className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 p-6 rounded-[32px] backdrop-blur-md flex flex-col items-center justify-center text-center group hover:-translate-y-1 transition-transform cursor-default">
            <div className="bg-cyan-500/20 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
              <Droplets className="text-cyan-400" size={28} />
            </div>
            <h2 className="text-gray-300 font-medium mb-1">Apă (Azi)</h2>
            <div className="flex items-baseline gap-1 justify-center">
              <span className="text-5xl font-black text-white tracking-tighter">
                <AnimatedCounter value={dailyStats?.waterGlasses || 0} />
              </span>
              <span className="text-cyan-500 font-bold">/ 8</span>
            </div>
          </motion.div>

          {/* 9. WIDE WIDGET: BADGES (Span Full Row Bottom) */}
          <motion.div variants={bentoItemVariants} className="md:col-span-2 lg:col-span-4 bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-gray-300 font-bold flex items-center gap-2">Trofee Săptămânale</h3>
               <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-gray-400">Colecția Ta</span>
            </div>
            <div className="flex gap-4 h-full">
              {/* Titan de Fier */}
              <div className={`flex-1 rounded-2xl flex flex-col items-center justify-center text-center gap-1 transition-all duration-500 ${badges?.titan ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-black/20 border border-white/5 opacity-40 grayscale'} group hover:scale-105`}>
                <Trophy className={badges?.titan ? 'text-yellow-500' : 'text-gray-500'} size={24} />
                <span className="font-bold text-xs text-gray-300 mt-1">Titan</span>
              </div>
              {/* Regele Hidratării */}
              <div className={`flex-1 rounded-2xl flex flex-col items-center justify-center text-center gap-1 transition-all duration-500 ${badges?.hidratare ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-black/20 border border-white/5 opacity-40 grayscale'} group hover:scale-105`}>
                <Droplets className={badges?.hidratare ? 'text-blue-500' : 'text-gray-500'} size={24} />
                <span className="font-bold text-xs text-gray-300 mt-1">Hidratare</span>
              </div>
               {/* Precizie AI */}
              <div className={`flex-1 rounded-2xl flex flex-col items-center justify-center text-center p-4 gap-1 transition-all duration-500 ${badges?.precizie ? 'bg-fuchsia-500/10 border border-fuchsia-500/30' : 'bg-black/20 border border-white/5 opacity-40 grayscale'} group hover:scale-105`}>
                <Star className={badges?.precizie ? 'text-fuchsia-500' : 'text-gray-500'} size={24} />
                <span className="font-bold text-xs text-gray-300 mt-1">Precizie</span>
              </div>
            </div>
          </motion.div>

          </motion.div>
        )}
      </div>

      {/* MODAL ISTORIC ARDERI */}
      <AnimatePresence>
        {showBurnedModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowBurnedModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a0a] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Flame className="text-fuchsia-500" /> Istoric Arderi
                </h3>
                <button onClick={() => setShowBurnedModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-3">
                {recentHistory.length > 0 ? recentHistory.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-fuchsia-500/30 transition-colors">
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar size={10} /> {item.date}
                      </p>
                    </div>
                    <span className="text-fuchsia-500 font-bold">-{item.calories_burned} kcal</span>
                  </div>
                )) : (
                  <div className="text-center text-gray-500 py-8">
                    Nu ai activitate înregistrată în ultima săptămână.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}