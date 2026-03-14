import React from 'react';
import { Trash2, Loader2 } from 'lucide-react';

type MealItemProps = {
  time: string;
  name: string;
  cals: string;
  protein?: number; // Opțional, pentru că pe prima pagină poate nu vrem să-l afișăm
  status: 'done' | 'pending';
  onDelete?: () => void;
  isDeleting?: boolean;
};

export default function MealItem({ time, name, cals, protein, status, onDelete, isDeleting }: MealItemProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-colors group">
      <div className="flex items-center gap-4">
        <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(217,70,239,0.5)] ${status === 'done' ? 'bg-fuchsia-600' : 'bg-gray-600'}`} />
        <div>
          <p className={`text-sm font-bold group-hover:text-fuchsia-400 transition-colors ${status === 'done' ? 'text-white' : 'text-gray-400'}`}>{name}</p>
          <p className="text-[11px] font-mono text-gray-500 mt-0.5">{time}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm font-black text-white">{cals}</span>
          {protein && protein > 0 ? (
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
              {protein}g proteine
            </span>
          ) : null}
        </div>
        
        {onDelete && (
          <button 
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 ml-1 bg-white/5 border border-white/10 text-gray-400 hover:text-red-500 hover:bg-red-500/20 hover:border-red-500/50 rounded-xl transition-all disabled:opacity-50 opacity-100 md:opacity-0 group-hover:opacity-100"
          >
            {isDeleting ? <Loader2 size={16} className="animate-spin text-red-500" /> : <Trash2 size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}