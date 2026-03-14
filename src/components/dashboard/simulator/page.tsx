"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, Activity, Zap, Info, ScanLine, RotateCcw } from 'lucide-react';
import DynamicAvatar from '@/src/components/dashboard/DynamicAvatar';

export default function TimeMachineSimulator() {
  // --- STATE-URI PENTRU SIMULATOR ---
  const [months, setMonths] = useState<number>(0);
  const [calories, setCalories] = useState<number>(2000);
  const [workoutMins, setWorkoutMins] = useState<number>(15);
  const [sugar, setSugar] = useState<number>(50);

  // --- VARIABILE CALCULATE (Mockup pentru Body Engine) ---
  const baseWeight = 75; // Presupunem 75kg baza
  const baseHeight = 175; // 175cm baza
  const baseBMR = 2000; // Cât arde corpul stând degeaba
  
  // 1 Minut de antrenament intens ~ 8 kcal
  const caloriesBurned = baseBMR + (workoutMins * 8); 
  // Bilanțul zilnic (surplus sau deficit)
  const dailyBalance = calories - caloriesBurned; 
  // 1 kg de grăsime = ~7700 kcal. Calculăm schimbarea lunară (30 de zile)
  const monthlyWeightChange = (dailyBalance * 30) / 7700; 
  const totalWeightChange = monthlyWeightChange * months;
  const projectedWeight = baseWeight + totalWeightChange;

  // Energie (0-100) -> Scade dacă mănânci prea mult zahăr, crește cu sportul
  const baseEnergy = 60;
  const energyLevel = Math.max(0, Math.min(100, baseEnergy - (sugar * 0.4) + (workoutMins * 0.8)));

  // Statusuri pentru interfață
  let energyStatus = "Normal";
  let auraColor = "text-fuchsia-500 shadow-fuchsia-500/50";

  if (energyLevel > 80) {
    energyStatus = "Pikachu Mode ⚡";
    auraColor = "text-yellow-400 shadow-yellow-400/50";
  } else if (energyLevel < 40) {
    energyStatus = "Letargic 🐢";
    auraColor = "text-red-500 shadow-red-500/50";
  } else if (totalWeightChange < -2 && energyLevel > 60) {
    energyStatus = "Suplu & Definit 💎";
    auraColor = "text-cyan-400 shadow-cyan-400/50";
  }

  // Reset la setările inițiale
  const handleReset = () => {
    setMonths(0);
    setCalories(2000);
    setWorkoutMins(15);
    setSugar(50);
  };

  return (
    <div className="p-6 md:p-10 min-h-screen text-white pb-32">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2 flex items-center gap-3">
          Mașina <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-blue-500">Timpului</span> <Clock size={32} className="text-blue-500" />
        </h1>
        <p className="text-gray-400">Joacă-te cu variabilele de mai jos și vezi cum va arăta corpul tău în viitor.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* --- COLOANA STÂNGĂ: CONTROL & SLIDERE --- */}
        <div className="space-y-8 bg-[#0a0a0a] p-8 rounded-[32px] border border-white/10 shadow-[0_0_40px_rgba(217,70,239,0.05)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Zap className="text-fuchsia-500"/> Panou de Control</h2>
            <button onClick={handleReset} className="text-gray-500 hover:text-white transition-colors flex items-center gap-1 text-sm">
              <RotateCcw size={16} /> Reset
            </button>
          </div>

          {/* Slider: Timpul (Luni în viitor) */}
          <div className="space-y-4 bg-fuchsia-900/10 p-6 rounded-2xl border border-fuchsia-500/20">
            <div className="flex justify-between items-end">
              <label className="text-sm font-bold uppercase tracking-widest text-fuchsia-400">Călătorește în timp</label>
              <span className="text-3xl font-black">{months} <span className="text-base font-medium text-gray-400">Luni</span></span>
            </div>
            <input 
              type="range" min="0" max="12" step="1" 
              value={months} onChange={(e) => setMonths(Number(e.target.value))}
              className="w-full accent-fuchsia-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-500 italic">Prezent (0) ⟷ Viitor (12 luni)</p>
          </div>

          {/* Slider: Calorii */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Flame size={16} className="text-orange-500" /> Calorii Zilnice
              </label>
              <span className="text-xl font-bold">{calories} <span className="text-sm text-gray-500">kcal</span></span>
            </div>
            <input 
              type="range" min="1000" max="4000" step="50" 
              value={calories} onChange={(e) => setCalories(Number(e.target.value))}
              className="w-full accent-orange-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Slider: Sport */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Activity size={16} className="text-blue-500" /> Sport / Zi
              </label>
              <span className="text-xl font-bold">{workoutMins} <span className="text-sm text-gray-500">min</span></span>
            </div>
            <input 
              type="range" min="0" max="120" step="5" 
              value={workoutMins} onChange={(e) => setWorkoutMins(Number(e.target.value))}
              className="w-full accent-blue-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Slider: Zahăr */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Info size={16} className="text-yellow-500" /> Zahăr Adăugat
              </label>
              <span className="text-xl font-bold">{sugar} <span className="text-sm text-gray-500">grame</span></span>
            </div>
            <input 
              type="range" min="0" max="150" step="5" 
              value={sugar} onChange={(e) => setSugar(Number(e.target.value))}
              className="w-full accent-yellow-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>

        </div>

        {/* --- COLOANA DREAPTĂ: VIZUALIZATORUL HOLOGRAFIC --- */}
        <div className="relative bg-[#050505] rounded-[32px] border border-white/5 overflow-hidden flex items-center justify-center min-h-[500px]">
          
          {/* Fundal Holografic Tech */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>
          <div className="absolute top-0 w-full h-full bg-gradient-to-b from-transparent via-white/5 to-transparent flex flex-col justify-around pointer-events-none">
            {[...Array(5)].map((_, i) => <div key={i} className="w-full h-[1px] bg-white/5"></div>)}
          </div>

          {/* Indicator de Scanare */}
          <motion.div 
            animate={{ y: ["-100%", "500%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-fuchsia-500/20 border-b border-fuchsia-500/50 z-30 pointer-events-none"
          />
          
          <ScanLine className="absolute top-6 right-6 text-white/20 z-30 pointer-events-none" size={32} />
          <div className="absolute top-6 right-20 flex items-center gap-2 z-30 pointer-events-none bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
             <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Live Bio-Scan</span>
          </div>

          {/* SILUETA 3D ANIMATĂ */}
          <div className="relative w-full h-[400px] md:h-[500px]">
            <DynamicAvatar height={baseHeight} weight={Math.round(projectedWeight)} gender="masculin" />
          </div>

          {/* HUB de Informații Suprapus pe model */}
          <div className="absolute bottom-6 w-full px-6 flex justify-between gap-4 z-30 pointer-events-none">
            
            <motion.div 
              key={`weight-${projectedWeight}`} // Dă un key ca să animeze când se schimbă
              initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex-1 text-center"
            >
              <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-1">Greutate Estimată</p>
              <div className="text-2xl font-black text-white">
                {projectedWeight.toFixed(1)} <span className="text-sm text-gray-400 font-medium">kg</span>
              </div>
              <div className={`text-xs mt-1 font-bold ${totalWeightChange > 0 ? 'text-red-400' : totalWeightChange < 0 ? 'text-green-400' : 'text-gray-500'}`}>
                {totalWeightChange > 0 ? '+' : ''}{totalWeightChange.toFixed(1)} kg {months > 0 ? `în ${months} luni` : ''}
              </div>
            </motion.div>

            <motion.div 
              key={`energy-${energyStatus}`}
              initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex-1 text-center"
            >
              <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-1">Status Energie</p>
              <div className={`text-lg font-black ${auraColor}`}>
                {energyStatus}
              </div>
              <div className="w-full bg-white/10 h-1.5 mt-2 rounded-full overflow-hidden flex">
                <motion.div 
                  className={`h-full ${energyLevel > 80 ? 'bg-yellow-400' : energyLevel < 40 ? 'bg-red-500' : 'bg-fuchsia-500'}`}
                  initial={{ width: 0 }} animate={{ width: `${energyLevel}%` }} transition={{ duration: 1 }}
                />
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </div>
  );
}