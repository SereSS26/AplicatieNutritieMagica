"use client";

import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/5 bg-[#0a0a0a]/80 backdrop-blur-3xl relative z-20 mt-auto">
      
      {/* Linia de lumină subtilă (Glow) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-fuchsia-500/30 to-transparent" />

      {/* Am redus padding-ul (py-6) pentru a-l face subtil și compact */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        
        {/* Semnătura voastră centrată elegant */}
        <div className="flex items-center justify-center flex-wrap gap-1.5 text-sm font-medium text-gray-500">
          &copy; {currentYear} Queen&King Cardio. Made with <Heart size={14} className="text-fuchsia-500 mx-0.5 animate-pulse" fill="currentColor" /> by 
          
          <span className="text-gray-300 font-bold hover:text-fuchsia-400 transition-colors cursor-default">Alina</span> &amp; 
          <span className="text-gray-300 font-bold hover:text-blue-400 transition-colors cursor-default">Artur</span> &amp; 
          <span className="text-gray-300 font-bold hover:text-purple-400 transition-colors cursor-default">Sabina</span> &amp; 
          <span className="text-gray-300 font-bold hover:text-cyan-400 transition-colors cursor-default">Solo</span>.
        </div>

      </div>
    </footer>
  );
}