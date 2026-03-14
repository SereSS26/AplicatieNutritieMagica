import React from 'react';
import { motion } from 'framer-motion';

type StatCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtext: string;
  highlight?: boolean;
  onClick?: () => void;
  progress?: number; // NOU: Progresul de la 0 la 100%
};

export default function StatCard({ icon, title, value, subtext, highlight = false, onClick, progress }: StatCardProps) {
  return (
    <motion.div 
      whileHover={onClick ? { scale: 1.02, y: -5 } : {}}
      onClick={onClick}
      className={`p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden group ${
        onClick ? 'cursor-pointer shadow-lg' : ''
      } ${
        highlight 
          ? 'bg-gradient-to-br from-fuchsia-600/20 to-purple-900/20 border-fuchsia-500/50' 
          : 'bg-white/5 border-white/10 hover:border-white/20'
      }`}
    >
      {/* Un glow fin în fundal la hover */}
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-fuchsia-500/20 transition-all"></div>

      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className={`p-3 rounded-2xl transition-colors ${highlight ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'bg-black/30 group-hover:bg-black/50'}`}>
          {icon}
        </div>
        <h4 className="text-gray-300 text-xs sm:text-sm font-bold uppercase tracking-widest">{title}</h4>
      </div>
      
      <h2 className="text-3xl sm:text-4xl font-black tracking-tighter mb-2 relative z-10">{value}</h2>
      <p className="text-xs sm:text-sm font-medium text-gray-400 relative z-10">{subtext}</p>

      {/* Bara de progres vizuală */}
      {progress !== undefined && (
        <div className="w-full h-1.5 bg-black/40 rounded-full mt-5 overflow-hidden relative z-10">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  progress >= 100 
                    ? 'bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.8)]' // Verde dacă ai atins obiectivul
                    : highlight ? 'bg-fuchsia-500 shadow-[0_0_10px_#d946ef]' : 'bg-gray-400'
                }`}
            />
        </div>
      )}
    </motion.div>
  );
}