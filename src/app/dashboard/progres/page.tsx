"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Trophy, Zap, Star, Droplets, Flame, Utensils } from 'lucide-react';
import { useDashboardContext } from '@/src/context/DashboardContext';

export default function ProgresPage() {
  const { progressStats } = useDashboardContext();
  const { loading, streak, weeklyBurned, evolutionData, badges } = progressStats;

  // Găsim valorile maxime pentru a scala graficele corect
  const maxEaten = Math.max(...(evolutionData?.map((d: any) => d.eaten) || [2500]), 2500);
  const maxBurned = Math.max(...(evolutionData?.map((d: any) => d.burned) || [1000]), 1000);
  const maxWater = 8; // Obiectivul zilnic de 8 pahare

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } } };

  return (
    <main className="h-full w-full p-6 lg:p-12 overflow-y-auto relative z-10 custom-scrollbar">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-0 right-[10%] w-[40%] h-[40%] bg-fuchsia-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-[0%] w-[30%] h-[30%] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-10 bg-black/40 border border-white/5 p-6 rounded-[32px] backdrop-blur-xl shadow-2xl">
          <div>
             <h1 className="text-3xl font-black italic tracking-tighter flex items-center gap-3 text-white">
                Analiza <span className="text-fuchsia-500">Progresului</span>
             </h1>
             <p className="text-gray-400 mt-1 text-sm font-medium">Urmărește-ți evoluția din ultimele 7 zile.</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-fuchsia-500 animate-pulse" />
                <span className="text-sm font-bold text-gray-300">Live Data</span>
             </div>
          </div>
        </header>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLOANA STÂNGA: Streak & Sumar Săptămânal */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* STREAK CARD */}
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-orange-500/20 to-red-600/10 border border-orange-500/30 p-8 rounded-[32px] backdrop-blur-xl relative overflow-hidden flex flex-col items-center text-center shadow-[0_0_40px_rgba(249,115,22,0.1)]">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/30 blur-3xl rounded-full" />
               <div className="bg-gradient-to-b from-orange-400 to-orange-600 p-4 rounded-full mb-4 shadow-[0_0_20px_rgba(249,115,22,0.5)] relative z-10">
                 <Zap className="text-black" size={32} />
               </div>
               <h2 className="text-orange-200/80 font-bold uppercase tracking-widest text-xs mb-2 relative z-10">Streak Activ</h2>
               <div className="flex items-baseline gap-2 mb-2 justify-center relative z-10">
                  <span className="text-7xl font-black text-white tracking-tighter drop-shadow-lg">
                    {loading ? "-" : streak}
                  </span>
                  <span className="text-orange-400 font-bold text-xl">zile</span>
               </div>
               <p className="text-sm text-gray-300 font-medium mt-2 relative z-10">
                 {streak > 0 ? "Consistența este cheia succesului!" : "Începe un nou streak astăzi!"}
               </p>
            </motion.div>

            {/* TOTAL ARSE SĂPTĂMÂNA ASTA */}
            <motion.div variants={itemVariants} className="bg-black/40 border border-white/10 p-8 rounded-[32px] backdrop-blur-xl group hover:border-fuchsia-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-fuchsia-500/20 p-2 rounded-xl text-fuchsia-400">
                  <Flame size={20} />
                </div>
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Arse Ultimele 7 Zile</span>
              </div>
              <div className="flex flex-col">
                <span className="text-5xl font-black text-white tracking-tighter">
                  {loading ? "..." : weeklyBurned.toLocaleString('en-US')}
                </span>
                <span className="text-fuchsia-500 font-bold mt-1">kcal total</span>
              </div>
            </motion.div>

          </div>

          {/* COLOANA DREAPTĂ: Grafice Premium */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* GRAFIC 1: Balanță Calorii (Consumat vs Ars) */}
            <motion.div variants={itemVariants} className="bg-black/40 border border-white/10 p-8 rounded-[32px] backdrop-blur-xl shadow-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                <h2 className="text-xl font-black italic flex items-center gap-2 text-white">
                  <TrendingUp className="text-fuchsia-500" /> Balanță Calorii
                </h2>
                <div className="flex gap-4 text-xs font-bold bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-fuchsia-500 shadow-[0_0_10px_#d946ef]" /> Consumat</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316]" /> Ars</div>
                </div>
              </div>
              
              <div className="flex items-end justify-between gap-2 sm:gap-4 h-64 w-full relative">
                {/* Liniile de fundal pentru grafic */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                  <div className="border-b border-white/20 w-full"></div>
                  <div className="border-b border-white/20 w-full"></div>
                  <div className="border-b border-white/20 w-full"></div>
                  <div className="border-b border-white/20 w-full"></div>
                </div>

                {loading ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 animate-pulse">Încărcăm datele...</div>
                ) : (
                  evolutionData?.map((item: any, i: number) => {
                    const eatenHeight = Math.min((item.eaten / maxEaten) * 100, 100);
                    const burnedHeight = Math.min((item.burned / maxBurned) * 100, 100);

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative h-full">
                        {/* Tooltip la Hover */}
                        <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[#1a1a1a] border border-white/10 p-3 rounded-2xl shadow-2xl z-20 pointer-events-none flex flex-col gap-1 min-w-[100px]">
                          <span className="text-fuchsia-400 text-xs font-bold flex justify-between gap-2"><Utensils size={12}/> {item.eaten} kcal</span>
                          <span className="text-orange-400 text-xs font-bold flex justify-between gap-2"><Flame size={12}/> {item.burned} kcal</span>
                        </div>
                        
                        {/* Barele graficului */}
                        <div className="w-full h-full flex items-end justify-center gap-1 sm:gap-2 relative z-10">
                          {/* Bara Consumat */}
                          <div className="w-1/2 max-w-[20px] bg-white/5 rounded-t-xl relative overflow-hidden flex items-end justify-center h-full">
                            <motion.div initial={{ height: 0 }} animate={{ height: `${eatenHeight}%` }} transition={{ duration: 1.5, type: "spring" }} className="w-full rounded-t-xl bg-gradient-to-t from-fuchsia-900 to-fuchsia-500" />
                          </div>
                          {/* Bara Ars */}
                          <div className="w-1/2 max-w-[20px] bg-white/5 rounded-t-xl relative overflow-hidden flex items-end justify-center h-full">
                            <motion.div initial={{ height: 0 }} animate={{ height: `${burnedHeight}%` }} transition={{ duration: 1.5, delay: 0.2, type: "spring" }} className="w-full rounded-t-xl bg-gradient-to-t from-orange-900 to-orange-500" />
                          </div>
                        </div>

                        <span className={`text-xs sm:text-sm font-bold transition-colors mt-2 ${i === 6 ? "text-fuchsia-400" : "text-gray-500 group-hover:text-white"}`}>
                          {i === 6 ? "Azi" : item.zi}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>

            {/* RÂNDUL 2: Grafic Hidratare & Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* GRAFIC HIDRATARE */}
              <motion.div variants={itemVariants} className="bg-black/40 border border-cyan-500/20 p-6 rounded-[32px] backdrop-blur-xl overflow-hidden relative group shadow-[0_0_30px_rgba(6,182,212,0.05)]">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full" />
                 <h3 className="text-lg font-bold flex items-center gap-2 text-white mb-6 relative z-10">
                   <Droplets className="text-cyan-400" /> Hidratare
                 </h3>
                 
                 <div className="flex items-end justify-between h-32 w-full relative z-10">
                   {!loading && evolutionData?.map((item: any, i: number) => {
                     const waterHeight = Math.min((item.water / maxWater) * 100, 100);
                     const targetMet = item.water >= maxWater;

                     return (
                       <div key={i} className="flex-1 flex flex-col items-center gap-2 group/water h-full relative">
                         <div className="absolute -top-8 opacity-0 group-hover/water:opacity-100 transition-opacity text-xs font-bold text-cyan-300">
                           {item.water}/8
                         </div>
                         <div className="w-4 sm:w-6 bg-white/5 rounded-full relative overflow-hidden flex items-end justify-center h-full border border-white/5">
                           <motion.div 
                             initial={{ height: 0 }} animate={{ height: `${waterHeight}%` }} transition={{ duration: 1, type: "spring" }} 
                             className={`w-full rounded-full ${targetMet ? 'bg-cyan-400 shadow-[0_0_15px_#22d3ee]' : 'bg-cyan-900/50'}`} 
                           />
                         </div>
                         <span className="text-[10px] font-bold text-gray-500">{item.zi}</span>
                       </div>
                     );
                   })}
                 </div>
              </motion.div>

              {/* BADGES / TROFEE */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                
                {/* Titan de Fier */}
                <div className={`p-4 rounded-[24px] flex flex-col items-center justify-center text-center gap-2 transition-all duration-500 border relative overflow-hidden ${badges.titan ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-900/20 border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'bg-black/40 border-white/5 opacity-50'}`}>
                  {badges.titan && <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />}
                  <Trophy className={badges.titan ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]' : 'text-gray-600'} size={32} />
                  <div>
                    <span className="font-bold text-sm text-white block">Titan de Fier</span>
                    <span className="text-[10px] text-gray-400">3 antrenamente/săpt</span>
                  </div>
                </div>

                {/* Precizie AI */}
                <div className={`p-4 rounded-[24px] flex flex-col items-center justify-center text-center gap-2 transition-all duration-500 border relative overflow-hidden ${badges.precizie ? 'bg-gradient-to-br from-fuchsia-500/20 to-purple-900/20 border-fuchsia-500/40 shadow-[0_0_20px_rgba(217,70,239,0.2)]' : 'bg-black/40 border-white/5 opacity-50'}`}>
                  <Star className={badges.precizie ? 'text-fuchsia-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]' : 'text-gray-600'} size={32} />
                  <div>
                    <span className="font-bold text-sm text-white block">Precizie AI</span>
                    <span className="text-[10px] text-gray-400">Streak activ 3+ zile</span>
                  </div>
                </div>

              </motion.div>
            </div>

          </div>
        </motion.div>
      </div>
    </main>
  );
}