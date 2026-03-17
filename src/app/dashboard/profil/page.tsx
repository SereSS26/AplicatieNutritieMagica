'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  User, Target, Utensils, Dumbbell, Save, 
  Flame, Droplet, Ruler, Weight, Activity, Heart, CheckCircle2, Zap, Sparkles, BrainCircuit
} from 'lucide-react';
// Importăm Supabase pentru a salva datele real în baza de date!
import { supabase } from '@/src/lib/supabase';

const FOOD_PREFERENCES = [
  'Pui', 'Vită', 'Pește', 'Fructe de mare', 'Ouă', 'Lactate', 
  'Vegan', 'Vegetarian', 'Fără Gluten', 'Fără Zahăr'
];

const WORKOUT_PREFERENCES = [
  'Forță / Hipertrofie', 'Cardio / Alergare', 'CrossFit', 
  'Yoga / Pilates', 'Calistenice', 'Înot', 'Ciclism'
];

const GOALS = [
  { id: 'slăbire', label: 'Slăbire / Definire', icon: '🔥' },
  { id: 'menținere', label: 'Menținere Greutate', icon: '⚖️' },
  { id: 'masă musculară', label: 'Masă Musculară', icon: '💪' }
];

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    gender: '', 
    age: '',
    height: '',
    weight: '',
    targetWeight: '',
    goal: 'slăbire',
    motivationLevel: '5',
    targetCaloriesIntake: '', 
    targetCaloriesBurn: '',   
    targetWater: '',          
    likedFoods: [] as string[],
    preferredWorkouts: [] as string[]
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAiCalculating, setIsAiCalculating] = useState(false);

  // PRELUĂM DATELE DIN BAZA DE DATE LA ÎNCĂRCARE
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        let dbData = {};
        if (session?.user) {
          const userMeta = session.user.user_metadata || {};
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
          
          dbData = {
            gender: userMeta.gender ?? profile?.gender ?? '',
            age: userMeta.age ?? profile?.age ?? '',
            height: userMeta.height ?? profile?.height ?? '',
            weight: userMeta.weight ?? profile?.current_weight ?? profile?.weight ?? '',
            goal: userMeta.goal ?? profile?.goal ?? 'slăbire',
            targetCaloriesIntake: userMeta.calorie_goal ?? '',
          };
        }

        // Le combinăm cu ce a mai salvat în LocalStorage (pentru preferințele vizuale)
        const savedProfile = localStorage.getItem('userProfileData');
        const localData = savedProfile ? JSON.parse(savedProfile) : {};

        setProfileData(prev => ({ ...prev, ...localData, ...dbData }));
      } catch (error) {
        console.error("Eroare la preluarea profilului:", error);
      }
    };
    
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomSelect = (name: string, value: string) => {
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const togglePreference = (category: 'likedFoods' | 'preferredWorkouts', item: string) => {
    setProfileData(prev => {
      const currentList = prev[category] as string[];
      if (currentList.includes(item)) {
        return { ...prev, [category]: currentList.filter(i => i !== item) };
      } else {
        return { ...prev, [category]: [...currentList, item] };
      }
    });
  };

  // FUNCȚIA DE SALVARE (TRIMITE CĂTRE SUPABASE)
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // 1. Salvăm în metadatele utilizatorului pentru acces ultra-rapid
        await supabase.auth.updateUser({
          data: {
            gender: profileData.gender,
            age: profileData.age,
            height: profileData.height,
            weight: profileData.weight,
            goal: profileData.goal,
            calorie_goal: profileData.targetCaloriesIntake,
          }
        });

        // 2. Salvăm și în tabelul `profiles`
        await supabase.from('profiles').upsert({
          id: session.user.id,
          gender: profileData.gender,
          age: parseInt(profileData.age) || null,
          height: parseFloat(profileData.height) || null,
          weight: parseFloat(profileData.weight) || null,
          current_weight: parseFloat(profileData.weight) || null,
          goal: profileData.goal,
          updated_at: new Date().toISOString(),
        });
      }

      // 3. Păstrăm și salvarea locală pentru UI
      localStorage.setItem('userProfileData', JSON.stringify(profileData));
      
      setIsSaving(false);
      setSaveSuccess(true);
      
      // Forțăm reload pentru actualizarea dashboard-ului
      setTimeout(() => {
        setSaveSuccess(false);
        window.location.reload(); 
      }, 1000);

    } catch (error) {
      console.error("Eroare la salvare:", error);
      setIsSaving(false);
      alert("A apărut o eroare la salvarea profilului!");
    }
  };

  // --- CALCUL BMI ȘI STATUS ---
  const calculateBMI = () => {
    const w = parseFloat(profileData.weight);
    const h = parseFloat(profileData.height) / 100;
    if (w > 0 && h > 0) {
      const bmi = w / (h * h);
      let status = '';
      let color = '';
      if (bmi < 18.5) { status = 'Subponderal'; color = 'text-blue-400 bg-blue-500/10 border-blue-500/30'; }
      else if (bmi < 25) { status = 'Greutate Normală'; color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'; }
      else if (bmi < 30) { status = 'Supraponderal'; color = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'; }
      else { status = 'Obezitate'; color = 'text-red-400 bg-red-500/10 border-red-500/30'; }
      return { value: bmi.toFixed(1), status, color };
    }
    return null;
  };
  const bmiData = calculateBMI();

  // --- CALCUL MAGIC AI ---
  const calculateTargetsAI = async () => {
    const { age, gender, height, weight, goal } = profileData;
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);

    if (!w || !h || !a || !gender) {
      alert("⚠️ Pentru a rula AI-ul, te rugăm să completezi Vârsta, Sexul, Înălțimea și Greutatea în cardul Date Biometrice!");
      return;
    }

    setIsAiCalculating(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    let bmr = (10 * w) + (6.25 * h) - (5 * a);
    bmr += gender === 'bărbat' ? 5 : -161;

    let tdee = bmr * 1.375;
    
    let intake = tdee;
    let burn = 300;

    if (goal === 'slăbire') {
      intake = tdee - 500; 
      burn = 500;          
    } else if (goal === 'masă musculară') {
      intake = tdee + 350; 
      burn = 250;          
    }

    const waterLiters = w * 0.035;
    const waterGlasses = Math.round((waterLiters * 1000) / 250);

    setProfileData(prev => ({
      ...prev,
      targetCaloriesIntake: Math.round(intake).toString(),
      targetCaloriesBurn: Math.round(burn).toString(),
      targetWater: waterGlasses.toString()
    }));

    setIsAiCalculating(false);
  };

  const containerVariants: Variants = { 
    hidden: { opacity: 0 }, 
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } } 
  };
  const itemVariants: Variants = { 
    hidden: { opacity: 0, y: 40, scale: 0.95 }, 
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 90, damping: 20 } } 
  };

  const noArrowsClass = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <main className="h-full w-full p-4 lg:p-10 overflow-x-hidden overflow-y-auto relative z-10 custom-scrollbar selection:bg-fuchsia-500/30">
      
      <div className="fixed inset-0 bg-[#030303] -z-20" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none -z-10" />
      
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[160px] pointer-events-none -z-10" />
      <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="fixed bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-fuchsia-600/20 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col gap-10 pb-16">
        
        <motion.header
          initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-[32px] p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-2xl overflow-hidden group"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50" />
          
          <div className="relative p-8 lg:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse shadow-[0_0_12px_#d946ef]" />
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.25em]">Setări Cont Premium</span>
              </div>
              {/* FIXUL E AICI: pr-2 adăugat pe span */}
              <h1 className="text-4xl lg:text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400">
                Profilul <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-fuchsia-400 to-indigo-500 drop-shadow-[0_0_30px_rgba(217,70,239,0.3)] pr-2">Meu</span>
              </h1>
            </div>
            
            <button onClick={handleSave} disabled={isSaving || saveSuccess} className="relative group/btn overflow-hidden rounded-2xl p-[1px] shrink-0">
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-fuchsia-500 to-indigo-500 rounded-2xl opacity-70 group-hover/btn:opacity-100 transition-opacity duration-300 blur-md" />
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-fuchsia-400 to-indigo-600 rounded-2xl" />
              <div className="relative px-8 py-5 bg-black/40 backdrop-blur-xl rounded-2xl flex items-center gap-3 transition-all duration-300 group-hover/btn:bg-black/20">
                {isSaving ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> <span className="text-white font-black text-sm tracking-widest uppercase">Se salvează...</span></>
                ) : saveSuccess ? (
                  <><CheckCircle2 className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" size={22} /> <span className="text-emerald-50 font-black text-sm tracking-widest uppercase">Salvat Magistral!</span></>
                ) : (
                  <><Save className="text-white group-hover/btn:scale-110 group-hover/btn:-rotate-3 transition-transform" size={22} /> <span className="text-white font-black text-sm tracking-widest uppercase text-shadow-sm">Salvează Tot</span></>
                )}
              </div>
            </button>
          </div>
        </motion.header>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-4 flex flex-col gap-8">
            
            <motion.div variants={itemVariants} className="group relative rounded-[32px] p-[1px] bg-gradient-to-b from-blue-500/20 to-transparent hover:from-blue-500/40 transition-all duration-500 hover:-translate-y-1 shadow-2xl">
              <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-3xl rounded-[32px]" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none transition-opacity group-hover:opacity-100 opacity-40" />
              
              <div className="relative p-6 lg:p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)] group-hover:scale-110 transition-transform duration-500">
                    <User size={22} className="text-blue-400" />
                  </div>
                  <h2 className="font-black text-white text-xl italic tracking-wide">Date Corp</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 bg-white/[0.03] border border-white/5 rounded-2xl p-2 flex relative">
                    {['bărbat', 'femeie'].map((g) => (
                      <button key={g} onClick={() => handleCustomSelect('gender', g)}
                        className={`flex-1 py-3 text-sm font-black tracking-widest uppercase relative z-10 transition-colors duration-300 ${profileData.gender === g ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                        {profileData.gender === g && <motion.div layoutId="gender-pill" className="absolute inset-0 bg-blue-500 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] -z-10" transition={{ type: "spring", stiffness: 300, damping: 25 }} />}
                        {g === 'bărbat' ? '👨 Bărbat' : '👩 Femeie'}
                      </button>
                    ))}
                  </div>

                  <div className="col-span-2 flex gap-4">
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 transition-all duration-300 focus-within:bg-blue-500/10 focus-within:border-blue-500/40 flex-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-1 block">Vârstă</label>
                      <input type="number" name="age" value={profileData.age} onChange={handleInputChange}
                        className={`w-full bg-transparent text-3xl font-black text-white outline-none placeholder:text-gray-800 ${noArrowsClass}`} placeholder="00" />
                    </div>
                    
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 transition-all duration-300 focus-within:bg-blue-500/10 focus-within:border-blue-500/40 flex-1">
                      <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-1"><Ruler size={12} className="text-gray-400"/> Înălțime</label>
                      <div className="flex items-baseline gap-1">
                        <input type="number" name="height" value={profileData.height} onChange={handleInputChange}
                          className={`w-full bg-transparent text-3xl font-black text-white outline-none placeholder:text-gray-800 ${noArrowsClass}`} placeholder="0" />
                        <span className="text-sm font-bold text-gray-600">cm</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 bg-white/[0.02] border border-white/5 rounded-2xl p-5 transition-all duration-300 focus-within:bg-blue-500/10 focus-within:border-blue-500/40 flex justify-between items-center">
                    <div>
                      <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-1"><Weight size={12} className="text-gray-400"/> Greutate Actuală</label>
                      <input type="number" name="weight" value={profileData.weight} onChange={handleInputChange}
                        className={`bg-transparent text-5xl font-black text-white outline-none placeholder:text-gray-800 w-32 ${noArrowsClass}`} placeholder="0.0" />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-black text-gray-500 tracking-widest uppercase mb-1">BMI Live</span>
                      {bmiData ? (
                        <div className={`px-3 py-1.5 rounded-lg border flex flex-col items-center ${bmiData.color}`}>
                          <span className="text-xl font-black">{bmiData.value}</span>
                          <span className="text-[9px] uppercase font-bold tracking-widest opacity-80">{bmiData.status}</span>
                        </div>
                      ) : (
                        <span className="text-xl font-black text-blue-500/20">--</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="group relative rounded-[32px] p-[1px] bg-gradient-to-b from-emerald-500/20 to-transparent hover:from-emerald-500/40 transition-all duration-500 hover:-translate-y-1 shadow-2xl">
              <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-3xl rounded-[32px]" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none transition-opacity group-hover:opacity-100 opacity-40" />
              
              <div className="relative p-6 lg:p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)] group-hover:scale-110 transition-transform duration-500">
                    <Target size={22} className="text-emerald-400" />
                  </div>
                  <h2 className="font-black text-white text-xl italic tracking-wide">Obiectiv Setat</h2>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-2 flex flex-col gap-1">
                    {GOALS.map((g) => (
                      <button key={g.id} onClick={() => handleCustomSelect('goal', g.id)}
                        className={`relative w-full text-left px-5 py-3 rounded-xl flex items-center gap-3 transition-colors duration-300 z-10 ${profileData.goal === g.id ? 'text-white' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}>
                        {profileData.goal === g.id && <motion.div layoutId="goal-bg" className="absolute inset-0 bg-emerald-500/20 border border-emerald-500/50 rounded-xl shadow-[inset_0_0_20px_rgba(16,185,129,0.2)] -z-10" transition={{ type: "spring", stiffness: 300, damping: 25 }} />}
                        <span className="text-xl">{g.icon}</span>
                        <span className="font-black tracking-wide uppercase text-xs">{g.label}</span>
                        {profileData.goal === g.id && <CheckCircle2 size={16} className="ml-auto text-emerald-400" />}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 transition-all duration-300 focus-within:bg-emerald-500/10 focus-within:border-emerald-500/40 flex-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-1 block">Țintă</label>
                      <div className="flex items-baseline gap-1">
                        <input type="number" name="targetWeight" value={profileData.targetWeight} onChange={handleInputChange}
                          className={`w-full bg-transparent text-3xl font-black text-white outline-none placeholder:text-gray-800 ${noArrowsClass}`} placeholder="0" />
                        <span className="text-xs font-bold text-emerald-500/50">kg</span>
                      </div>
                    </div>
                    
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 transition-all duration-300 flex-1 flex flex-col justify-center">
                      <label className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-2">
                        <span>Foc Intern</span>
                        <span className="text-emerald-400 text-xs font-black bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">LVL {profileData.motivationLevel}</span>
                      </label>
                      <input type="range" name="motivationLevel" min="1" max="10" value={profileData.motivationLevel} onChange={handleInputChange}
                        className="w-full h-1.5 bg-gray-800/50 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-8">

            <motion.div variants={itemVariants} className="group relative rounded-[32px] p-[2px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className={`absolute inset-0 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 transition-opacity duration-700 animate-[spin_4s_linear_infinite] ${isAiCalculating ? 'opacity-100 blur-xl' : 'opacity-30 group-hover:opacity-100 blur-md'}`} />
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 rounded-[32px]" />
              
              <div className="relative h-full bg-[#050505]/95 backdrop-blur-3xl rounded-[30px] p-8 lg:p-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay pointer-events-none rounded-[30px]" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-500">
                      <Zap size={28} className="text-white fill-white" />
                    </div>
                    <div>
                      <h2 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 text-3xl italic tracking-wide">
                        Ținte Zilnice Supreme
                      </h2>
                      <p className="text-xs text-fuchsia-400 font-bold uppercase tracking-[0.2em] mt-1">Sincronizat cu Obiectivul tău</p>
                    </div>
                  </div>

                  <button onClick={calculateTargetsAI} disabled={isAiCalculating}
                    className="relative group/ai overflow-hidden rounded-xl p-[1px] shrink-0 active:scale-95 transition-all">
                    <span className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-cyan-600 rounded-xl animate-pulse" />
                    <div className="relative px-5 py-3 bg-black/50 backdrop-blur-xl rounded-xl flex items-center gap-2 transition-all duration-300 group-hover/ai:bg-black/20">
                      {isAiCalculating ? (
                        <><BrainCircuit className="text-fuchsia-400 animate-spin" size={18} /> <span className="text-white font-black text-[11px] tracking-widest uppercase">AI Calculează...</span></>
                      ) : (
                        <><Sparkles className="text-fuchsia-400 group-hover/ai:text-white transition-colors" size={18} /> <span className="text-white font-black text-[11px] tracking-widest uppercase">🔮 Auto-Generează AI</span></>
                      )}
                    </div>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  
                  <motion.div whileHover={{ y: -10, scale: 1.02 }} transition={{ type: "spring", stiffness: 200 }} className="relative p-[1px] rounded-[28px] overflow-hidden group/card bg-gradient-to-b from-fuchsia-500/30 to-transparent">
                    <div className={`absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-xl rounded-[28px] transition-colors duration-500 ${isAiCalculating ? 'bg-fuchsia-900/40 animate-pulse' : 'group-hover/card:bg-fuchsia-950/20'}`} />
                    <div className="relative p-6 flex flex-col items-center justify-center text-center h-full">
                      <motion.div className="text-5xl mb-3 drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]" whileHover={{ rotate: 15, scale: 1.2 }} transition={{ type: "spring" }}>🍔⚡</motion.div>
                      <h3 className="text-[10px] font-black text-fuchsia-400 uppercase tracking-[0.25em] mb-4">Combustibil In</h3>
                      <div className="flex items-end justify-center w-full focus-within:scale-110 transition-transform duration-300">
                        {isAiCalculating ? (
                           <div className="h-14 flex items-center"><span className="w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></span></div>
                        ) : (
                          <input type="number" name="targetCaloriesIntake" value={profileData.targetCaloriesIntake} onChange={handleInputChange}
                            className={`text-center bg-transparent text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-fuchsia-300 outline-none w-full p-0 drop-shadow-2xl ${noArrowsClass}`} placeholder="0" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-fuchsia-500/50 uppercase tracking-widest mt-2 border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-1 rounded-full">Kcal Zilnice</span>
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ y: -10, scale: 1.02 }} transition={{ type: "spring", stiffness: 200 }} className="relative p-[1px] rounded-[28px] overflow-hidden group/card bg-gradient-to-b from-orange-500/30 to-transparent">
                    <div className={`absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-xl rounded-[28px] transition-colors duration-500 ${isAiCalculating ? 'bg-orange-900/40 animate-pulse' : 'group-hover/card:bg-orange-950/20'}`} />
                    <div className="relative p-6 flex flex-col items-center justify-center text-center h-full">
                      <motion.div className="text-5xl mb-3 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" whileHover={{ rotate: -15, scale: 1.2 }} transition={{ type: "spring" }}>🔥☄️</motion.div>
                      <h3 className="text-[10px] font-black text-orange-400 uppercase tracking-[0.25em] mb-4">Foc & Ardere</h3>
                      <div className="flex items-end justify-center w-full focus-within:scale-110 transition-transform duration-300">
                        {isAiCalculating ? (
                           <div className="h-14 flex items-center"><span className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></span></div>
                        ) : (
                          <input type="number" name="targetCaloriesBurn" value={profileData.targetCaloriesBurn} onChange={handleInputChange}
                            className={`text-center bg-transparent text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-orange-300 outline-none w-full p-0 drop-shadow-2xl ${noArrowsClass}`} placeholder="0" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-orange-500/50 uppercase tracking-widest mt-2 border border-orange-500/20 bg-orange-500/10 px-3 py-1 rounded-full">Kcal Active</span>
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ y: -10, scale: 1.02 }} transition={{ type: "spring", stiffness: 200 }} className="relative p-[1px] rounded-[28px] overflow-hidden group/card bg-gradient-to-b from-cyan-500/30 to-transparent">
                    <div className={`absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-xl rounded-[28px] transition-colors duration-500 ${isAiCalculating ? 'bg-cyan-900/40 animate-pulse' : 'group-hover/card:bg-cyan-950/20'}`} />
                    <div className="relative p-6 flex flex-col items-center justify-center text-center h-full">
                      <motion.div className="text-5xl mb-3 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" whileHover={{ y: -5, scale: 1.2 }} transition={{ type: "spring" }}>🌊🧊</motion.div>
                      <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.25em] mb-4">Tsunami De Apă</h3>
                      <div className="flex items-end justify-center w-full focus-within:scale-110 transition-transform duration-300">
                        {isAiCalculating ? (
                           <div className="h-14 flex items-center"><span className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></span></div>
                        ) : (
                          <input type="number" name="targetWater" value={profileData.targetWater} onChange={handleInputChange}
                            className={`text-center bg-transparent text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-300 outline-none w-full p-0 drop-shadow-2xl ${noArrowsClass}`} placeholder="0" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-cyan-500/50 uppercase tracking-widest mt-2 border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 rounded-full">Pahare (250ml)</span>
                    </div>
                  </motion.div>

                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="group relative rounded-[32px] p-[1px] bg-gradient-to-b from-yellow-500/20 to-transparent hover:from-yellow-500/40 transition-all duration-500 hover:-translate-y-1 shadow-2xl mt-4">
              <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-3xl rounded-[32px]" />
              
              <div className="relative p-8 lg:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-yellow-500/10 p-4 rounded-2xl border border-yellow-500/20 shadow-[inset_0_0_20px_rgba(234,179,8,0.1)] group-hover:scale-110 transition-transform duration-500">
                      <Heart size={26} className="text-yellow-400" />
                    </div>
                    <h2 className="font-black text-white text-2xl italic tracking-wide">Preferințe Dietă</h2>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  {FOOD_PREFERENCES.map((food) => {
                    const isSelected = profileData.likedFoods.includes(food);
                    return (
                      <button key={food} onClick={() => togglePreference('likedFoods', food)}
                        className={`group/btn relative px-6 py-4 rounded-[20px] text-sm font-black uppercase tracking-wider transition-all duration-500 border overflow-hidden ${
                          isSelected ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/50 shadow-[0_0_25px_rgba(234,179,8,0.2)] scale-105' : 'bg-white/[0.02] text-gray-500 border-white/5 hover:bg-white/[0.08] hover:text-white hover:border-white/20 hover:scale-105'
                        }`}>
                        {isSelected && <span className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-[20px]" />}
                        <span className="relative z-10 flex items-center gap-3">
                          {isSelected && <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_#facc15]" />}{food}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="group relative rounded-[32px] p-[1px] bg-gradient-to-b from-purple-500/20 to-transparent hover:from-purple-500/40 transition-all duration-500 hover:-translate-y-1 shadow-2xl">
              <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-3xl rounded-[32px]" />
              
              <div className="relative p-8 lg:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20 shadow-[inset_0_0_20px_rgba(168,85,247,0.1)] group-hover:scale-110 transition-transform duration-500">
                      <Dumbbell size={26} className="text-purple-400" />
                    </div>
                    <h2 className="font-black text-white text-2xl italic tracking-wide">Stil de Antrenament</h2>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  {WORKOUT_PREFERENCES.map((workout) => {
                    const isSelected = profileData.preferredWorkouts.includes(workout);
                    return (
                      <button key={workout} onClick={() => togglePreference('preferredWorkouts', workout)}
                        className={`group/btn relative px-6 py-4 rounded-[20px] text-sm font-black uppercase tracking-wider transition-all duration-500 border overflow-hidden ${
                          isSelected ? 'bg-purple-500/15 text-purple-300 border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.2)] scale-105' : 'bg-white/[0.02] text-gray-500 border-white/5 hover:bg-white/[0.08] hover:text-white hover:border-white/20 hover:scale-105'
                        }`}>
                        {isSelected && <span className="absolute inset-0 bg-purple-500/20 blur-xl rounded-[20px]" />}
                        <span className="relative z-10 flex items-center gap-3">
                          {isSelected && <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_#c084fc]" />}{workout}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>

          </div>
        </motion.div>

      </div>
    </main>
  );
}