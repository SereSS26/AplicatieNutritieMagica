"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Flame, Plus, Sparkles, HeartPulse, Loader2 } from 'lucide-react';
import { useAuth } from '@/src/hooks/useAuth';
import { supabase } from '@/src/lib/supabase';
import { HealthParameter } from '@/src/types';

// Tipul de date pentru Mese
type Meal = {
  id: string;
  name: string;
  calories: number;
  protein: number;
};

// Interfața cu toate proprietățile și funcțiile primite de la pagina principală
interface CalorieModalProps {
  isOpen: boolean;
  onClose: () => void;
  meals: Meal[];
  newMealName: string;
  setNewMealName: (name: string) => void;
  newMealCalories: string;
  setNewMealCalories: (calories: string) => void;
  newMealProtein: string;
  setNewMealProtein: (protein: string) => void;
  isSavingMeal: boolean;
  handleAddMeal: (e: React.FormEvent) => void;
}

export default function CalorieModal({
  isOpen,
  onClose,
  meals,
  newMealName,
  setNewMealName,
  newMealCalories,
  setNewMealCalories,
  newMealProtein,
  setNewMealProtein,
  isSavingMeal,
  handleAddMeal
}: CalorieModalProps) {
  
  // Stare pentru a ști când AI-ul încarcă răspunsul
  const [isEstimating, setIsEstimating] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  
  const [healthAlerts, setHealthAlerts] = useState<HealthParameter[]>([]);
  const { userId } = useAuth();

  // Extragem analizele cu probleme imediat ce deschidem Jurnalul
  React.useEffect(() => {
    if (isOpen && userId) {
      const fetchAlerts = async () => {
        const { data } = await supabase
          .from('health_analyses')
          .select('parameters_details')
          .eq('user_id', userId)
          .order('analysis_date', { ascending: false })
          .limit(1)
          .single();
        if (data && data.parameters_details) {
          const bad = data.parameters_details.filter((p: any) => p.status === 'scazut' || p.status === 'ridicat');
          setHealthAlerts(bad);
        }
      };
      fetchAlerts();
    }
  }, [isOpen, userId]);

  // Funcția care apelează API-ul nostru de nutriție cu Gemini
  const estimateWithAI = async () => {
    if (!newMealName) {
      alert("Scrie mai întâi ce ai mâncat (ex: Shaorma medie)!");
      return;
    }

    setIsEstimating(true);
    try {
      const res = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ food: newMealName }),
      });

      if (!res.ok) throw new Error("Eroare la conectarea cu AI-ul");

      const data = await res.json();
      
      // Dacă AI-ul a găsit datele, le completăm automat în input-uri
      if (data.calories) setNewMealCalories(data.calories.toString());
      if (data.protein) setNewMealProtein(data.protein.toString());
      
    } catch (error) {
      console.error(error);
      alert("Pika-eroare! Nu am putut estima. Te rog introdu manual.");
    } finally {
      setIsEstimating(false);
    }
  };

  // Funcția care generează o masă bazată pe analizele proaste
  const generateHealthRecommendation = async () => {
    if (!userId) {
      alert("Trebuie să fii logat pentru a folosi această funcție.");
      return;
    }
    setIsRecommending(true);
    setAiExplanation('');
    try {
      const res = await fetch('/api/recommend-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success && data.meal) {
        setNewMealName(data.meal.name);
        setNewMealCalories(data.meal.calories.toString());
        setNewMealProtein(data.meal.protein.toString());
        setAiExplanation(data.meal.explanation);
      } else {
        alert('Eroare la generare: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('A apărut o eroare de conexiune cu AI-ul medical.');
    } finally {
      setIsRecommending(false);
    }
  };

  // Dacă modalul nu este deschis, nu afișăm nimic
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-lg relative shadow-[0_0_40px_rgba(217,70,239,0.15)] max-h-[90vh] overflow-y-auto"
      >
        {/* Butonul de închidere (X) */}
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold mb-2 text-white flex items-center gap-3">
          <div className="bg-fuchsia-600/20 p-2 rounded-xl">
            <Flame className="text-fuchsia-500" size={24} />
          </div>
          Jurnal Alimentar
        </h2>
        <p className="text-gray-400 text-sm mb-6">Adaugă mesele manual sau folosește AI-ul pentru a le estima.</p>

        {/* BANNERE MEDICALE AUTOMATE - BAZATE PE ANALIZE */}
        {healthAlerts.length > 0 && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col gap-2 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <span className="flex items-center gap-2 text-red-400 font-black text-xs uppercase tracking-widest">
              <HeartPulse size={14} className="animate-pulse" /> Profil Medical Activ
            </span>
            <p className="text-gray-300 text-xs font-medium leading-relaxed">
              AI-ul va evita automat alimentele dăunătoare și va adapta sugestiile pentru:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {healthAlerts.map((param, i) => (
                <span key={i} className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${param.status === 'ridicat' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'}`}>
                  {param.nume}: {param.status === 'ridicat' ? '↑ Ridicat' : '↓ Scăzut'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* FORMULAR ADĂUGARE MASĂ */}
        <form onSubmit={handleAddMeal} className="flex flex-col gap-3 mb-6">
          
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ex: 2 ouă ochiuri cu avocado" 
              value={newMealName} 
              onChange={(e) => setNewMealName(e.target.value)} 
              required
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-500 transition-colors text-white"
            />
            {/* Butonul Magic de AI */}
            <button 
              type="button" 
              onClick={estimateWithAI} 
              disabled={isEstimating || !newMealName}
              title="Estimează cu AI"
              className="bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/30 w-12 rounded-xl hover:bg-fuchsia-600/40 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
            >
              {isEstimating ? <span className="animate-spin text-lg">⏳</span> : <Sparkles size={20} />}
            </button>
          </div>

          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="Kcal" 
              value={newMealCalories} 
              onChange={(e) => setNewMealCalories(e.target.value)} 
              required min="1"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-fuchsia-500 transition-colors text-white text-center"
            />
            <input 
              type="number" 
              placeholder="Prot(g)" 
              value={newMealProtein} 
              onChange={(e) => setNewMealProtein(e.target.value)} 
              required min="0"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white text-center"
            />
            <button 
              type="submit" 
              disabled={isSavingMeal} 
              className="bg-fuchsia-600 text-white px-6 py-3 rounded-xl hover:bg-fuchsia-500 transition-colors disabled:opacity-50 font-bold flex items-center justify-center shrink-0"
            >
              <Plus size={20} />
            </button>
          </div>
        </form>

        {/* Buton Nou - Recomandare bazată pe Analize */}
        <div className="mb-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={generateHealthRecommendation}
            disabled={isRecommending || isSavingMeal}
            className="w-full bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/30 text-emerald-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 tracking-wide text-sm shadow-[0_0_15px_rgba(16,185,129,0.1)]"
          >
            {isRecommending ? <Loader2 size={18} className="animate-spin" /> : <HeartPulse size={18} />}
            {isRecommending ? 'Se analizează profilul tău de sănătate...' : 'Recomandă-mi o masă pentru a-mi regla analizele'}
          </button>

          {aiExplanation && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-100 text-sm shadow-[0_0_15px_rgba(16,185,129,0.1)] leading-relaxed">
              <span className="font-black text-emerald-400 block mb-1 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                <HeartPulse size={12} /> Recomandare Medicală AI
              </span>
              {aiExplanation}
            </motion.div>
          )}
        </div>

        {/* LISTA DE MESE DE AZI */}
        <div className="space-y-3 mb-6">
          {meals.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-4">Nu ai adăugat nicio masă încă azi.</p>
          ) : (
            meals.map((meal) => (
              <div key={meal.id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-white/5 border border-white/5 p-4 rounded-xl gap-2">
                <span className="text-white font-medium">{meal.name}</span>
                <div className="flex gap-2">
                  <span className="font-bold text-fuchsia-400 bg-fuchsia-500/10 px-3 py-1 rounded-lg text-sm">{meal.calories} kcal</span>
                  <span className="font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg text-sm">{meal.protein}g prot</span>
                </div>
              </div>
            ))
          )}
        </div>
        
      </motion.div>
    </motion.div>
  );
}