"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Trophy, Zap, Star, Droplets, Flame, X, Calendar } from 'lucide-react';

// Importăm contextul global pentru a accesa datele deja încărcate în memorie
import { useDashboardContext } from '@/src/context/DashboardContext';

// Componente shared


export default function ProgresPage() {
  // Extragem progressStats direct din contextul gestionat în DashboardLayout
  const { progressStats } = useDashboardContext();

  // --- LOGICĂ MERGE DATE LOCALE (DEMO) ---
  // Combinăm datele din context cu cele salvate local în browser
  const [mergedStats, setMergedStats] = React.useState(progressStats);
  const [showBurnedModal, setShowBurnedModal] = React.useState(false);
  const [recentHistory, setRecentHistory] = React.useState<any[]>([]);

  React.useEffect(() => {
    // 1. Luăm datele din localStorage
    const localExercises = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('demo_exercises') || '[]') : [];
    
    // Facem o copie a datelor din context
    let newStats = JSON.parse(JSON.stringify(progressStats));

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
  
  // Folosim datele combinate (mergedStats) în loc de cele brute
  const { 
    loading, 
    streak, 
    weeklyBurned, 
    evolutionData, 
    badges 
  } = mergedStats;

  // Configurare animații
  const containerVariants = { 
    hidden: { opacity: 0 }, 
    show: { opacity: 1, transition: { staggerChildren: 0.1 } } 
  };
  
  const itemVariants = { 
    hidden: { opacity: 0, y: 20 }, 
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } } 
  };

  return (
    <main className="h-full w-full p-6 lg:p-12 overflow-y-auto relative z-10">
      
      {/* Background Glows decorative */}
      <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header-ul paginii */}
        <header className="flex justify-between items-center mb-10 bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Progresul <span className="text-fuchsia-500">Meu</span>
          </h1>
          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-fuchsia-600 to-purple-600 p-[2px] hover:scale-105 transition-transform shadow-[0_0_20px_rgba(217,70,239,0.3)]">
            <div className="h-full w-full bg-black rounded-full flex items-center justify-center overflow-hidden">
              
            </div>
          </div>
        </header>

        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show" 
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          
          {/* Partea Stângă: Streak și Calorii Arse */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/30 p-8 rounded-[32px] backdrop-blur-md relative overflow-hidden flex flex-col items-center text-center">
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-3xl rounded-full" />
               <div className="bg-orange-500/20 p-4 rounded-full mb-4 inline-block relative z-10">
                 <Zap className="text-orange-500" size={32} />
               </div>
               <h2 className="text-gray-400 font-medium mb-1 relative z-10">Streak Activ</h2>
               <div className="flex items-baseline gap-2 mb-2 justify-center relative z-10">
                  <span className="text-6xl font-black text-white tracking-tighter">
                    {loading ? "-" : streak}
                  </span>
                  <span className="text-orange-400 font-medium">zile</span>
               </div>
               <p className="text-sm text-gray-400 font-light mt-2 relative z-10">
                 {streak > 0 
                   ? `Ai înregistrat date ${streak} zile la rând. Continuă tot așa!` 
                   : "Nu ai înregistrat nicio activitate recent. Începe azi!"}
               </p>
            </motion.div>

            <motion.div 
              variants={itemVariants} 
              onClick={() => setShowBurnedModal(true)}
              className="bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-md flex items-center justify-between group hover:border-fuchsia-500/30 transition-all cursor-pointer hover:bg-white/10 relative"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Flame size={16} className="text-fuchsia-500" />
                  <span className="text-sm text-gray-400">Arse Săptămânal</span>
                </div>
                <span className="text-3xl font-bold text-white">
                  {loading ? "..." : weeklyBurned} <span className="text-lg text-gray-500">kcal</span>
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">Obiectiv</div>
                <span className="text-xl font-bold text-fuchsia-500">2000 <span className="text-sm">kcal</span></span>
              </div>
              
              {/* Hint vizual că e clickabil */}
              <div className="absolute inset-0 rounded-[32px] ring-2 ring-fuchsia-500/0 group-hover:ring-fuchsia-500/20 transition-all" />
            </motion.div>
          </div>

          {/* Partea Dreaptă: Grafic și Trofee */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-md">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="text-fuchsia-500" /> Evoluție Ultimele 7 Zile
                </h2>
                <span className="text-sm font-bold bg-white/10 px-3 py-1 rounded-full text-fuchsia-400">
                  Target: 2500 kcal
                </span>
              </div>
              
              <div className="flex items-end gap-3 h-48 w-full">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 animate-pulse">
                    Calculăm evoluția ta...
                  </div>
                ) : (
                  evolutionData.map((item: any, i: number) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer h-full relative">
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold px-3 py-2 rounded-xl text-white whitespace-nowrap z-20">
                        {item.realCals} kcal
                      </div>
                      <div className="w-full bg-white/5 rounded-t-xl relative overflow-hidden flex items-end justify-center" style={{ height: '100%' }}>
                        <motion.div 
                          initial={{ height: 0 }} 
                          animate={{ height: `${item.valoare}%` }} 
                          transition={{ duration: 1, delay: i * 0.1, type: "spring" }} 
                          className={`w-full rounded-t-xl ${item.valoare >= 90 ? 'bg-fuchsia-500' : 'bg-fuchsia-600/40 group-hover:bg-fuchsia-500/70 transition-colors'}`} 
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-500 group-hover:text-white transition-colors">
                        {i === 6 ? "Azi" : item.zi}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Secțiunea de Badges / Trofee */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Titan de Fier */}
              <div className={`border p-5 rounded-3xl flex flex-col items-center text-center gap-2 transition-all duration-500 ${badges.titan ? 'bg-white/5 border-yellow-500/30 hover:border-yellow-500/60' : 'bg-black/20 border-white/5 opacity-50 grayscale'}`}>
                <div className={`p-3 rounded-full ${badges.titan ? 'bg-yellow-500/20' : 'bg-white/5'}`}>
                  <Trophy className={badges.titan ? 'text-yellow-500' : 'text-gray-500'} size={24} />
                </div>
                <span className="font-bold text-sm text-gray-200 mt-2">Titan de Fier</span>
                <span className="text-xs text-gray-500">3 antrenamente / 7 zile</span>
              </div>

              {/* Regele Hidratării */}
              <div className={`border p-5 rounded-3xl flex flex-col items-center text-center gap-2 transition-all duration-500 ${badges.hidratare ? 'bg-white/5 border-blue-500/30 hover:border-blue-500/60' : 'bg-black/20 border-white/5 opacity-50 grayscale'}`}>
                <div className={`p-3 rounded-full ${badges.hidratare ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                  <Droplets className={badges.hidratare ? 'text-blue-500' : 'text-gray-500'} size={24} />
                </div>
                <span className="font-bold text-sm text-gray-200 mt-2">Regele Hidratării</span>
                <span className="text-xs text-gray-500">40 pahare apă / 7 zile</span>
              </div>

              {/* Precizie AI */}
              <div className={`border p-5 rounded-3xl flex flex-col items-center text-center gap-2 transition-all duration-500 ${badges.precizie ? 'bg-white/5 border-fuchsia-500/30 hover:border-fuchsia-500/60' : 'bg-black/20 border-white/5 opacity-50 grayscale'}`}>
                <div className={`p-3 rounded-full ${badges.precizie ? 'bg-fuchsia-500/20' : 'bg-white/5'}`}>
                  <Star className={badges.precizie ? 'text-fuchsia-500' : 'text-gray-500'} size={24} />
                </div>
                <span className="font-bold text-sm text-gray-200 mt-2">Precizie AI</span>
                <span className="text-xs text-gray-500">Streak de minim 3 zile</span>
              </div>

            </motion.div>

          </div>
        </motion.div>
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