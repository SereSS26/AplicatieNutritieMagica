"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
// Am adăugat Sparkles la importuri
import {
  TrendingUp, Trophy, Zap, Star, Droplets, Flame, Utensils,
  Target, Activity, BarChart2, Calendar, Quote,
  ArrowUpRight, ArrowDownRight, Dumbbell, Award, Minus, Sparkles
} from 'lucide-react';
import { useDashboardContext } from '@/src/context/DashboardContext';
import { supabase } from '@/src/lib/supabase';

const STATIC_PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: (i * 137.5) % 100, 
  y: (i * 181.7) % 100,
  size: (i % 3) + 1,
  duration: (i % 10) + 15,
  delay: (i % 5),
  color: i % 3 === 0 ? '#d946ef' : i % 3 === 1 ? '#22d3ee' : '#f97316',
  randomX: (i % 7) * 4 - 12,
}));

const MOTIVATIONAL_QUOTES = [
  { text: "Nu te opri când ești obosit, oprește-te când ai terminat.", author: "David Goggins" },
  { text: "Singurul antrenament prost e cel care nu a avut loc.", author: "Anonim" },
  { text: "Diferența dintre imposibil și posibil stă în determinarea ta.", author: "Tommy Lasorda" },
  { text: "Ceea ce pare greu azi, va fi încălzirea ta mâine.", author: "Anonim" },
  { text: "Corpul tău poate face orice, mintea e cea pe pe care trebuie să o convingi.", author: "Vince Lombardi" },
  { text: "Motivația te face să pornești, obișnuința te face să continui.", author: "Jim Ryun" },
  { text: "Succesul nu este un accident. Este muncă grea, perseverență și învățare.", author: "Pele" },
  { text: "Fii mai puternic decât cea mai bună scuză a ta.", author: "Anonim" }
];

