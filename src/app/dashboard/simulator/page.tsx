"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, Activity, Zap, Info, ScanLine, RotateCcw, Loader2 } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';

export default function TimeMachineSimulator() {
  // --- STATE-URI PENTRU SIMULATOR ---
  const [months, setMonths] = useState<number>(0);
  const [calories, setCalories] = useState<number>(2000);
  const [workoutMins, setWorkoutMins] = useState<number>(15);
  const [sugar, setSugar] = useState<number>(50);

  // --- STATE-URI PENTRU DATE REALE ---
  const [baseWeight, setBaseWeight] = useState<number>(75);
  const [baseBMR, setBaseBMR] = useState<number>(2000);
  const [tdee, setTdee] = useState<number>(2000);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Preluăm datele reale din profil
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle(); // Previne erorile stricte dacă nu există profilul sau sunt mai multe

        // Fallback: Dacă nu există tabelul 'profiles', încercăm automat în tabelul 'users'
        if (!profile) {
          const { data: fallbackProfile } = await supabase.from('users').select('*').eq('id', session.user.id).maybeSingle();
          if (fallbackProfile) profile = fallbackProfile;
        }

        // Tragem Setările exact din locul în care le-ai salvat în pagina de Setări!
        const userMeta = session.user.user_metadata || {};
        console.log("✅ Setări găsite:", userMeta);

        // Căutăm în metadata, iar dacă nu e acolo, ne uităm în profil
        const rawWeight = userMeta.weight ?? profile?.current_weight ?? profile?.weight ?? 75;
        const rawHeight = userMeta.height ?? profile?.height ?? 170;
        const rawAge = userMeta.age ?? profile?.age ?? 30;
        
        // Forțăm conversia matematică ca să putem face calcule pe ele
        const weight = parseFloat(String(rawWeight)) || 75;
        const height = parseFloat(String(rawHeight)) || 170;
        const age = parseInt(String(rawAge)) || 30;
        
        const gender = String(userMeta.gender ?? profile?.gender ?? 'masculin').toLowerCase();
        const activityLevel = String(userMeta.activity_level ?? profile?.activity_level ?? 'sedentar').toLowerCase();

        // Calcul BMR (Mifflin-St Jeor) - Formula medicală standard
        let bmr = (10 * weight) + (6.25 * height) - (5 * age);
        bmr = (gender.includes('masculin') || gender === 'm') ? bmr + 5 : bmr - 161;

        // Calcul TDEE (Total Daily Energy Expenditure) pe baza activității
        let multiplier = 1.2; // sedentar
        if (activityLevel.includes('usor') || activityLevel.includes('ușor')) multiplier = 1.375;
        else if (activityLevel.includes('moderat')) multiplier = 1.55;
        else if (activityLevel.includes('foarte') || activityLevel.includes('activ')) multiplier = 1.725;

        const calculatedTdee = Math.round(bmr * multiplier);

        setBaseWeight(weight);
        setBaseBMR(bmr);
        setTdee(calculatedTdee);
        
        // Opțional: Folosim target-ul tău de calorii pe care l-ai setat, în caz că e disponibil
        const userCalorieGoal = userMeta.calorie_goal ? parseInt(String(userMeta.calorie_goal)) : calculatedTdee;
        setCalories(userCalorieGoal); 
      } catch (error) {
        console.error("Eroare la preluarea bio-datelor:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);
  
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

  // Cât de "lată" sau "suplă" este silueta
  const widthFactor = Math.max(0.7, Math.min(1.5, 1 + (totalWeightChange / 60)));
  
  // Statusuri pentru interfață
  let energyStatus = "Normal";
  let auraColor = "text-fuchsia-500 shadow-fuchsia-500/50";
  let svgAura = "#d946ef"; // fuchsia

  if (energyLevel > 80) {
    energyStatus = "Pikachu Mode ⚡";
    auraColor = "text-yellow-400 shadow-yellow-400/50";
    svgAura = "#facc15";
  } else if (energyLevel < 40) {
    energyStatus = "Letargic 🐢";
    auraColor = "text-red-500 shadow-red-500/50";
    svgAura = "#ef4444";
  } else if (widthFactor < 0.9 && energyLevel > 60) {
    energyStatus = "Suplu & Definit 💎";
    auraColor = "text-cyan-400 shadow-cyan-400/50";
    svgAura = "#22d3ee";
  }

  // Reset la setările inițiale
  const handleReset = () => {
    setMonths(0);
    setCalories(tdee); // Resetăm la menținere, nu la 2000
    setWorkoutMins(15);
    setSugar(50);
  };

  // Ecran de loading cât timp luăm datele
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-white pb-32">
        <Loader2 className="animate-spin text-fuchsia-500 w-12 h-12 mb-4" />
        <p className="font-bold text-gray-400 uppercase tracking-widest animate-pulse text-sm">Se calibrează Bio-Scanerul...</p>
      </div>
    );
  }

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
            className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-fuchsia-500/20 border-b border-fuchsia-500/50 z-10"
          />
          
          <ScanLine className="absolute top-6 right-6 text-white/20" size={32} />
          <div className="absolute top-6 left-6 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
             <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Live Bio-Scan</span>
          </div>

          {/* SILUETA SVG ANIMATĂ */}
          <div className="relative z-20 w-full h-[400px] flex items-center justify-center">
            
            {/* Glow în spatele siluetei */}
            <motion.div 
               animate={{ backgroundColor: svgAura }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 blur-[80px] opacity-30 rounded-full transition-colors duration-1000"
            />

            <svg viewBox="0 0 200 400" className="w-auto h-full drop-shadow-2xl">
              
              {/* Capul (Rămâne relativ constant, scalează puțin ca să nu pară deformat) */}
              <motion.g 
                initial={false}
                animate={{ 
                  scaleX: 1 + (widthFactor - 1) * 0.2, 
                  scaleY: 1 + (widthFactor - 1) * 0.1 
                }} 
                style={{ transformOrigin: "100px 50px" }}
                transition={{ type: "spring", stiffness: 60, damping: 15 }}
              >
                <circle cx="100" cy="50" r="25" fill={svgAura} className="opacity-80 transition-colors duration-1000" />
              </motion.g>

              {/* Corpul Principal (Scalează X puternic în funcție de greutate) */}
              <motion.g 
                initial={false}
                animate={{ scaleX: widthFactor }} 
                style={{ transformOrigin: "100px 200px" }}
                transition={{ type: "spring", stiffness: 60, damping: 15 }}
              >
                {/* Trunchi */}
                <path 
                  d="M 60 90 Q 100 70 140 90 L 130 220 Q 100 240 70 220 Z" 
                  fill={svgAura} 
                  className="opacity-50 transition-colors duration-1000" 
                />
                {/* Picior Stâng */}
                <path 
                  d="M 70 220 L 50 380 L 80 380 L 95 230 Z" 
                  fill={svgAura} 
                  className="opacity-60 transition-colors duration-1000" 
                />
                {/* Picior Drept */}
                <path 
                  d="M 130 220 L 150 380 L 120 380 L 105 230 Z" 
                  fill={svgAura} 
                  className="opacity-60 transition-colors duration-1000" 
                />
                {/* Braț Stâng */}
                <path 
                  d="M 55 95 Q 30 150 40 210 L 60 200 Q 50 150 65 110 Z" 
                  fill={svgAura} 
                  className="opacity-70 transition-colors duration-1000" 
                />
                {/* Braț Drept */}
                <path 
                  d="M 145 95 Q 170 150 160 210 L 140 200 Q 150 150 135 110 Z" 
                  fill={svgAura} 
                  className="opacity-70 transition-colors duration-1000" 
                />
              </motion.g>

              {/* Ochelari SF - Detaliu Mișto */}
              <motion.path 
                d="M 85 45 L 115 45 L 110 55 L 90 55 Z" 
                fill="#ffffff" 
                animate={{ opacity: energyLevel > 80 ? 1 : 0.3 }}
                className="drop-shadow-[0_0_5px_white]"
              />
            </svg>
          </div>

          {/* HUB de Informații Suprapus pe model */}
          <div className="absolute bottom-6 w-full px-6 flex justify-between gap-4">
            
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
              <div className="w-full bg-white/10 h-1.5 mt-2 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-current" style={{ backgroundColor: svgAura }}
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