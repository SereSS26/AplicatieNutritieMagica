"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { X, Droplet, Plus } from 'lucide-react';

interface WaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  waterGlasses: number;
  drinkWater: () => void;
  isSavingWater: boolean;
}

export default function WaterModal({ isOpen, onClose, waterGlasses, drinkWater, isSavingWater }: WaterModalProps) {
  if (!isOpen) return null;

  const maxGlasses = 8; // Obiectivul zilnic

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-[#0a0a0a] border border-white/10 rounded-[32px] p-6 sm:p-8 w-full max-w-sm relative shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Albastru */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none" />

        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-10">
          <X size={24} />
        </button>

        <div className="flex flex-col items-center justify-center text-center mt-4 mb-8 relative z-10">
          <div className="p-4 bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30 mb-4 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            <Droplet size={40} className={isSavingWater ? "animate-pulse" : ""} />
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter text-white">Hidratare</h2>
          <p className="text-gray-400 mt-2 text-sm">Obiectivul tău zilnic este de 8 pahare (2L).</p>
        </div>

        {/* Progresul vizual cu picături */}
        <div className="flex justify-center items-center gap-2 mb-8 relative z-10">
          {[...Array(maxGlasses)].map((_, i) => (
            <div 
              key={i} 
              className={`w-5 h-8 rounded-full transition-all duration-500 ${
                i < waterGlasses 
                ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)] scale-110' 
                : 'bg-white/5 border border-white/10'
              }`}
            />
          ))}
        </div>

        {/* Contorul și Butonul */}
        <div className="flex flex-col gap-4 relative z-10">
          <div className="text-center">
            <span className="text-5xl font-black text-cyan-400">{waterGlasses}</span>
            <span className="text-xl text-gray-500 font-bold"> / 8</span>
          </div>

          <button 
            onClick={drinkWater} 
            disabled={isSavingWater || waterGlasses >= 20}
            className="w-full py-4 bg-cyan-500 text-black font-black rounded-2xl hover:bg-cyan-400 hover:scale-[1.02] transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <Plus size={20} />
            Bea un pahar
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
}