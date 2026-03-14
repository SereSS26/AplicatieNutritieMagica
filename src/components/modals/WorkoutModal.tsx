"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Dumbbell, Flame, Trash2 } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  calories_burned: number;
}

interface WorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  burnedCalories: number;
  exercises: Exercise[];
  deleteExercise?: (id: string) => Promise<boolean>; // Adăugăm funcția aici ca prop!
}

export default function WorkoutModal({ isOpen, onClose, burnedCalories, exercises, deleteExercise }: WorkoutModalProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!deleteExercise) return; // Dacă vizitatorul nu e logat, nu face nimic
    
    setIsDeleting(id);
    await deleteExercise(id);
    setIsDeleting(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }} 
        animate={{ scale: 1, y: 0 }} 
        exit={{ scale: 0.95, y: 20 }}
        className="bg-[#0a0a0a] border border-white/10 rounded-[32px] p-6 sm:p-8 w-full max-w-md relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Portocaliu */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-orange-500/20 rounded-full blur-[80px] pointer-events-none" />

        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-10">
          <X size={24} />
        </button>

        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="p-3 bg-orange-500/20 text-orange-400 rounded-2xl border border-orange-500/30">
            <Dumbbell size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter text-white">Antrenamentele Tale</h2>
            <p className="text-sm text-gray-400 mt-1">Total azi: <span className="text-orange-400 font-bold">{burnedCalories} kcal arse</span></p>
          </div>
        </div>

        {/* Lista cu Exerciții (cu buton de Delete) */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar relative z-10 pr-2">
          {exercises && exercises.length > 0 ? (
            exercises.map((ex) => (
              <div key={ex.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center group hover:bg-white/10 hover:border-orange-500/30 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 group-hover:scale-150 transition-transform" />
                  <span className="font-bold text-white group-hover:text-orange-400 transition-colors">{ex.name}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-xl font-bold text-sm">
                    <Flame size={14} />
                    -{ex.calories_burned}
                  </div>
                  
                  {/* Butonul de Ștergere */}
                  <button 
                    onClick={(e) => handleDelete(ex.id, e)}
                    disabled={isDeleting === ex.id || !deleteExercise}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
                  >
                    <Trash2 size={18} className={isDeleting === ex.id ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              <Dumbbell size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium text-sm">Nu ai înregistrat niciun antrenament azi.</p>
            </div>
          )}
        </div>

        <button onClick={onClose} className="w-full mt-8 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-orange-500 transition-all uppercase tracking-widest text-xs relative z-10">
          Am înțeles
        </button>

      </motion.div>
    </motion.div>
  );
}