// ─── Floating Particle System ────────────────────────────────────────────────
function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {STATIC_PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full opacity-30"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, backgroundColor: p.color }}
          animate={{ y: [0, -80, 0], x: [0, p.randomX, 0], opacity: [0, 0.4, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix = '', decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString('ro-RO')}{suffix}</>;
}

// ─── Ring Progress ────────────────────────────────────────────────────────────
interface RingProgressProps {
  value: number;
  max: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  label: string;
  sublabel?: string;
}

function RingProgress({ value, max, color, size = 120, strokeWidth = 10, label, sublabel }: RingProgressProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const r = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-white">{Math.round(pct)}%</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-bold text-white mb-0.5">{label}</div>
        <div className="text-xs font-medium text-gray-500">{sublabel}</div>
      </div>
    </div>
  );
}

// ─── Heatmap Calendar ─────────────────────────────────────────────────────────
function ActivityHeatmap({ data }: { data: { date: string; intensity: number; isFuture?: boolean }[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const months = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const weeks = useMemo(() => {
    if (!data || data.length === 0) return [];
    const w: { date: string; intensity: number; isFuture?: boolean; month: number }[][] = [];
    for (let i = 0; i < data.length; i += 7) {
      const weekChunk = data.slice(i, i + 7).map(d => ({
        ...d,
        month: new Date(d.date).getMonth()
      }));
      w.push(weekChunk);
    }
    return w;
  }, [data]);

  const intensityColors = [
    'bg-white/5',
    'bg-fuchsia-900/60',
    'bg-fuchsia-700/70',
    'bg-fuchsia-500/80',
    'bg-fuchsia-400 shadow-[0_0_8px_#d946ef]',
  ];

  const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  if (!mounted || !data) {
    return <div className="w-full h-40 bg-white/5 rounded-xl animate-pulse"></div>;
  }

  return (
    <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
      <div className="flex gap-1.5 min-w-max">
        <div className="flex flex-col gap-1.5 mr-2 pt-6">
          {dayLabels.map((d, i) => (
            <div key={i} className="w-4 h-4 flex items-center justify-center text-[10px] text-gray-600 font-bold">{d}</div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1.5">
            <div className="h-5 flex items-center">
              {week[0] && new Date(week[0].date).getDate() <= 7 && (
                <span className="text-[10px] font-bold text-gray-500">{months[week[0].month]}</span>
              )}
            </div>
            {week.map((day, di) => (
              <motion.div
                key={di}
                className={`w-4 h-4 rounded-[4px] cursor-pointer transition-all duration-200 hover:scale-125 ${
                  day.isFuture 
                    ? 'bg-white/5 opacity-40 border border-white/10 border-dashed hover:opacity-100 hover:border-fuchsia-500/50' 
                    : intensityColors[day.intensity]
                }`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: wi * 0.02 + di * 0.005 }}
                title={day.isFuture ? `${day.date}: În curând...` : `${day.date}: ${day.intensity > 0 ? 'Zi activă' : 'Fără activitate'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Weekly Goal Progress Bar ─────────────────────────────────────────────────
interface GoalProgressBarProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  icon: React.ElementType<{ size?: number; style?: React.CSSProperties }>;
}

function GoalProgressBar({ label, current, target, unit, color, icon: Icon }: GoalProgressBarProps) {
  const pct = Math.min((current / target) * 100, 100);
  const done = pct >= 100;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}20` }}>
            <Icon size={14} style={{ color }} />
          </div>
          <span className="text-sm font-bold text-gray-300">{label}</span>
          {done && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">✓ Atins</span>}
        </div>
        <span className="text-xs font-bold text-gray-400">{current.toLocaleString('ro-RO')} / {target.toLocaleString('ro-RO')} {unit}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full relative"
          style={{ backgroundColor: color, boxShadow: done ? `0 0 12px ${color}` : 'none' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          {done && (
            <span className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          )}
        </motion.div>
      </div>
    </div>
  );
}

// ─── Comparison Card ──────────────────────────────────────────────────────────
function ComparisonStat({ label, current, previous, unit }: { label: string; current: number; previous: number; unit: string }) {
  const diff = current - previous;
  const pct = previous > 0 
    ? ((Math.abs(diff) / previous) * 100).toFixed(1) 
    : current > 0 ? '100.0' : '0.0';
  const up = diff > 0;
  const neutral = diff === 0;

  return (
    <div className="flex flex-col gap-1 bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all">
      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-black text-white">{current.toLocaleString('ro-RO')}</span>
        <span className="text-xs text-gray-500 mb-1">{unit}</span>
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold ${neutral ? 'text-gray-400' : up ? 'text-emerald-400' : 'text-red-400'}`}>
        {neutral ? <Minus size={12} /> : up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {neutral ? 'Neschimbat' : `${up ? '+' : '-'}${pct}% față de săptămâna trecută`}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ProgresPage() {
  const { progressStats } = useDashboardContext();
  
  const { 
    loading, 
    streak, 
    weeklyBurned, 
    evolutionData, 
    badges, 
    userGoals, 
    weeklyWorkoutCount,
    prevWeeklyBurned, 
    prevWeeklyEaten,  
    prevStreak,
    avgMacros,
    heatmapData
  } = progressStats as any;

  const [activeTab, setActiveTab] = useState<'calorii' | 'macros' | 'hidratare'>('calorii');
  const [randomQuote, setRandomQuote] = useState(MOTIVATIONAL_QUOTES[0]);
  const [targetCalories, setTargetCalories] = useState<number>(2500);

  useEffect(() => {
    // Generăm un citat complet aleatoriu o singură dată la încărcarea paginii
    setRandomQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

    const fetchUserGoal = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!profile) {
          const { data: fallbackProfile } = await supabase.from('users').select('*').eq('id', session.user.id).maybeSingle();
          if (fallbackProfile) profile = fallbackProfile;
        }

        const userMeta = session.user.user_metadata || {};
        
        const rawWeight = userMeta.weight ?? profile?.current_weight ?? profile?.weight ?? 75;
        const rawHeight = userMeta.height ?? profile?.height ?? 170;
        const rawAge = userMeta.age ?? profile?.age ?? 30;
        
        const weight = parseFloat(String(rawWeight)) || 75;
        const height = parseFloat(String(rawHeight)) || 170;
        const age = parseInt(String(rawAge)) || 30;
        
        const gender = String(userMeta.gender ?? profile?.gender ?? 'masculin').toLowerCase();
        const activityLevel = String(userMeta.activity_level ?? profile?.activity_level ?? 'sedentar').toLowerCase();
        const goal = String(userMeta.goal ?? profile?.goal ?? 'mentinere').toLowerCase();

        let bmr = (10 * weight) + (6.25 * height) - (5 * age);
        bmr = (gender.includes('masculin') || gender === 'm') ? bmr + 5 : bmr - 161;

        let multiplier = 1.2;
        if (activityLevel.includes('usor') || activityLevel.includes('ușor')) multiplier = 1.375;
        else if (activityLevel.includes('moderat')) multiplier = 1.55;
        else if (activityLevel.includes('foarte') || activityLevel.includes('activ')) multiplier = 1.725;

        let calculatedTdee = Math.round(bmr * multiplier);
        if (goal.includes('slabi') || goal.includes('slăbi') || goal.includes('pierd')) calculatedTdee -= 500;
        else if (goal.includes('masa') || goal.includes('masă') || goal.includes('muscul') || goal.includes('cres')) calculatedTdee += 300;

        const userCalorieGoal = userMeta.calorie_goal ? parseInt(String(userMeta.calorie_goal)) : calculatedTdee;
        
        setTargetCalories(userCalorieGoal);
      } catch (error) {
        console.error("Eroare la preluarea obiectivului caloric:", error);
      }
    };

    fetchUserGoal();
  }, []);

  const maxEaten = Math.max(...(evolutionData?.map((d: { eaten: number }) => d.eaten) || [targetCalories]), targetCalories);
  const maxBurned = Math.max(...(evolutionData?.map((d: { burned: number }) => d.burned) || [1000]), 1000);
  const maxWater = userGoals?.water || 8;

  const currWeekBurned = weeklyBurned || 0;
  const currentStreak = streak || 0;
  
  const currWeekEaten = useMemo(() => {
    if (!evolutionData) return 0;
    return evolutionData.reduce((sum: number, day: { eaten: number }) => sum + (day.eaten || 0), 0);
  }, [evolutionData]);

  const avgCalories = Math.round(currWeekEaten / 7);

  const previousBurned = prevWeeklyBurned || 0;
  const previousEaten = prevWeeklyEaten || 0;
  const previousStreak = prevStreak || 0;

  const targetProtein = Math.round((targetCalories * 0.3) / 4); 

  const goals = [
    { label: 'Calorii Arse', current: currWeekBurned, target: Math.round(targetCalories * 1.5), unit: 'kcal', color: '#f97316', icon: Flame },
    { label: 'Antrenamente', current: weeklyWorkoutCount || 0, target: userGoals?.weeklyWorkouts || 3, unit: 'sesiuni', color: '#d946ef', icon: Dumbbell },
    { label: 'Hidratare medie', current: evolutionData ? Math.round(evolutionData.reduce((s: number, d: { water: number }) => s + d.water, 0) / 7 * 10) / 10 : 0, target: userGoals?.water || 8, unit: 'pahare/zi', color: '#22d3ee', icon: Droplets },
    { label: 'Streak', current: currentStreak, target: 7, unit: 'zile', color: '#a3e635', icon: Zap },
  ];

  const containerVariants: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants: Variants = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 70, damping: 15 } } };

  return (
    <main className="h-full w-full p-4 lg:p-10 overflow-y-auto relative z-10 custom-scrollbar">

      {/* ── Atmospheric Glows ── */}
      <div className="fixed top-[10%] right-[5%] w-[45%] h-[45%] bg-fuchsia-600/8 rounded-full blur-[180px] pointer-events-none" />
      <div className="fixed bottom-[5%] left-[0%] w-[35%] h-[35%] bg-cyan-600/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed top-[50%] left-[30%] w-[20%] h-[20%] bg-orange-600/5 rounded-full blur-[120px] pointer-events-none" />
      <ParticleField />

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-6 pb-10">

        {/* ── HEADER ── */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-black/50 border border-white/8 p-5 lg:p-7 rounded-[28px] backdrop-blur-2xl shadow-2xl"
        >
          <div className="flex flex-col justify-between items-start gap-4">
            <div className="w-full">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse shadow-[0_0_8px_#d946ef]" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Live Analytics</span>
              </div>
              <h1 className="text-2xl lg:text-4xl font-black italic tracking-tighter text-white mt-1">
                Analiza <span className="text-fuchsia-400 drop-shadow-[0_0_20px_#d946ef]">Progresului</span>
              </h1>
              
              {/* ── PANELUL PREMIUM ── */}
              <div className="mt-4 flex items-start sm:items-center gap-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden group/panel transition-all hover:border-fuchsia-500/30 hover:shadow-[0_8px_30px_rgba(217,70,239,0.15)] w-full max-w-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-transparent pointer-events-none opacity-50 group-hover/panel:opacity-100 transition-opacity" />
                
                <div className="bg-fuchsia-500/20 p-2.5 rounded-xl border border-fuchsia-500/30 shrink-0 relative z-10 shadow-[inset_0_0_15px_rgba(217,70,239,0.2)]">
                  <TrendingUp size={22} className="text-fuchsia-400" />
                </div>
                
                <p className="text-gray-300 font-medium text-sm sm:text-base leading-relaxed relative z-10">
                  Evoluția ta din ultimele <span className="text-white font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">7 zile</span> — comparată, analizată și vizualizată detaliat cu ajutorul <span className="inline-block mt-1 sm:mt-0 text-fuchsia-400 font-black uppercase tracking-widest text-[10px] sm:text-xs sm:mx-1 bg-fuchsia-500/10 px-2.5 py-1 rounded-lg border border-fuchsia-500/20 shadow-[0_0_10px_rgba(217,70,239,0.2)]">AI-ului</span>.
                </p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* ── ROW 1: Streak + Weekly Goals + Comparison ── */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          <motion.div variants={itemVariants} className="lg:col-span-3">
            <div className="bg-gradient-to-br from-orange-500/15 to-red-900/10 border border-orange-500/25 p-7 rounded-[28px] backdrop-blur-xl relative overflow-hidden flex flex-col items-center justify-center text-center h-full shadow-[0_0_60px_rgba(249,115,22,0.08)] group">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-500/15 blur-3xl rounded-full" />
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="bg-gradient-to-b from-orange-400 to-orange-600 p-4 rounded-full mb-4 shadow-[0_0_30px_rgba(249,115,22,0.5)] relative z-10"
              >
                <Zap className="text-black" size={28} fill="black" />
              </motion.div>
              <h2 className="text-orange-300/70 font-bold uppercase tracking-widest text-[10px] mb-2 relative z-10">Streak Activ</h2>
              <div className="relative z-10">
                <span className="text-8xl font-black text-white tracking-tighter drop-shadow-[0_0_30px_rgba(249,115,22,0.6)] tabular-nums">
                  {loading ? '-' : <AnimatedCounter value={currentStreak} />}
                </span>
                <span className="text-orange-400 font-bold text-lg ml-1">zile</span>
              </div>
              <div className="flex gap-1 mt-4 relative z-10">
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${i < currentStreak ? 'bg-orange-500 text-black shadow-[0_0_8px_#f97316]' : 'bg-white/5 text-gray-600'}`}>
                    {i < currentStreak ? '✓' : i + 1}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-5">
            <div className="bg-black/40 border border-white/8 p-7 rounded-[28px] backdrop-blur-xl h-full flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="bg-fuchsia-500/20 p-2 rounded-xl"><Target size={18} className="text-fuchsia-400" /></div>
                <h2 className="font-black text-white text-lg italic">Obiective Săptămânale</h2>
              </div>
              <div className="flex flex-col gap-4 flex-1 justify-around">
                {goals.map((g, i) => (
                  <GoalProgressBar key={i} {...g} />
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-4">
            <div className="bg-black/40 border border-white/8 p-7 rounded-[28px] backdrop-blur-xl h-full flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-500/20 p-2 rounded-xl"><TrendingUp size={18} className="text-cyan-400" /></div>
                <h2 className="font-black text-white text-lg italic">Față de Săpt. Trecută</h2>
              </div>
              <div className="grid grid-cols-1 gap-3 flex-1">
                <ComparisonStat label="Calorii Arse" current={currWeekBurned} previous={previousBurned} unit="kcal" />
                <ComparisonStat label="Calorii Consumate" current={currWeekEaten} previous={previousEaten} unit="kcal" />
                <ComparisonStat label="Streak" current={currentStreak} previous={previousStreak} unit="zile" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ── ROW 2: Charts Tabs + Macros (EXPANDAT - TALLER) ── */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* CHART PANEL */}
          <motion.div variants={itemVariants} className="lg:col-span-8">
            <div className="bg-black/40 border border-white/8 p-7 rounded-[28px] backdrop-blur-xl h-full flex flex-col">
              {/* Tab switcher */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-black italic flex items-center gap-2 text-white">
                  <BarChart2 className="text-fuchsia-500" /> Evoluție Grafică
                </h2>
                <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
                  {(['calorii', 'macros', 'hidratare'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize ${activeTab === tab ? 'bg-fuchsia-500 text-white shadow-[0_0_12px_#d946ef]' : 'text-gray-400 hover:text-white'}`}>
                      {tab === 'calorii' ? 'Calorii' : tab === 'macros' ? 'Macros' : 'Hidratare'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex-1 flex flex-col w-full min-h-[320px]">
                <AnimatePresence mode="wait">
                  {/* TAB: CALORII */}
                  {activeTab === 'calorii' && (
                    <motion.div key="calorii" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 flex flex-col w-full h-full">
                      <div className="flex justify-end gap-4 text-xs font-bold w-full mb-4">
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-fuchsia-500 shadow-[0_0_8px_#d946ef]" /> Consumat</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" /> Ars</div>
                      </div>
                      
                      <div className="flex items-end justify-between gap-2 sm:gap-4 flex-1 w-full relative">
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                          {[0, 1, 2, 3, 4].map(i => <div key={i} className="border-b border-white/5 w-full" />)}
                        </div>
                        {loading ? (
                          <div className="w-full h-full flex items-center justify-center text-gray-600 animate-pulse text-sm">Încărcăm datele...</div>
                        ) : (
                          evolutionData?.map((item: { zi: string; eaten: number; burned: number }, i: number) => {
                            const eatenH = Math.min((item.eaten / maxEaten) * 100, 100);
                            const burnedH = Math.min((item.burned / maxBurned) * 100, 100);
                            const isToday = i === (evolutionData.length - 1);
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative h-full">
                                <div className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[#111] border border-white/10 p-3 rounded-2xl shadow-2xl z-20 pointer-events-none min-w-[110px]">
                                  <div className="text-[10px] text-gray-500 font-bold mb-1">{isToday ? 'Azi' : item.zi}</div>
                                  <div className="text-fuchsia-400 text-xs font-bold"><Utensils size={10} className="inline mr-1" />{item.eaten} kcal</div>
                                  <div className="text-orange-400 text-xs font-bold"><Flame size={10} className="inline mr-1" />{item.burned} kcal</div>
                                </div>
                                <div className="w-full h-full flex items-end justify-center gap-1.5 relative z-10">
                                  <div className="w-[45%] bg-white/3 rounded-t-lg relative overflow-hidden flex items-end h-full">
                                    <motion.div initial={{ height: 0 }} animate={{ height: `${eatenH}%` }} transition={{ duration: 1.5, type: 'spring', delay: i * 0.05 }}
                                      className="w-full rounded-t-lg bg-gradient-to-t from-fuchsia-900 via-fuchsia-600 to-fuchsia-400" />
                                  </div>
                                  <div className="w-[45%] bg-white/3 rounded-t-lg relative overflow-hidden flex items-end h-full">
                                    <motion.div initial={{ height: 0 }} animate={{ height: `${burnedH}%` }} transition={{ duration: 1.5, type: 'spring', delay: i * 0.05 + 0.1 }}
                                      className="w-full rounded-t-lg bg-gradient-to-t from-orange-900 via-orange-600 to-orange-400" />
                                  </div>
                                </div>
                                <span className={`text-xs font-bold transition-colors ${isToday ? 'text-fuchsia-400' : 'text-gray-600 group-hover:text-white'}`}>
                                  {isToday ? 'Azi' : item.zi}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* TAB: MACROS */}
                  {activeTab === 'macros' && (
                    <motion.div key="macros" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 flex flex-col justify-center w-full">
                      <div className="flex flex-col items-center justify-center w-full gap-6">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Media zilnică (Ultimele 7 zile)</p>
                        <div className="flex flex-row justify-center gap-12 sm:gap-32 w-full">
                          <RingProgress value={avgCalories} max={targetCalories} color="#f97316" size={180} strokeWidth={14} label="Calorii" sublabel={`${avgCalories} / ${targetCalories} kcal`} />
                          <RingProgress value={avgMacros?.protein || 0} max={targetProtein} color="#d946ef" size={180} strokeWidth={14} label="Proteine" sublabel={`${avgMacros?.protein || 0} / ${targetProtein} g`} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB: HIDRATARE */}
                  {activeTab === 'hidratare' && (
                    <motion.div key="hidratare" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 flex flex-col w-full h-full">
                      <div className="flex items-end justify-between flex-1 w-full gap-2 relative mt-8">
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                          {[0, 1, 2, 3, 4].map(i => <div key={i} className="border-b border-white/5 w-full" />)}
                        </div>
                        {!loading && evolutionData?.map((item: { zi: string; water: number }, i: number) => {
                          const waterH = Math.min((item.water / maxWater) * 100, 100);
                          const met = item.water >= maxWater;
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full relative">
                              <div className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-xs font-bold text-cyan-300 transition-opacity z-20 bg-black/80 p-2 rounded-lg">{item.water}/{maxWater}</div>
                              <div className="flex-1 flex items-end w-full relative z-10">
                                <div className="w-full bg-white/3 rounded-t-xl overflow-hidden flex items-end h-full">
                                  <motion.div initial={{ height: 0 }} animate={{ height: `${waterH}%` }} transition={{ duration: 1.2, type: 'spring', delay: i * 0.06 }}
                                    className={`w-full rounded-t-xl transition-all ${met ? 'bg-gradient-to-t from-cyan-900 to-cyan-400' : 'bg-gradient-to-t from-cyan-950 to-cyan-800/50'}`}
                                    style={met ? { boxShadow: '0 0 20px rgba(34,211,238,0.4)' } : {}} />
                                </div>
                              </div>
                              <span className={`text-xs font-bold ${i === (evolutionData.length - 1) ? 'text-cyan-400' : 'text-gray-600 group-hover:text-white'} transition-colors`}>
                                {i === (evolutionData.length - 1) ? 'Azi' : item.zi}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* BADGES + TOTAL ARSE */}
          <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-black/40 border border-fuchsia-500/15 p-7 rounded-[28px] backdrop-blur-xl group hover:border-fuchsia-500/30 transition-all relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-600/10 blur-3xl rounded-full" />
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="bg-fuchsia-500/20 p-2.5 rounded-xl"><Flame size={18} className="text-fuchsia-400" /></div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Arse Ultimele 7 Zile</span>
              </div>
              <div className="relative z-10">
                <div className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_20px_#d946ef]">
                  {loading ? '...' : <AnimatedCounter value={currWeekBurned} />}
                </div>
                <div className="text-fuchsia-400 font-bold text-sm mt-1">kcal total</div>
              </div>
            </div>

            <div className="bg-black/40 border border-white/8 p-7 rounded-[28px] backdrop-blur-xl flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-yellow-500/20 p-2.5 rounded-xl"><Award size={18} className="text-yellow-400" /></div>
                <h3 className="font-black text-white text-lg italic">Trofee Câștigate</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-1">
                {[
                  { key: 'titan', icon: Trophy, label: 'Titan de Fier', sub: '3 antren./săpt', unlocked: badges?.titan, color: '#eab308', glow: 'rgba(234,179,8,0.3)' },
                  { key: 'precizie', icon: Star, label: 'Precizie AI', sub: 'Streak 3+ zile', unlocked: badges?.precizie, color: '#d946ef', glow: 'rgba(217,70,239,0.3)' },
                  { key: 'hidro', icon: Droplets, label: 'Hidro Hero', sub: '7 zile la țintă', unlocked: badges?.hidratare, color: '#22d3ee', glow: 'rgba(34,211,238,0.3)' },
                  { key: 'macro', icon: Activity, label: 'Echilibru', sub: 'Consistență pură', unlocked: currentStreak >= 5, color: '#f97316', glow: 'rgba(249,115,22,0.3)' },
                ].map(({ key, icon: Icon, label, sub, unlocked, color, glow }) => (
                  <motion.div key={key}
                    whileHover={unlocked ? { scale: 1.05 } : {}}
                    className={`p-4 rounded-[20px] flex flex-col items-center justify-center text-center gap-2 transition-all border relative overflow-hidden
                      ${unlocked ? 'border-opacity-40 cursor-default' : 'bg-black/40 border-white/5 opacity-40 grayscale'}`}
                    style={unlocked ? { borderColor: color, background: `radial-gradient(circle at top, ${glow}, transparent 70%)` } : {}}
                  >
                    {unlocked && (
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
                    )}
                    <Icon size={24} style={unlocked ? { color, filter: `drop-shadow(0 0 10px ${color})` } : { color: '#4b5563' }} />
                    <div>
                      <span className="font-bold text-xs text-white block leading-tight">{label}</span>
                      <span className="text-[9px] text-gray-500 mt-0.5 block">{sub}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ── ROW 3: Heatmap Calendar + Quote of the Day ── */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* CALENDAR */}
          <motion.div variants={itemVariants} className="lg:col-span-8">
            <div className="bg-black/40 border border-white/8 p-7 rounded-[28px] backdrop-blur-xl h-full flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-black italic flex items-center gap-2 text-white">
                  <Calendar className="text-fuchsia-500" /> Calendar Activitate
                </h2>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                  <span>Mai puțin</span>
                  {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className={`w-4 h-4 rounded-[4px] ${['bg-white/5', 'bg-fuchsia-900/60', 'bg-fuchsia-700/70', 'bg-fuchsia-500/80', 'bg-fuchsia-400'][i]}`} />
                  ))}
                  <span>Mai mult</span>
                </div>
              </div>
              <div className="flex-1 flex items-center">
                <ActivityHeatmap data={heatmapData} />
              </div>
            </div>
          </motion.div>

          {/* CITATUL ZILEI */}
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <div className="bg-gradient-to-br from-fuchsia-900/30 to-black border border-fuchsia-500/20 p-7 rounded-[28px] backdrop-blur-xl h-full relative overflow-hidden flex flex-col justify-center">
              {/* Fundal Decorativ */}
              <div className="absolute -bottom-10 -right-10 opacity-10 rotate-12">
                <Quote size={120} className="text-fuchsia-400" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-white/10 p-2 rounded-full border border-white/5 backdrop-blur-md">
                    <Quote size={16} className="text-white" />
                  </div>
                  <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest">Citatul Zilei</span>
                </div>
                
                <p className="text-lg font-bold text-white mb-4 leading-snug">
                  "{randomQuote.text}"
                </p>
                
                <div className="flex items-center gap-2">
                  <div className="w-6 h-[1px] bg-fuchsia-500"></div>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {randomQuote.author}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

        </motion.div>

      </div>
    </main>
  );
}