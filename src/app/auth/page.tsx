"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, User, Dumbbell, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/src/lib/supabase';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push('/dashboard');
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name }
          }
        });
        if (signUpError) throw signUpError;
        alert("Cont creat cu succes! Te poți loga acum.");
        setIsLogin(true);
      }
    } catch (err: any) {
      // Traducem erorile comune pentru o experiență mai bună
      if (err.message.includes("Invalid login")) {
        setError("Email sau parolă incorecte. Mai încearcă o dată! ⚡");
      } else if (err.message.includes("already registered")) {
         setError("Acest email este deja folosit. Încearcă să te loghezi! 👑");
      } else {
         setError(err.message || "A apărut o eroare. Te rugăm să reîncerci.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Variante pentru animațiile framer-motion
  const formVariants = {
    hidden: { opacity: 0, x: isLogin ? -20 : 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, x: isLogin ? 20 : -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center relative overflow-hidden selection:bg-fuchsia-600 selection:text-white font-sans">
      
      {/* Fundal Premium Glow (Asimetric) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-fuchsia-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,rgba(0,0,0,0)_80%)] pointer-events-none" />

      {/* Navbar Minimalist (Back to Home) */}
      <nav className="absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-center max-w-7xl mx-auto right-0">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 p-[1px] group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(217,70,239,0.3)]">
             <div className="h-full w-full bg-[#0a0a0a] rounded-xl flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
             </div>
          </div>
          <span className="font-black tracking-widest uppercase text-sm hidden sm:block">
            Queen&King <span className="text-fuchsia-500">Cardio</span>
          </span>
        </Link>
      </nav>

      <div className="w-full max-w-[420px] px-6 relative z-10 mt-10 sm:mt-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/5 p-8 sm:p-10 rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          {/* Subtle Inner Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />

          <div className="text-center mb-8 relative">
             <div className="mx-auto w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                {isLogin ? <Lock className="text-fuchsia-400" size={28} /> : <Sparkles className="text-blue-400" size={28} />}
             </div>
             
             <h1 className="text-3xl font-black italic tracking-tight mb-2">
                {isLogin ? 'Bine ai revenit!' : 'Începe Acum'}
             </h1>
             <p className="text-gray-400 text-sm font-medium">
                {isLogin 
                  ? 'Continuă-ți progresul de unde ai rămas.' 
                  : 'Deblochează-ți potențialul alături de noi.'}
             </p>
          </div>

          {/* Afișare Erori */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }} 
                animate={{ opacity: 1, height: 'auto', y: 0 }} 
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="mb-6 overflow-hidden"
              >
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center flex items-center justify-center gap-2">
                  <span className="shrink-0">⚠️</span>
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formularul (Cu animație de slide stânga/dreapta la schimbarea modului) */}
          <AnimatePresence mode="wait">
            <motion.form 
              key={isLogin ? 'login' : 'register'}
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleSubmit} 
              className="space-y-4"
            >
              
              {/* Câmpul de Nume (doar la înregistrare) */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-widest uppercase text-gray-500 ml-1">Numele Tău</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-fuchsia-400 transition-colors" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-fuchsia-500/50 focus:bg-white/10 transition-all text-sm font-medium"
                      placeholder="Ex: Regele Artur"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Câmpul Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-widest uppercase text-gray-500 ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-fuchsia-400 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-fuchsia-500/50 focus:bg-white/10 transition-all text-sm font-medium"
                    placeholder="nume@exemplu.ro"
                    required
                  />
                </div>
              </div>

              {/* Câmpul Parolă */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold tracking-widest uppercase text-gray-500">Parolă</label>
                  {isLogin && (
                    <button type="button" className="text-xs font-medium text-gray-500 hover:text-white transition-colors">
                      Ai uitat parola?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-fuchsia-400 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-fuchsia-500/50 focus:bg-white/10 transition-all text-sm font-medium tracking-widest"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Butonul de Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-8 bg-white text-black font-black py-4 rounded-2xl transition-all transform hover:bg-gray-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest text-xs relative overflow-hidden group"
              >
                {/* Efect de hover pe buton */}
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10">{isLogin ? 'Conectează-te' : 'Creează Cont'}</span>
                    <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.form>
          </AnimatePresence>

          {/* Toggle Login/Register */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center text-gray-400 text-sm font-medium">
            {isLogin ? "Ești nou pe aici? " : "Ai deja un cont? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setPassword(''); // Resetăm parola la schimbarea tabului
              }}
              className="text-white hover:text-fuchsia-400 font-bold transition-colors border-b border-transparent hover:border-fuchsia-400 pb-0.5 ml-1"
            >
              {isLogin ? 'Creează un cont' : 'Loghează-te'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}