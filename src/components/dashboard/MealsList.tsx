"use client";

import React, { useState } from 'react';
import { Meal } from '@/src/types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, Pencil, Check, X, Flame, Beef, 
  Utensils, Plus, Clock 
} from 'lucide-react';
import { useDashboardContext } from '@/src/context/DashboardContext';

type MealsListProps = {
  meals: Meal[];
  loading: boolean;
  onAddClick: () => void;
  variants?: any;
};

export default function MealsList({ meals, loading, onAddClick, variants }: MealsListProps) {
  const { dailyStats } = useDashboardContext();
  const { deleteMeal, editMeal } = dailyStats; 
  
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Stări pentru Editare
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCals, setEditCals] = useState('');
  const [editProtein, setEditProtein] = useState('');

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteMeal(id);
    setDeletingId(null);
  };

  const startEditing = (meal: Meal) => {
    setEditingId(meal.id);
    setEditName(meal.name);
    setEditCals(meal.calories.toString());
    setEditProtein((meal.protein || 0).toString());
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName || !editCals) return;
    await editMeal(id, editName, parseInt(editCals), parseInt(editProtein) || 0);
    setEditingId(null);
  };

  return (
    <motion.div 
      variants={variants} 
      className="bg-[#050505]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 sm:p-8 flex flex-col h-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden"
    >
      {/* Glow de fundal */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[50%] bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Premium */}
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-fuchsia-500/20 text-fuchsia-400 rounded-xl border border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.2)]">
            <Utensils size={20} />
          </div>
          <div>
            <h3 className="text-2xl font-black italic tracking-tight text-white">Mesele de Azi</h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Jurnal Nutrițional</p>
          </div>
        </div>
        
        {/* Badge cu numărul de mese */}
        {!loading && (
          <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-bold text-gray-300">
            {meals.length} {meals.length === 1 ? 'masă' : 'mese'}
          </div>
        )}
      </div>
      
      {/* Container Listă cu Efect de Timeline */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-fuchsia-500/50 animate-pulse gap-3">
            <Utensils size={32} />
            <p className="text-sm font-bold uppercase tracking-widest">Se încarcă...</p>
          </div>
        ) : meals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4 text-gray-600">
              <Utensils size={24} />
            </div>
            <p className="text-gray-400 font-medium text-sm">Nu ai adăugat nicio masă încă.</p>
            <p className="text-gray-600 text-xs mt-1">Orice campion are nevoie de combustibil!</p>
          </div>
        ) : (
          <div className="space-y-4 relative">
            {/* Linia de Timeline din spate */}
            <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gradient-to-b from-fuchsia-500/50 via-white/10 to-transparent" />

            <AnimatePresence>
              {meals.map((meal) => {
                const timeString = meal.created_at 
                    ? new Date(meal.created_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
                    : new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
                    
                const isEditing = editingId === meal.id;

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    key={meal.id} 
                    className="relative pl-10 group"
                  >
                    {/* Punctul de pe Timeline */}
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.8)] group-hover:scale-150 transition-transform duration-300" />

                    {isEditing ? (
                      /* --- MODUL DE EDITARE ULTRA-MODERN --- */
                      <div className="bg-[#0a0a0a] border border-fuchsia-500/50 rounded-2xl p-4 flex flex-col gap-3 shadow-[0_0_20px_rgba(217,70,239,0.15)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-fuchsia-500" />
                        
                        <input 
                          type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-fuchsia-500 transition-colors" placeholder="Ex: Pui cu orez"
                        />
                        <div className="flex gap-2">
                          <div className="relative w-full">
                            <Flame size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" />
                            <input 
                              type="number" value={editCals} onChange={(e) => setEditCals(e.target.value)}
                              className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white w-full focus:outline-none focus:border-orange-500 transition-colors" placeholder="Kcal"
                            />
                          </div>
                          <div className="relative w-full">
                            <Beef size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                            <input 
                              type="number" value={editProtein} onChange={(e) => setEditProtein(e.target.value)}
                              className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white w-full focus:outline-none focus:border-blue-500 transition-colors" placeholder="Proteine (g)"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-1">
                          <button onClick={() => setEditingId(null)} className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-gray-400 font-bold text-xs uppercase tracking-wider transition-all">Anulează</button>
                          <button onClick={() => handleSaveEdit(meal.id)} className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-1"><Check size={14}/> Salvează</button>
                        </div>
                      </div>
                    ) : (
                      /* --- MODUL DE VIZUALIZARE CARD PREMIUM --- */
                      <div className="bg-white/[0.03] border border-white/[0.05] hover:border-fuchsia-500/30 hover:bg-white/[0.06] rounded-2xl p-4 flex items-center justify-between transition-all duration-300 backdrop-blur-md group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] group-hover:-translate-y-0.5">
                        
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-bold text-base">{meal.name}</h4>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-full"><Clock size={10}/> {timeString}</span>
                          </div>
                          
                          {/* Badge-uri cu Macros */}
                          <div className="flex gap-2">
                            <span className="flex items-center gap-1 text-[11px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-lg">
                              <Flame size={12} /> {meal.calories} kcal
                            </span>
                            {meal.protein > 0 && (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg">
                                <Beef size={12} /> {meal.protein}g proteină
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Butoanele Edit & Delete (Apar la hover) */}
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button onClick={() => startEditing(meal)} className="p-2.5 bg-white/5 border border-white/10 text-gray-400 hover:text-fuchsia-400 hover:bg-fuchsia-500/20 hover:border-fuchsia-500/50 rounded-xl transition-all shadow-sm">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(meal.id)} disabled={deletingId === meal.id} className="p-2.5 bg-white/5 border border-white/10 text-gray-400 hover:text-red-500 hover:bg-red-500/20 hover:border-red-500/50 rounded-xl transition-all disabled:opacity-50 shadow-sm">
                            <Trash2 size={14} className={deletingId === meal.id ? "animate-spin text-red-500" : ""} />
                          </button>
                        </div>

                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
      
      {/* Buton Adăugare Premium */}
      <button 
        onClick={onAddClick}
        className="group w-full mt-6 flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-dashed border-white/10 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/10 transition-all duration-300 relative z-10"
      >
        <div className="bg-white/5 group-hover:bg-fuchsia-500 p-1.5 rounded-full transition-colors duration-300">
          <Plus size={18} className="text-gray-400 group-hover:text-white transition-colors" />
        </div>
        <span className="font-bold text-sm tracking-wide text-gray-400 group-hover:text-white transition-colors uppercase">
          Adaugă o Masă Nouă
        </span>
      </button>

    </motion.div>
  );
}