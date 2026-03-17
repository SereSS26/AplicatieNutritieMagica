'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import { supabase } from '@/src/lib/supabase';
import { HealthAnalysis } from '@/src/types';
import HealthModal from '@/src/components/modals/HealthModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Activity, Sparkles, BrainCircuit } from 'lucide-react';

export default function SanatatePage() {
  const { userId } = useAuth();
  const [history, setHistory] = useState<HealthAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<HealthAnalysis | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  const fetchHistory = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('health_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('analysis_date', { ascending: true });

    if (data && !error) {
      setHistory(data as HealthAnalysis[]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    if (!userId) {
      alert("Eroare: Utilizatorul nu a fost complet încărcat. Așteaptă o secundă și reîncearcă!");
      return;
    }
    
    setLoading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    
    const previousScore = history.length > 0 ? history[history.length - 1].general_score.toString() : '';
    if (previousScore) formData.append('previousScore', previousScore);

    // Extragem parametrii anteriori pentru comparație AI detaliată per-analiză
    const previousParams = history.length > 0 ? JSON.stringify(history[history.length - 1].parameters_details) : '';
    if (previousParams) formData.append('previousParams', previousParams);

    try {
      const response = await fetch('/api/analyze-health', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Eroare server (${response.status}): ${errText}`);
      }

      const result = await response.json();
      if (result.success) {
        await fetchHistory(); // Reîncărcăm datele pentru a actualiza graficul
        alert('Analizele au fost trimise cu succes!');
      } else {
        alert('Eroare la procesare: ' + result.error);
      }
    } catch (error) {
      console.error(error);
      const err = error as Error;
      alert(`A apărut o eroare: ${err.message}`);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleDotClick = (data: any) => {
    setSelectedAnalysis(data.payload);
    setIsModalOpen(true);
  };

  const handleDeleteAnalysis = async (id: string) => {
    if (!confirm('Ești sigur că vrei să ștergi această analiză? Această acțiune este ireversibilă.')) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('health_analyses').delete().eq('id', id);
      if (error) throw error;
      
      await fetchHistory();
      setIsModalOpen(false);
      setSelectedAnalysis(null);
    } catch (error) {
      console.error(error);
      alert('A apărut o eroare la ștergerea analizei.');
    } finally {
      setIsDeleting(false);
    }
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    let fill = "#d946ef"; 
    
    if (payload.evolution_status === 'imbunatatire') fill = "#10b981"; 
    if (payload.evolution_status === 'inrautatire') fill = "#ef4444"; 

    return (
      <circle 
        cx={cx} cy={cy} r={6} fill={fill} stroke="#0a0a0a" strokeWidth={3} 
        onClick={() => handleDotClick(props)} 
        className="cursor-pointer hover:r-8 transition-all duration-200"
      />
    );
  };

  const chartData = history.map(item => ({
    ...item,
    formattedDate: new Date(item.analysis_date).toLocaleDateString('ro-RO', { month: 'short', day: 'numeric' })
  }));

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-8 text-white relative z-10">
      
      {/* ── HEADER SPECTACULOS ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative rounded-[32px] p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-2xl overflow-hidden group"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-600/10 blur-[100px] rounded-full pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50" />
        
        <div className="relative p-8 lg:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="relative z-10 w-full max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse shadow-[0_0_12px_#d946ef]" />
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.25em]">Motor AI de Analiză</span>
            </div>
            
            {/* AICI ESTE REPARAȚIA: pr-2 la Sănătate */}
            <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400">
              Evoluție <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-500 drop-shadow-[0_0_30px_rgba(217,70,239,0.3)] pr-2">Sănătate</span>
            </h1>
            
            {/* PANELUL PREMIUM */}
            <div className="mt-8 flex items-start sm:items-center gap-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden group/panel transition-all hover:border-fuchsia-500/30 hover:shadow-[0_8px_30px_rgba(217,70,239,0.15)]">
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-transparent pointer-events-none opacity-50 group-hover/panel:opacity-100 transition-opacity" />
              
              <div className="bg-fuchsia-500/20 p-2.5 rounded-xl border border-fuchsia-500/30 shrink-0 relative z-10 shadow-[inset_0_0_15px_rgba(217,70,239,0.2)]">
                <Sparkles size={22} className="text-fuchsia-400" />
              </div>
              
              <p className="text-gray-300 font-medium text-sm sm:text-base leading-relaxed relative z-10">
                Încarcă analizele medicale și lasă <span className="text-white font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">inteligența artificială</span> să interpreteze datele, să facă predicții și să îți urmărească progresul în <span className="inline-block mt-1 sm:mt-0 text-fuchsia-400 font-black uppercase tracking-widest text-[10px] sm:text-xs sm:mx-1 bg-fuchsia-500/10 px-2.5 py-1 rounded-lg border border-fuchsia-500/20 shadow-[0_0_10px_rgba(217,70,239,0.2)]">Timp Real</span>.
              </p>
            </div>

          </div>

          <div className="hidden md:flex bg-fuchsia-500/10 p-5 rounded-3xl border border-fuchsia-500/20 shadow-[inset_0_0_20px_rgba(217,70,239,0.1)] group-hover:scale-105 transition-transform duration-500 shrink-0">
            <Activity size={40} className="text-fuchsia-400" />
          </div>
        </div>
      </motion.header>

      {/* ── Secțiunea de Încărcare (Glassmorphism) ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-[#0a0a0a]/60 backdrop-blur-3xl p-10 rounded-3xl border border-white/5 shadow-2xl flex flex-col items-center justify-center gap-6 relative overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-fuchsia-600/10 blur-[100px] pointer-events-none" />
        
        <label className="cursor-pointer bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_40px_rgba(217,70,239,0.5)] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-wider text-sm transition-all duration-300 relative z-10 text-center hover:-translate-y-1">
          {loading ? 'Se analizează documentul...' : 'Încarcă Analize Noi (Imagine / PDF)'}
          <input 
            type="file" 
            accept="image/*,application/pdf" 
            onChange={handleFileUpload} 
            className="hidden" 
            disabled={loading}
          />
        </label>
        
        <div className="mt-2 flex items-center gap-3 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl shadow-lg relative overflow-hidden group/upload transition-all hover:border-fuchsia-500/30">
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-transparent pointer-events-none opacity-50 group-hover/upload:opacity-100 transition-opacity" />
          
          <div className="bg-fuchsia-500/20 p-2 rounded-xl border border-fuchsia-500/30 shrink-0 relative z-10">
            <BrainCircuit size={18} className="text-fuchsia-400" />
          </div>
          
          <p className="text-gray-300 font-medium text-xs sm:text-sm relative z-10">
            <span className="text-white font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">Inteligența artificială</span> va extrage și interpreta automat rezultatele.
          </p>
        </div>

      </motion.div>

      {history.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-[#0a0a0a]/60 backdrop-blur-3xl p-6 lg:p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="text-xl font-bold text-white tracking-wide">
              Grafic Scenariu General
            </h2>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
               <span className="w-2 h-2 rounded-full bg-fuchsia-500" />
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Apasă pe puncte pentru detalii</span>
            </div>
          </div>

          <div className="h-96 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="formattedDate" allowDuplicatedCategory={true} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dy={15} />
                <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#d946ef', fontWeight: 'bold' }}
                  labelStyle={{ color: '#9ca3af', marginBottom: '8px', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="general_score" 
                  stroke="#ffffff20" 
                  strokeWidth={3}
                  dot={<CustomDot />}
                  activeDot={<CustomDot r={8} />}
                  name="Scor Sănătate"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <HealthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={selectedAnalysis} 
        onDelete={handleDeleteAnalysis}
        isDeleting={isDeleting}
      />
    </div>
  );
}