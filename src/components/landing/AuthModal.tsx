'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
}

export default function AuthModal({ isOpen, onClose, redirectUrl = '/dashboard' }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Toggle Login vs Register
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setErrorMsg('');
    setIsSuccess(false);

    // Validate email
    if (!email.trim()) {
      setErrorMsg('⚠️ Introdu email-ul');
      setIsLoading(false);
      return;
    }

    // 1. VERIFICARE ADMIN (Hardcoded - Prioritate)
    if (email === 'admin@test.com' && password === 'admin123') {
      // Admin Login Success
      setIsSuccess(true);
      localStorage.setItem('adminAuth', JSON.stringify({
        email: 'admin@test.com',
        isAdmin: true,
        token: 'token-' + Date.now()
      }));

      setTimeout(() => {
        setEmail('');
        setPassword('');
        onClose();
        router.push('/dashboard/admin/users');
      }, 1500);
      return;
    }

    // 2. SUPABASE AUTH (Utilizatori Normali)
    try {
      if (isLogin) {
        // Login Normal
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        // Înregistrare (Create Account)
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name }
          }
        });
        if (error) throw error;
      }

      // Succes Supabase
      setIsSuccess(true);
      setTimeout(() => {
        setEmail('');
        setPassword('');
        setName('');
        onClose();
        router.push(redirectUrl);
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setErrorMsg('❌ ' + (err.message || "Eroare la autentificare"));
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-8 shadow-2xl relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-lg transition"
            >
              <X size={20} className="text-gray-400" />
            </button>

            <div className="mb-6 text-center">
              <div className="inline-block p-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-full mb-3">
                <Lock size={24} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">{isLogin ? 'Autentificare' : 'Creează Cont'}</h2>
              <p className="text-sm text-gray-400">{isLogin ? 'Bine ai revenit!' : 'Începe transformarea ta.'}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name Input (Doar la înregistrare) */}
              {!isLogin && (
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Nume</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Numele tău"
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-fuchsia-500 focus:outline-none transition disabled:opacity-50"
                    />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="nume@email.com"
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-fuchsia-500 focus:outline-none transition disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Parolă</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-fuchsia-500 focus:outline-none transition disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-200 text-sm whitespace-pre-line"
                >
                  {errorMsg}
                </motion.div>
              )}

              {/* Success Message */}
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-200 text-sm text-center font-medium"
                >
                  ✓ Autentificare reușită! Se redirecționează...
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Se conectează...
                  </>
                ) : isSuccess ? (
                  '✓ Succes!'
                ) : (
                  <>{isLogin ? 'Conectează-te' : 'Creează Cont'} <ArrowRight size={18} /></>
                )}
              </button>
            </form>

            {/* Toggle Login/Register */}
            <p className="text-center text-sm text-gray-400 mt-4">
              {isLogin ? "Nu ai cont?" : "Ai deja cont?"}{" "}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrorMsg('');
                }}
                className="text-fuchsia-400 hover:text-fuchsia-300 font-bold hover:underline transition-all"
              >
                {isLogin ? "Creează unul acum" : "Loghează-te"}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
