"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, 
  Flame, 
  Dumbbell, 
  LineChart, 
  Settings, 
  LogOut,
  Clock,
  ChevronRight,
  User, // <-- AM ADĂUGAT ICONIȚA AICI
  HeartPulse // ICONITA ANALIZA MEDICALE
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';

// Lista de rute ale aplicației tale
const navItems = [
  { name: 'Acasă', href: '/dashboard', icon: Home },
  { name: 'Nutriție', href: '/dashboard/nutritie', icon: Flame },
  { name: 'Antrenamente', href: '/dashboard/antrenamente', icon: Dumbbell },
  { name: 'Simulator', href: '/dashboard/simulator', icon: Clock },
  { name: 'Progres', href: '/dashboard/progres', icon: LineChart },
  { name: 'Sănătate', href: '/dashboard/sanatate', icon: HeartPulse },
  { name: 'Profilul Meu', href: '/dashboard/profil', icon: User }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificăm dacă utilizatorul este ADMIN
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    setIsAdmin(!!adminAuth);
  }, []);
  
  // Logica pentru DECONECTARE
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth'); // Trimitem utilizatorul înapoi la pagina de login
    } catch (error) {
      console.error('Eroare la deconectare:', error);
      alert('A apărut o eroare. Te rugăm să reîncerci.');
    }
  };

  // Logica pentru SETĂRI 
  const handleSettings = () => {
    router.push('/dashboard/setari'); // Redirecționăm către noua pagină!
  };

  // DACĂ EȘTI ADMIN SAU PE O RUTĂ DE ADMIN -> ASCUNDE COMPLET SIDEBAR-UL
  if (isAdmin || pathname?.includes('/admin')) {
    return null;
  }

  return (
    <div className="w-64 h-screen bg-[#0a0a0a]/60 backdrop-blur-3xl border-r border-white/5 flex flex-col relative z-30 transition-all duration-300 shrink-0">
      
      {/* Glow Subtil în spate (Efect Premium) */}
      <div className="absolute top-0 left-0 w-full h-32 bg-fuchsia-600/10 blur-[80px] pointer-events-none" />

      {/* Logo & Branding */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fuchsia-600 to purple-600 p-[1px] group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(217,70,239,0.3)] shrink-0">
             <div className="h-full w-full bg-[#0a0a0a] rounded-xl flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
             </div>
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-black tracking-widest uppercase text-xs text-white leading-tight">Queen&King</span>
            <span className="font-black tracking-widest uppercase text-[10px] text-fuchsia-500 leading-tight">Fit</span>
          </div>
        </Link>
      </div>

      {/* Navigare Principală */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-4 ml-2">Meniu Principal</p>
        
        {navItems.map((item) => {
          // Verificăm dacă suntem pe pagina curentă
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link 
              key={item.href} 
              href={item.href}
              onMouseEnter={() => setIsHovered(item.href)}
              onMouseLeave={() => setIsHovered(null)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative group ${
                isActive 
                  ? 'text-white bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {/* Indicatorul Activ (Bara verticală Fuchsia animată) */}
              {isActive && (
                <motion.div 
                  layoutId="active-nav-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-fuchsia-500 rounded-r-full shadow-[0_0_10px_rgba(217,70,239,0.8)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <Icon size={20} className={`transition-colors duration-300 ${isActive ? 'text-fuchsia-400' : 'group-hover:text-fuchsia-400'}`} />
              <span className="font-medium text-sm tracking-wide">{item.name}</span>
              
              {/* Săgeată subtilă la hover */}
              <ChevronRight 
                size={16} 
                className={`ml-auto opacity-0 -translate-x-2 transition-all duration-300 ${
                  isHovered === item.href || isActive ? 'opacity-100 translate-x-0' : ''
                } ${isActive ? 'text-fuchsia-500' : 'text-gray-600'}`}
              />
            </Link>
          );
        })}
      </nav>

      {/* Secțiunea de Jos (Setări & Deconectare) */}
      <div className="p-4 border-t border-white/5 space-y-2 bg-gradient-to-t from-black/50 to-transparent">
        <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2 ml-2">Contul Tău</p>
        
        <button 
          onClick={handleSettings}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 group"
        >
          <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500 group-hover:text-blue-400" />
          <span className="font-medium text-sm tracking-wide">Setări</span>
        </button>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium text-sm tracking-wide">Deconectare</span>
        </button>
      </div>

    </div>
  );
}