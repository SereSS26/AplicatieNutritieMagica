"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Zap, Menu, X, ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '@/src/hooks/useAuth';
import UserProfile from './UserProfile';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from './AuthModal';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const { userId } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true); // Stare nouă pentru a preveni "flash-ul"
  const router = useRouter();
  const pathname = usePathname();

  const closeMenu = () => setIsMobileMenuOpen(false);

  const checkAdminStatus = () => {
    const adminAuth = localStorage.getItem('adminAuth');
    setIsAdmin(!!adminAuth);
    setIsChecking(false); // Am terminat verificarea
  };

  // Verificăm statusul de admin și redirecționăm automat dacă nu e în panou
  React.useEffect(() => {
    checkAdminStatus();
    if (localStorage.getItem('adminAuth') && pathname !== '/dashboard/admin/users') {
      router.replace('/dashboard/admin/users');
    }
  }, [pathname, router]);

  // Dacă încă verificăm statusul, nu afișăm NIMIC (nici logo, nici meniu)
  // Asta rezolvă problema cu "o secundă din pagina principală"
  if (isChecking) {
    return null; 
  }

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAuthModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAuthModalOpen(false);
    checkAdminStatus(); // Verificăm din nou dacă s-a logat adminul
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAdmin(false);
    router.push('/');
  };

  // Dacă este admin, afișăm o bară de navigare complet separată și minimalistă.
  if (isAdmin) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-red-500/20 bg-[#0a0a0a]/90 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-red-500" size={24} />
            <span className="text-xl font-bold tracking-tight text-white">
              Admin <span className="text-red-500 font-light">Panel</span>
            </span>
          </div>
          <button onClick={handleAdminLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all text-sm font-bold">
            <LogOut size={16} />
            <span className="hidden sm:inline">Deconectare</span>
          </button>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex justify-between items-center">

          {/* Logo */}
          <Link href="/" onClick={closeMenu} className="flex items-center gap-2 sm:gap-3 group z-50">
            <div className="bg-gradient-to-tr from-fuchsia-600 to-purple-600 p-2 rounded-xl shadow-[0_0_20px_rgba(217,70,239,0.3)] group-hover:scale-105 transition-transform">
              <Zap className="text-white" size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Queen&King<span className="text-fuchsia-600 font-light">Fit</span>
            </span>
          </Link>

          {/* Link-uri Meniu (Desktop) */}
          <div className="hidden md:flex gap-3 lg:gap-4 items-center">
            <Link href="/dashboard" className="px-5 py-2.5 bg-fuchsia-600 text-white text-sm font-bold rounded-full hover:bg-fuchsia-500 hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(217,70,239,0.4)]">
              Dashboard
            </Link>
            <Link href="/dashboard/nutritie" className="px-5 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-full hover:bg-purple-500 hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              Plan Nutriție
            </Link>
            <Link href="/dashboard/antrenamente" className="px-5 py-2.5 bg-violet-600 text-white text-sm font-bold rounded-full hover:bg-violet-500 hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.4)]">
              Antrenamente
            </Link>
            <Link href="/dashboard/progres" className="px-5 py-2.5 bg-pink-600 text-white text-sm font-bold rounded-full hover:bg-pink-500 hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(236,72,153,0.4)]">
              Progres
            </Link>
          </div>

          {/* Zona din Dreapta: Auth + Buton Hamburger (Mobil) */}
          <div className="flex items-center gap-3 md:gap-4 z-50">

            {userId ? (
              // Dacă e USER (Supabase) -> Arătăm profilul normal
              <UserProfile />
            ) : (
              // Dacă e VIZITATOR -> Buton Login
              <button
                onClick={handleLoginClick}
                className="px-4 md:px-5 py-2 md:py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-xs md:text-sm font-black rounded-full hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all duration-300 shadow-[0_0_15px_rgba(217,70,239,0.2)]"
              >
                Autentificare
              </button>
            )}

            {/* Buton Hamburger DOAR pentru mobil */}
            <button
              className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

          </div>
        </div>

        {/* Meniul Dropdown pentru Mobil (Animație cu Framer Motion) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute top-20 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-3xl border-b border-white/10 shadow-2xl"
            >
              <div className="flex flex-col p-4 gap-3">
                <Link onClick={closeMenu} href="/dashboard" className="w-full text-center py-3 bg-fuchsia-600 text-white text-sm font-bold rounded-2xl active:scale-95 transition-transform shadow-[0_0_15px_rgba(217,70,239,0.3)]">
                  Dashboard
                </Link>
                <Link onClick={closeMenu} href="/dashboard/nutritie" className="w-full text-center py-3 bg-purple-600 text-white text-sm font-bold rounded-2xl active:scale-95 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  Plan Nutriție
                </Link>
                <Link onClick={closeMenu} href="/dashboard/antrenamente" className="w-full text-center py-3 bg-violet-600 text-white text-sm font-bold rounded-2xl active:scale-95 transition-transform shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  Antrenamente
                </Link>
                <Link onClick={closeMenu} href="/dashboard/progres" className="w-full text-center py-3 bg-pink-600 text-white text-sm font-bold rounded-2xl active:scale-95 transition-transform shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                  Progresul meu
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleModalClose}
        redirectUrl="/dashboard"
      />
    </>
  );
}
