'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
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
          <span className="text-xs font-semibold tracking-wider text-gray-300 uppercase">ITEC Hackathon 2026</span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] mb-6 text-white"
        >
          Corp <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-purple-400">
            Nefiltrat.
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-gray-400 text-lg leading-relaxed max-w-md mb-10 font-light"
        >
          Algoritmi AI care îți mapează metabolismul. Nutriție calculată la gram. Rezultate imposibil de ignorat.
        </motion.p>

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
