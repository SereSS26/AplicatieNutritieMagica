"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  TrendingUp, Trophy, Zap, Star, Droplets, Flame, Utensils,
  ChevronRight, Target, Activity, BarChart2, Calendar,
  ArrowUpRight, ArrowDownRight, Dumbbell, Apple, User, LayoutDashboard,
  ChevronLeft, Award, Minus
} from 'lucide-react';
import Link from 'next/link';
import { useDashboardContext } from '@/src/context/DashboardContext';

const STATIC_PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: (i * 137.5) % 100, // Deterministic "random" positions
  y: (i * 181.7) % 100,
  size: (i % 3) + 1,
  duration: (i % 10) + 15,
  delay: (i % 5),
  color: i % 3 === 0 ? '#d946ef' : i % 3 === 1 ? '#22d3ee' : '#f97316',
  randomX: (i % 7) * 4 - 12,
}));

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
  const pct = Math.min((value / max) * 100, 100);
  const r = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
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
          <span className="text-xl font-black text-white">{Math.round(pct)}%</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-bold text-white">{label}</div>
        <div className="text-xs text-gray-500">{sublabel}</div>
      </div>
    </div>
  );
}

// ─── Heatmap Calendar ─────────────────────────────────────────────────────────
function ActivityHeatmap({ data }: { data: { date: string; intensity: number }[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const months = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const allDays = useMemo(() => {
    const today = new Date();
    const days: { date: string; intensity: number; month: number }[] = [];
    for (let i = 111; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const found = data?.find(x => x.date === key);
      const rand1 = Math.sin(d.getTime()) * 10000;
      const r1 = rand1 - Math.floor(rand1);
      const rand2 = Math.cos(d.getTime()) * 10000;
      const r2 = rand2 - Math.floor(rand2);
      days.push({ 
        date: key, 
        intensity: found?.intensity ?? (r1 > 0.35 ? Math.floor(r2 * 4) + 1 : 0), 
        month: d.getMonth() 
      });
    }
    return days;
  }, [data]);

  const weeks = useMemo(() => {
    const w: { date: string; intensity: number; month: number }[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      w.push(allDays.slice(i, i + 7));
    }
    return w;
  }, [allDays]);

  const intensityColors = [
    'bg-white/5',
    'bg-fuchsia-900/60',
    'bg-fuchsia-700/70',
    'bg-fuchsia-500/80',
    'bg-fuchsia-400 shadow-[0_0_8px_#d946ef]',
  ];

  const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  if (!mounted) {
    return <div className="w-full h-32 bg-white/5 rounded-xl animate-pulse"></div>;
  }

  return (
    <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
      <div className="flex gap-1 min-w-max">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1 pt-6">
          {dayLabels.map((d, i) => (
            <div key={i} className="w-3 h-3 flex items-center justify-center text-[9px] text-gray-600 font-bold">{d}</div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {/* Month label above first day of each month */}
            <div className="h-5 flex items-center">
              {week[0] && new Date(week[0].date).getDate() <= 7 && (
                <span className="text-[9px] font-bold text-gray-500">{months[week[0].month]}</span>
              )}
            </div>
            {week.map((day, di) => (
              <motion.div
                key={di}
                className={`w-3 h-3 rounded-[3px] cursor-pointer transition-all duration-200 hover:scale-125 ${intensityColors[day.intensity]}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: wi * 0.02 + di * 0.005 }}
                title={`${day.date}: intensitate ${day.intensity}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Macro Donut ──────────────────────────────────────────────────────────────
function MacroDonut({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const total = protein + carbs + fat;
  const segments = [
    { label: 'Proteine', value: protein, color: '#d946ef', glow: '#d946ef' },
    { label: 'Carbohidrați', value: carbs, color: '#22d3ee', glow: '#22d3ee' },
    { label: 'Grăsimi', value: fat, color: '#f97316', glow: '#f97316' },
  ];

  let cumAngle = -90;
  const size = 140;
  const r = 52;
  const cx = size / 2;
  const cy = size / 2;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const polarToXY = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos(toRad(angle)),
    y: cy + radius * Math.sin(toRad(angle)),
  });

  const paths = segments.map(seg => {
    const pct = seg.value / total;
    const sweepDeg = pct * 360;
    const start = polarToXY(cumAngle, r);
    const end = polarToXY(cumAngle + sweepDeg - 1, r);
    const largeArc = sweepDeg > 180 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
    cumAngle += sweepDeg;
    return { ...seg, d, pct };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width={size} height={size}>
          <circle cx={cx} cy={cy} r={r + 2} fill="rgba(0,0,0,0.5)" />
          {paths.map((seg, i) => (
            <motion.path
              key={i}
              d={seg.d}
              fill={seg.color}
              opacity={0.85}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{ delay: i * 0.2 }}
              style={{ filter: `drop-shadow(0 0 6px ${seg.glow})` }}
              className="hover:opacity-100 cursor-pointer transition-opacity"
            />
          ))}
          {/* Inner hole */}
          <circle cx={cx} cy={cy} r={r * 0.55} fill="#0a0a0a" />
          <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="14" fontWeight="900">{total}</text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="#6b7280" fontSize="9">kcal</text>
        </svg>
      </div>
      <div className="flex flex-col gap-2 w-full">
        {paths.map((seg, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color, boxShadow: `0 0 6px ${seg.glow}` }} />
              <span className="text-gray-400 font-medium">{seg.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{seg.value}g</span>
              <span className="text-gray-600">{Math.round(seg.pct * 100)}%</span>
            </div>
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
  const pct = previous > 0 ? ((diff / previous) * 100).toFixed(1) : '0';
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
        {neutral ? 'Neschimbat' : `${up ? '+' : ''}${pct}% față de săptămâna trecută`}
      </div>
    </div>
  );
}

// ─── Navigation Quick Links ───────────────────────────────────────────────────
function QuickNavBar() {
  const links = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: '#d946ef' },
    { href: '/dashboard/nutritie', icon: Apple, label: 'Nutriție', color: '#22d3ee' },
    { href: '/dashboard/antrenamente', icon: Dumbbell, label: 'Antrenamente', color: '#f97316' },
    { href: '/dashboard/setari', icon: User, label: 'Profil', color: '#a3e635' },
  ];
  return (
    <nav className="flex items-center gap-2 flex-wrap">
      {links.map(({ href, icon: Icon, label, color }) => (
        <Link key={href} href={href}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
          >
            <Icon size={14} style={{ color }} />
            <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">{label}</span>
          </motion.div>
        </Link>
      ))}
    </nav>
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
    weeklyWorkoutCount 
  } = progressStats;
  const [activeTab, setActiveTab] = useState<'calorii' | 'macros' | 'hidratare'>('calorii');

  const maxEaten = Math.max(...(evolutionData?.map((d: { eaten: number }) => d.eaten) || [userGoals?.calories || 2500]), userGoals?.calories || 2500);
  const maxBurned = Math.max(...(evolutionData?.map((d: { burned: number }) => d.burned) || [1000]), 1000);
  const maxWater = userGoals?.water || 8;

  // Mock comparison data (previous week)
  const prevWeekBurned = Math.round(weeklyBurned * 0.87);
  const prevWeekEaten = evolutionData ? Math.round(evolutionData.reduce((s: number, d: { eaten: number }) => s + d.eaten, 0) * 0.93) : 12000;
  const currWeekEaten = evolutionData ? evolutionData.reduce((s: number, d: { eaten: number }) => s + d.eaten, 0) : 13000;

  // Mock macro averages
  const avgMacros = { protein: 142, carbs: 218, fat: 68 };

  // Obiective săptămânale dinamice
  const goals = [
    { 
      label: 'Calorii Arse', 
      current: weeklyBurned || 0, 
      target: (userGoals?.calories || 2500) * 1.5, // Țintă estimată: 1.5x rată metabolică pentru activitate
      unit: 'kcal', 
      color: '#f97316', 
      icon: Flame 
    },
    { 
      label: 'Antrenamente', 
      current: weeklyWorkoutCount || 0, 
      target: userGoals?.weeklyWorkouts || 3, 
      unit: 'sesiuni', 
      color: '#d946ef', 
      icon: Dumbbell 
    },
    { 
      label: 'Hidratare medie', 
      current: evolutionData ? Math.round(evolutionData.reduce((s: number, d: { water: number }) => s + d.water, 0) / 7 * 10) / 10 : 0, 
      target: userGoals?.water || 8, 
      unit: 'pahare/zi', 
      color: '#22d3ee', 
      icon: Droplets 
    },
    { 
      label: 'Streak', 
      current: streak || 0, 
      target: 7, 
      unit: 'zile', 
      color: '#a3e635', 
      icon: Zap 
    },
  ];

  // Heatmap mock
  const heatmapData: { date: string; intensity: number }[] = [];

  const containerVariants: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants: Variants = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 70, damping: 15 } } };

  return (
    <main className="h-full w-full p-4 lg:p-10 overflow-y-auto relative z-10 custom-scrollbar">

      {/* ── Atmospheric Glows ── */}
      <div className="fixed top-[10%] right-[5%] w-[45%] h-[45%] bg-fuchsia-600/8 rounded-full blur-[180px] pointer-events-none" />
      <div className="fixed bottom-[5%] left-[0%] w-[35%] h-[35%] bg-cyan-600/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed top-[50%] left-[30%] w-[20%] h-[20%] bg-orange-600/5 rounded-full blur-[120px] pointer-events-none" />
      <ParticleField />

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-6">

        {/* ── HEADER ── */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-black/50 border border-white/8 p-5 lg:p-7 rounded-[28px] backdrop-blur-2xl shadow-2xl"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Link href="/dashboard">
                  <motion.div whileHover={{ x: -3 }} className="p-1.5 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                    <ChevronLeft size={14} className="text-gray-400" />
                  </motion.div>
                </Link>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse shadow-[0_0_8px_#d946ef]" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Live Analytics</span>
                </div>
              </div>
              <h1 className="text-2xl lg:text-4xl font-black italic tracking-tighter text-white mt-1">
                Analiza <span className="text-fuchsia-400 drop-shadow-[0_0_20px_#d946ef]">Progresului</span>
              </h1>
              <p className="text-gray-500 text-sm mt-1">Evoluția ta din ultimele 7 zile — comparată, analizată, vizualizată.</p>
            </div>
            <QuickNavBar />
          </div>
        </motion.header>

        {/* ── ROW 1: Streak + Weekly Goals + Comparison ── */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* STREAK */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <div className="bg-gradient-to-br from-orange-500/15 to-red-900/10 border border-orange-500/25 p-7 rounded-[28px] backdrop-blur-xl relative overflow-hidden flex flex-col items-center text-center h-full shadow-[0_0_60px_rgba(249,115,22,0.08)] group">
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
                  {loading ? '-' : <AnimatedCounter value={streak || 0} />}
                </span>
                <span className="text-orange-400 font-bold text-lg ml-1">zile</span>
              </div>
              <div className="flex gap-1 mt-4 relative z-10">
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${i < (streak || 0) ? 'bg-orange-500 text-black shadow-[0_0_8px_#f97316]' : 'bg-white/5 text-gray-600'}`}>
                    {i < (streak || 0) ? '✓' : i + 1}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 font-medium mt-3 relative z-10">
                {(streak || 0) >= 7 ? '🔥 O săptămână perfectă!' : (streak || 0) > 0 ? 'Consistența este cheia!' : 'Începe azi!'}
              </p>
            </div>
          </motion.div>

          {/* WEEKLY GOALS */}
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

          {/* COMPARISON */}
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <div className="bg-black/40 border border-white/8 p-7 rounded-[28px] backdrop-blur-xl h-full flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-500/20 p-2 rounded-xl"><TrendingUp size={18} className="text-cyan-400" /></div>
                <h2 className="font-black text-white text-lg italic">Față de Săptămâna Trecută</h2>
              </div>
              <div className="grid grid-cols-1 gap-3 flex-1">
                <ComparisonStat label="Calorii Arse" current={weeklyBurned || 4200} previous={prevWeekBurned} unit="kcal" />
                <ComparisonStat label="Calorii Consumate" current={currWeekEaten} previous={prevWeekEaten} unit="kcal" />
                <ComparisonStat label="Streak" current={streak || 0} previous={Math.max((streak || 0) - 1, 0)} unit="zile" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ── ROW 2: Charts Tabs + Macros ── */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* CHART PANEL with TABS */}
          <motion.div variants={itemVariants} className="lg:col-span-8">
            <div className="bg-black/40 border border-white/8 p-7 rounded-[28px] backdrop-blur-xl">

              {/* Tab switcher */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h2 className="text-xl font-black italic flex items-center gap-2 text-white">
                  <BarChart2 className="text-fuchsia-500" /> Evoluție Grafică
                </h2>
                <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
                  {(['calorii', 'macros', 'hidratare'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${activeTab === tab ? 'bg-fuchsia-500 text-white shadow-[0_0_12px_#d946ef]' : 'text-gray-400 hover:text-white'}`}>
                      {tab === 'calorii' ? 'Calorii' : tab === 'macros' ? 'Macros' : 'Hidratare'}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">

                {/* TAB: CALORII */}
                {activeTab === 'calorii' && (
                  <motion.div key="calorii" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="flex gap-4 text-xs font-bold bg-white/5 px-4 py-2 rounded-xl border border-white/5 w-fit mb-6">
                      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-fuchsia-500 shadow-[0_0_8px_#d946ef]" /> Consumat</div>
                      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" /> Ars</div>
                    </div>
                    <div className="flex items-end justify-between gap-2 sm:gap-3 h-56 w-full relative">
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {[0, 1, 2, 3].map(i => <div key={i} className="border-b border-white/5 w-full" />)}
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
                              {/* Tooltip */}
                              <div className="absolute -top-20 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[#111] border border-white/10 p-3 rounded-2xl shadow-2xl z-20 pointer-events-none min-w-[110px]">
                                <div className="text-[10px] text-gray-500 font-bold mb-1">{isToday ? 'Azi' : item.zi}</div>
                                <div className="text-fuchsia-400 text-xs font-bold"><Utensils size={10} className="inline mr-1" />{item.eaten} kcal</div>
                                <div className="text-orange-400 text-xs font-bold"><Flame size={10} className="inline mr-1" />{item.burned} kcal</div>
                              </div>
                              <div className="w-full h-full flex items-end justify-center gap-1 relative z-10">
                                <div className="w-[45%] bg-white/3 rounded-t-xl relative overflow-hidden flex items-end h-full">
                                  <motion.div initial={{ height: 0 }} animate={{ height: `${eatenH}%` }} transition={{ duration: 1.5, type: 'spring', delay: i * 0.05 }}
                                    className="w-full rounded-t-xl bg-gradient-to-t from-fuchsia-900 via-fuchsia-600 to-fuchsia-400" />
                                </div>
                                <div className="w-[45%] bg-white/3 rounded-t-xl relative overflow-hidden flex items-end h-full">
                                  <motion.div initial={{ height: 0 }} animate={{ height: `${burnedH}%` }} transition={{ duration: 1.5, type: 'spring', delay: i * 0.05 + 0.1 }}
                                    className="w-full rounded-t-xl bg-gradient-to-t from-orange-900 via-orange-600 to-orange-400" />
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
                  <motion.div key="macros" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center justify-items-center h-56">
                      <MacroDonut protein={avgMacros.protein} carbs={avgMacros.carbs} fat={avgMacros.fat} />
                      <div className="sm:col-span-2 w-full flex flex-col gap-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Media zilnică a săptămânii</p>
                        {[
                          { label: 'Proteine', value: avgMacros.protein, target: 160, color: '#d946ef' },
                          { label: 'Carbohidrați', value: avgMacros.carbs, target: 250, color: '#22d3ee' },
                          { label: 'Grăsimi', value: avgMacros.fat, target: 70, color: '#f97316' },
                        ].map((m, i) => (
                          <div key={i} className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="font-bold" style={{ color: m.color }}>{m.label}</span>
                              <span className="text-gray-400 font-bold">{m.value}g <span className="text-gray-600">/ {m.target}g</span></span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div className="h-full rounded-full" style={{ backgroundColor: m.color, boxShadow: `0 0 8px ${m.color}` }}
                                initial={{ width: 0 }} animate={{ width: `${Math.min((m.value / m.target) * 100, 100)}%` }}
                                transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.1 }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB: HIDRATARE */}
                {activeTab === 'hidratare' && (
                  <motion.div key="hidratare" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="flex items-end justify-between h-56 w-full gap-2 relative">
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {[0, 1, 2, 3].map(i => <div key={i} className="border-b border-white/5 w-full" />)}
                      </div>
                      {!loading && evolutionData?.map((item: { zi: string; water: number }, i: number) => {
                        const waterH = Math.min((item.water / maxWater) * 100, 100);
                        const met = item.water >= maxWater;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full relative">
                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 text-xs font-bold text-cyan-300 transition-opacity">{item.water}/8</div>
                            <div className="flex-1 flex items-end w-full relative z-10">
                              <div className="w-full bg-white/3 rounded-t-2xl overflow-hidden flex items-end h-full">
                                <motion.div initial={{ height: 0 }} animate={{ height: `${waterH}%` }} transition={{ duration: 1.2, type: 'spring', delay: i * 0.06 }}
                                  className={`w-full rounded-t-2xl transition-all ${met ? 'bg-gradient-to-t from-cyan-900 to-cyan-400' : 'bg-gradient-to-t from-cyan-950 to-cyan-800/50'}`}
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
          </motion.div>

          {/* BADGES + WEEKLY BURNED */}
          <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col gap-6">

            {/* TOTAL ARSE */}
            <div className="bg-black/40 border border-fuchsia-500/15 p-6 rounded-[28px] backdrop-blur-xl group hover:border-fuchsia-500/30 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-600/10 blur-3xl rounded-full" />
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="bg-fuchsia-500/20 p-2 rounded-xl"><Flame size={16} className="text-fuchsia-400" /></div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Arse Ultimele 7 Zile</span>
              </div>
              <div className="relative z-10">
                <div className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_20px_#d946ef]">
                  {loading ? '...' : <AnimatedCounter value={weeklyBurned || 4200} />}
                </div>
                <div className="text-fuchsia-400 font-bold text-sm mt-1">kcal total</div>
              </div>
            </div>

            {/* BADGES */}
            <div className="bg-black/40 border border-white/8 p-6 rounded-[28px] backdrop-blur-xl flex-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-yellow-500/20 p-2 rounded-xl"><Award size={16} className="text-yellow-400" /></div>
                <h3 className="font-black text-white text-base italic">Trofee</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'titan', icon: Trophy, label: 'Titan de Fier', sub: '3 antren./săpt', unlocked: badges?.titan, color: '#eab308', glow: 'rgba(234,179,8,0.3)' },
                  { key: 'precizie', icon: Star, label: 'Precizie AI', sub: 'Streak 3+ zile', unlocked: badges?.precizie, color: '#d946ef', glow: 'rgba(217,70,239,0.3)' },
                  { key: 'hidro', icon: Droplets, label: 'Hidro Hero', sub: '7 zile la țintă', unlocked: false, color: '#22d3ee', glow: 'rgba(34,211,238,0.3)' },
                  { key: 'macro', icon: Activity, label: 'Macro Master', sub: 'Echilibru 3 zile', unlocked: false, color: '#f97316', glow: 'rgba(249,115,22,0.3)' },
                ].map(({ key, icon: Icon, label, sub, unlocked, color, glow }) => (
                  <motion.div key={key}
                    whileHover={unlocked ? { scale: 1.05 } : {}}
                    className={`p-4 rounded-2xl flex flex-col items-center text-center gap-2 transition-all border relative overflow-hidden
                      ${unlocked ? 'border-opacity-40 cursor-default' : 'bg-black/40 border-white/5 opacity-40 grayscale'}`}
                    style={unlocked ? { borderColor: color, background: `radial-gradient(circle at top, ${glow}, transparent 70%)` } : {}}
                  >
                    {unlocked && (
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
                    )}
                    <Icon size={26} style={unlocked ? { color, filter: `drop-shadow(0 0 10px ${color})` } : { color: '#4b5563' }} />
                    <div>
                      <span className="font-bold text-xs text-white block leading-tight">{label}</span>
                      <span className="text-[10px] text-gray-500">{sub}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ── ROW 3: Heatmap Calendar ── */}
        <motion.div variants={itemVariants} initial="hidden" animate="show">
          <div className="bg-black/40 border border-white/8 p-7 rounded-[28px] backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-black italic flex items-center gap-2 text-white">
                <Calendar className="text-fuchsia-500" /> Calendar Activitate
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                <span>Mai puțin</span>
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-3 h-3 rounded-sm ${['bg-white/5', 'bg-fuchsia-900/60', 'bg-fuchsia-700/70', 'bg-fuchsia-500/80', 'bg-fuchsia-400'][i]}`} />
                ))}
                <span>Mai mult</span>
              </div>
            </div>
            <ActivityHeatmap data={heatmapData} />
          </div>
        </motion.div>

        {/* ── ROW 4: Quick Actions to other pages ── */}
        <motion.div variants={itemVariants} initial="hidden" animate="show">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: '/dashboard/nutritie', icon: Apple, label: 'Adaugă Masă', sub: 'Înregistrează ce ai mâncat', color: '#22d3ee', bg: 'from-cyan-500/10 to-cyan-900/5', border: 'border-cyan-500/20' },
              { href: '/dashboard/antrenamente', icon: Dumbbell, label: 'Log Antrenament', sub: 'Salvează sesiunea de azi', color: '#f97316', bg: 'from-orange-500/10 to-orange-900/5', border: 'border-orange-500/20' },
              { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', sub: 'Vizualizare generală', color: '#d946ef', bg: 'from-fuchsia-500/10 to-fuchsia-900/5', border: 'border-fuchsia-500/20' },
              { href: '/dashboard/setari', icon: User, label: 'Setează Obiective', sub: 'Personalizează-ți țintele', color: '#a3e635', bg: 'from-lime-500/10 to-lime-900/5', border: 'border-lime-500/20' },
            ].map(({ href, icon: Icon, label, sub, color, bg, border }) => (
              <Link key={href} href={href}>
                <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className={`bg-gradient-to-br ${bg} border ${border} p-5 rounded-[24px] backdrop-blur-xl cursor-pointer group transition-all hover:shadow-lg`}>
                  <Icon size={20} style={{ color }} className="mb-3" />
                  <div className="font-black text-sm text-white group-hover:text-white transition-colors">{label}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{sub}</div>
                  <ChevronRight size={14} style={{ color }} className="mt-3 group-hover:translate-x-1 transition-transform" />
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

      </div>
    </main>
  );
}