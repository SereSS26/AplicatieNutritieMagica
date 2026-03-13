"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flame, Utensils, Droplets, Activity, X } from 'lucide-react';

type DayStats = {
  eaten: number;
  burned: number;
  protein: number;
  water: number;
};

export default function FitnessCalendar() {
  const { userId } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyData, setDailyData] = useState<Record<string, DayStats>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<{ date: string; stats: DayStats } | null>(null);

  useEffect(() => {
    if (!userId) return;
    fetchMonthData();
  }, [userId, currentDate]);

  const fetchMonthData = async () => {
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

    // --- INTEGRARE DATE LOCALE (DEMO) ---
    // Citim și datele salvate local (pentru când baza de date nu merge)
    const localExercises = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('demo_exercises') || '[]') : [];
    localExercises.forEach((e: any) => {
      // Verificăm dacă antrenamentul e din luna curentă ȘI aparține utilizatorului logat
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
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  return (
    <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-md relative">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold italic">Calendar Activitate</h3>
        <div className="flex gap-2">
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><ChevronLeft size={20}/></button>
          <span className="font-bold min-w-[120px] text-center capitalize">
            {currentDate.toLocaleString('ro-RO', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><ChevronRight size={20}/></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'].map(d => (
          <div key={d} className="text-center text-[10px] font-black text-gray-500 uppercase mb-2">{d}</div>
        ))}
        
        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
        
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const data = dailyData[dateStr] || { eaten: 0, burned: 0, protein: 0, water: 0 };
          const hasData = data.eaten > 0 || data.burned > 0 || data.water > 0;

          return (
            <motion.div 
              key={day} 
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedDay({ date: dateStr, stats: data })}
              className={`aspect-square border rounded-2xl p-2 flex flex-col justify-between transition-all cursor-pointer group relative overflow-hidden ${
                hasData ? 'border-fuchsia-500/30 bg-white/5' : 'border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">{day}</span>
                {data.water > 0 && <Droplets size={10} className="text-cyan-500" />}
              </div>
              
              {hasData && (
                <div className="flex flex-col gap-0.5 mt-auto items-end">
                  {/* Textul cu calorii arse vizibil direct pe calendar */}
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
              <button onClick={() => setSelectedDay(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
              
              <div className="mb-8">
                <p className="text-fuchsia-500 font-mono text-xs tracking-widest uppercase mb-1">Sumar Zilnic</p>
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

                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                  <span className="text-gray-400 text-sm flex items-center gap-2"><Droplets size={16} className="text-cyan-500"/> Hidratare</span>
                  <span className="font-bold text-lg">{selectedDay.stats.water} pahare</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}