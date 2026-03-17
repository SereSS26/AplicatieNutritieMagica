'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Crown } from 'lucide-react';
import AuthModal from './AuthModal';
import { useAuth } from '@/src/hooks/useAuth';

export default function HeroSection() {
  const { userId } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRedirectUrl, setAuthRedirectUrl] = useState('/dashboard');

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70, damping: 15 } }
  };

  const handleGeneratePlan = () => {
    setAuthRedirectUrl('/dashboard');
    setIsAuthModalOpen(true);
  };

  const handleExplore = () => {
    setAuthRedirectUrl('/dashboard/progres');
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <motion.div
        className="xl:col-span-5 flex flex-col justify-center text-left relative z-10"
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >

        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 w-fit mb-8 backdrop-blur-sm"
        >
          <span className="flex h-2 w-2 rounded-full bg-fuchsia-600 animate-pulse"></span>
          <span className="text-xs font-semibold tracking-wider text-gray-300 uppercase">ITFEST Hackathon 2026</span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter leading-tight mb-6 text-white"
        >
          Claim your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-purple-400 pr-2">
          Crown.
          </span>
        </motion.h1>

        {/* PANEL PREMIUM PENTRU SUB-TEXT */}
        <motion.div
          variants={itemVariants}
          className="mt-2 mb-10 flex items-start gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] relative overflow-hidden group/panel transition-all hover:border-fuchsia-500/30 max-w-lg"
        >
          {/* Glow subtil la hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-transparent pointer-events-none opacity-50 group-hover/panel:opacity-100 transition-opacity" />
          
          {/* Iconița de Coroană Regală */}
          <div className="bg-fuchsia-500/20 p-2.5 rounded-xl border border-fuchsia-500/30 shrink-0 relative z-10 shadow-[inset_0_0_15px_rgba(217,70,239,0.2)]">
            <Crown size={20} className="text-fuchsia-400" />
          </div>
          
          {/* Textul adaptat în Română cu vibe de lux */}
          <div className="text-gray-300 font-medium text-sm sm:text-base leading-relaxed relative z-10">
            <p>
              Algoritmi AI care îți mapează <span className="text-white font-bold text-shadow-sm">metabolismul</span>. 
              Nutriție calculată precis la <span className="text-white font-bold text-shadow-sm">gram</span>. 
            </p>
            <div className="mt-2">
              <span className="inline-block text-fuchsia-400 font-black uppercase tracking-[0.15em] text-[10px] bg-fuchsia-500/10 px-2.5 py-1 rounded-lg border border-fuchsia-500/20 shadow-[0_0_15px_rgba(217,70,239,0.3)]">
                Rezultate imposibil de ignorat
              </span>
            </div>
          </div>
        </motion.div>

        {/* Container pentru butoane, setat cu z-20 pentru a putea fi apăsate peste fundalul 3D */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 relative z-20">

          {userId ? (
            <Link
              href="/dashboard/nutritie"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold rounded-2xl hover:shadow-[0_0_30px_rgba(236,72,153,0.4)] hover:-translate-y-1 transition-all duration-300 shadow-[0_0_20px_rgba(217,70,239,0.3)] cursor-pointer"
            >
              Generează Planul
              <ChevronRight size={20} />
            </Link>
          ) : (
            <>
              {/* Buton 1: Generează Planul - cu Authentication */}
              <button
                onClick={handleGeneratePlan}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold rounded-2xl hover:shadow-[0_0_30px_rgba(236,72,153,0.4)] hover:-translate-y-1 transition-all duration-300 shadow-[0_0_20px_rgba(217,70,239,0.3)] cursor-pointer"
              >
                Generează Planul
                <ChevronRight size={20} />
              </button>

              {/* Buton 2: Autentificare */}
              <button
                onClick={handleExplore}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm cursor-pointer hover:border-fuchsia-500/50"
              >
                Autentificare
              </button>
            </>
          )}

        </motion.div>

      </motion.div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        redirectUrl={authRedirectUrl}
      />
    </>
  );
}
