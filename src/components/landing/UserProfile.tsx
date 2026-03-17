"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, ChevronDown } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';

export default function UserProfile() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("Rege");
  const [userEmail, setUserEmail] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Extragem datele utilizatorului la montare
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email || "");
        setUserName(user.user_metadata?.full_name || "Rege");
      }
    };
    fetchUser();
  }, []);

  // Închide meniul la click în afara lui
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Logica de Deconectare
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/'); // Trimitem userul pe pagina principală
  };

  // Obținem prima literă din nume pentru Avatar
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="relative z-[100]" ref={dropdownRef}>
      {/* Butonul de Profil (Avatar) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 p-1.5 pr-3 rounded-full transition-all duration-300 group shadow-lg"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-fuchsia-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(217,70,239,0.4)]">
          {getInitials(userName)}
        </div>
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : 'group-hover:text-white'}`} />
      </button>

      {/* Meniul Dropdown Animat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-60 bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Header Meniu */}
            <div className="p-4 border-b border-white/5 bg-gradient-to-br from-white/5 to-transparent">
              <p className="font-bold text-white text-sm truncate">{userName}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{userEmail}</p>
            </div>

            {/* Link-uri / Acțiuni */}
            <div className="p-2 space-y-1">
              
              <button 
                onClick={() => { setIsOpen(false); router.push('/dashboard/setari'); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Settings size={16} className="text-gray-400" /> Setări Cont
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={16} /> Deconectare
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}