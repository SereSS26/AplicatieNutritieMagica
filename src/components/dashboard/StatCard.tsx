import React from 'react';

type StatCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtext: string;
  highlight?: boolean;
  onClick?: () => void; // NOU: Funcția de click
};

export default function StatCard({ icon, title, value, subtext, highlight = false, onClick }: StatCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden group ${
        onClick ? 'cursor-pointer hover:scale-[1.02] hover:shadow-xl' : ''
      } ${
        highlight 
          ? 'bg-fuchsia-600/10 border-fuchsia-600/30 hover:border-fuchsia-500/50' 
          : 'bg-white/5 border-white/10 hover:border-white/20'
      }`}
    >
      {/* Glow de fundal la hover */}
      {onClick && (
         <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}

      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="bg-black/30 p-2 rounded-xl group-hover:bg-black/50 transition-colors">{icon}</div>
        <h4 className="text-gray-400 text-sm font-semibold">{title}</h4>
      </div>
      
      <h2 className="text-3xl font-black tracking-tighter mb-1 relative z-10">{value}</h2>
      <p className="text-sm font-medium text-gray-500 relative z-10">{subtext}</p>
    </div>
  );
}