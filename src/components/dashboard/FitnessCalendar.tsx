"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
// AM ADĂUGAT CheckCircle și Award din lucide-react
import { ChevronLeft, ChevronRight, Flame, Utensils, Droplets, Activity, X, CheckCircle, Award, Loader2 } from 'lucide-react';

type DayStats = {
  eaten: number;
  burned: number;
  protein: number;
  water: number;
};

interface LocalExercise {
  user_id: string;
  date: string;
  calories_burned: number;
}

export default function FitnessCalendar() {
  const { userId } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyData, setDailyData] = useState<Record<string, DayStats>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<{ date: string; stats: DayStats } | null>(null);

  const fetchMonthData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

    const { data: meals } = await supabase.from('meals').select('date, calories, protein').eq('user_id', userId).gte('date', startOfMonth).lte('date', endOfMonth);
    const { data: exercises } = await supabase.from('exercises').select('date, calories_burned').eq('user_id', userId).gte('date', startOfMonth).lte('date', endOfMonth);
    const { data: waterStats } = await supabase.from('daily_stats').select('date, water_glasses').eq('user_id', userId).gte('date', startOfMonth).lte('date', endOfMonth);

    const stats: Record<string, DayStats> = {};

    meals?.forEach(m => {
      if (!stats[m.date]) stats[m.date] = { eaten: 0, burned: 0, protein: 0, water: 0 };
      stats[m.date].eaten += m.calories;
      stats[m.date].protein += (m.protein || 0);
    });

    const localExercises = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('demo_exercises') || '[]') : [];
    localExercises.forEach((e: LocalExercise) => {
      if (e.user_id === userId && e.date >= startOfMonth && e.date <= endOfMonth) {
        if (!stats[e.date]) stats[e.date] = { eaten: 0, burned: 0, protein: 0, water: 0 };
        stats[e.date].burned += (e.calories_burned || 0);
      }
    });

    exercises?.forEach(e => {
      if (!stats[e.date]) stats[e.date] = { eaten: 0, burned: 0, protein: 0, water: 0 };
      stats[e.date].burned += (e.calories_burned || 0);
    });

    waterStats?.forEach(w => {
      if (!stats[w.date]) stats[w.date] = { eaten: 0, burned: 0, protein: 0, water: 0 };
      stats[w.date].water = w.water_glasses;
    });

    setDailyData(stats);
    setLoading(false);
  }, [userId, currentDate]);

  useEffect(() => {
    fetchMonthData();
  }, [fetchMonthData]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  return (
    <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-md relative h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold italic">Calendar Activitate</h3>
          {loading && <Loader2 className="animate-spin text-fuchsia-500" size={16} />}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><ChevronLeft size={20}/></button>
          <span className="font-bold min-w-[120px] text-center capitalize">
            {currentDate.toLocaleString('ro-RO', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><ChevronRight size={20}/></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 flex-1">
        {['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'].map(d => (
          <div key={d} className="text-center text-[10px] font-black text-gray-500 uppercase mb-2">{d}</div>
        ))}
        
        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
        
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const data = dailyData[dateStr] || { eaten: 0, burned: 0, protein: 0, water: 0 };
          const hasData = data.eaten > 0 || data.burned > 0 || data.water > 0;
          
          // LOGICA PENTRU ZIUA PERFECTĂ: Are 8 pahare de apă și a făcut sport!
          const isTargetMet = data.water >= 8 && data.burned > 0;

          return (
            <motion.div 
              key={day} 
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedDay({ date: dateStr, stats: data })}
              className={`aspect-square border rounded-2xl p-2 flex flex-col justify-between transition-all cursor-pointer group relative overflow-hidden ${
                isTargetMet 
                  ? 'border-lime-500/50 bg-lime-500/10 shadow-[0_0_15px_rgba(132,204,22,0.15)]' // Verde pt target atins
                  : hasData 
                    ? 'border-fuchsia-500/30 bg-fuchsia-500/5' // Mov pt activitate parțială
                    : 'border-white/5 hover:border-white/20' // Gri pentru gol
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-xs font-bold transition-colors ${isTargetMet ? 'text-lime-400' : 'text-gray-400 group-hover:text-white'}`}>
                  {day}
                </span>
                
                {/* AFIȘĂM BIFA VERDE DACĂ TARGETUL E ATINS, ALTFEL AFIȘĂM DOAR PICĂTURA DE APĂ */}
                {isTargetMet ? (
                  <CheckCircle size={14} className="text-lime-500 drop-shadow-md" />
                ) : (
                  data.water > 0 && <Droplets size={10} className="text-cyan-500" />
                )}
              </div>
              
              {hasData && !isTargetMet && (
                <div className="flex flex-col gap-0.5 mt-auto items-end">
                  {data.burned > 0 && (
                    <span className="text-[10px] text-orange-400 font-bold flex items-center gap-1 leading-none">
                      -{data.burned} <Flame size={8} />
                    </span>
                  )}
                  {data.eaten > 0 && (
                    <span className="text-[10px] text-fuchsia-400 font-bold flex items-center gap-1 leading-none">
                      +{data.eaten} <Utensils size={8} />
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedDay && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setSelectedDay(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-[32px] p-8 w-full max-w-md relative shadow-[0_0_50px_rgba(0,0,0,0.8)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setSelectedDay(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-50">
                <X size={24} />
              </button>
              
              {/* RECOMPENSA VIZUALĂ ÎN MODAL PENTRU TARGET ATINS */}
              {selectedDay.stats.water >= 8 && selectedDay.stats.burned > 0 && (
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }} 
                  animate={{ scale: 1, rotate: 0 }} 
                  transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                  className="absolute -top-12 -right-6 bg-gradient-to-br from-lime-400 to-green-600 p-4 rounded-full shadow-[0_0_30px_rgba(132,204,22,0.5)] border-4 border-[#0a0a0a] z-50"
                >
                  <Award size={40} className="text-black" />
                </motion.div>
              )}

              <div className="mb-8">
                <p className="text-fuchsia-500 font-mono text-xs tracking-widest uppercase mb-1">
                  {selectedDay.stats.water >= 8 && selectedDay.stats.burned > 0 ? '✨ Zi Perfectă!' : 'Sumar Zilnic'}
                </p>
                <h2 className="text-3xl font-black italic">{new Date(selectedDay.date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })}</h2>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400 text-sm flex items-center gap-2"><Flame size={16} className="text-orange-500"/> Balanță Calorii</span>
                    <div className="text-right">
                       <span className="font-bold text-xl">{selectedDay.stats.eaten - selectedDay.stats.burned}</span>
                       <span className="text-xs text-gray-500 ml-1">kcal net</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-fuchsia-500/10 text-fuchsia-400 p-2 rounded-xl text-center font-bold">Consum: +{selectedDay.stats.eaten}</div>
                    <div className="bg-orange-500/10 text-orange-400 p-2 rounded-xl text-center font-bold">Arse: -{selectedDay.stats.burned}</div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                  <span className="text-gray-400 text-sm flex items-center gap-2"><Activity size={16} className="text-blue-500"/> Proteine</span>
                  <span className="font-bold text-lg">{selectedDay.stats.protein} g</span>
                </div>

                <div className={`border p-4 rounded-2xl flex justify-between items-center transition-colors ${selectedDay.stats.water >= 8 ? 'bg-lime-500/10 border-lime-500/30' : 'bg-white/5 border-white/5'}`}>
                  <span className="text-gray-400 text-sm flex items-center gap-2"><Droplets size={16} className="text-cyan-500"/> Hidratare</span>
                  <span className={`font-bold text-lg ${selectedDay.stats.water >= 8 ? 'text-lime-400' : 'text-white'}`}>
                    {selectedDay.stats.water} pahare
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}