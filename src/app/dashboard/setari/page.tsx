'use client';

import { useState, useEffect } from 'react';
import { Settings, Lock, User, ShieldCheck, AlertCircle, CheckCircle2, Zap, Key } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsPage() {
  const [userData, setUserData] = useState({
    name: 'Se încarcă...',
    email: 'Se încarcă...'
  });

  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserData({
          email: user.email || 'Email indisponibil',
          name: user.user_metadata?.name || user.user_metadata?.full_name || 'Nume Setat'
        });
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSavePassword = async () => {
    setStatusMessage({ type: '', text: '' });

    if (!passwords.newPassword) {
      setStatusMessage({ type: 'error', text: 'Te rugăm să introduci o parolă nouă.' });
      return;
    }
    if (passwords.newPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'Parola trebuie să aibă minim 6 caractere.' });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Parolele noi nu coincid!' });
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });

      if (error) throw error;

      setStatusMessage({ type: 'success', text: 'Parola a fost actualizată! O poți folosi la următoarea logare.' });
      setPasswords({ newPassword: '', confirmPassword: '' }); 
      
      // Ștergem mesajul de succes după 5 secunde
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 5000);
    } catch (error: any) {
      console.error('Eroare la schimbarea parolei:', error);
      setStatusMessage({ type: 'error', text: 'A apărut o eroare. Parola nu a putut fi schimbată.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-10 text-white relative z-10 overflow-hidden custom-scrollbar">
      
      {/* Lumini atmosferice de fundal */}
      <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10 pb-20">
        
        {/* ── HEADER SPECTACULOS ── */}
        <motion.header
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative rounded-[32px] p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-2xl overflow-hidden group"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50" />
          
          <div className="relative p-8 lg:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="relative z-10 w-full max-w-2xl">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_12px_#3b82f6]" />
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.25em]">Sistem de Control</span>
              </div>
              
              {/* Titlul reparat cu pr-2 pentru a nu tăia litera "t" */}
              <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400">
                Setări <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)] pr-2">Cont</span>
              </h1>
              
              <div className="mt-6 flex items-start sm:items-center gap-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden group/panel transition-all hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent pointer-events-none opacity-50 group-hover/panel:opacity-100 transition-opacity" />
                <div className="bg-blue-500/20 p-2.5 rounded-xl border border-blue-500/30 shrink-0 relative z-10 shadow-[inset_0_0_15px_rgba(59,130,246,0.2)]">
                  <Settings size={22} className="text-blue-400 animate-[spin_4s_linear_infinite]" />
                </div>
                <p className="text-gray-300 font-medium text-sm sm:text-base leading-relaxed relative z-10">
                  Aici poți vedea datele contului tău și poți actualiza <span className="text-white font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">parola de acces</span>. Păstrează-ți contul în <span className="inline-block mt-1 sm:mt-0 text-blue-400 font-black uppercase tracking-widest text-[10px] sm:text-xs sm:mx-1 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]">Siguranță</span>.
                </p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* ── ALERTE ȘI MESAJE ── */}
        <AnimatePresence>
          {statusMessage.text && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`p-5 rounded-2xl flex items-center gap-4 border backdrop-blur-md shadow-2xl relative overflow-hidden ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-900/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)]' 
                : 'bg-red-900/20 border-red-500/40 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.15)]'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
              <div className={`p-2 rounded-full ${statusMessage.type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'} relative z-10 shrink-0`}>
                {statusMessage.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              </div>
              <span className="font-bold relative z-10">{statusMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 gap-8"
        >
          {/* ── SECȚIUNEA 1: Informații Personale (FIXE) ── */}
          <div className="bg-[#0a0a0a]/60 backdrop-blur-3xl p-8 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-cyan-600/10 transition-colors duration-700" />
            
            <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6 relative z-10">
              <div className="bg-cyan-500/10 p-3 rounded-2xl border border-cyan-500/20 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]">
                <User size={24} className="text-cyan-400" />
              </div>
              <h2 className="text-2xl font-black italic text-white tracking-wide">Identitate Vizuală</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Zap size={14} className="text-gray-400" /> Nume Utilizator
                </label>
                <div className="text-lg font-bold text-white bg-black/40 px-4 py-3 rounded-xl border border-white/5 shadow-inner text-gray-300">
                  {userData.name}
                </div>
              </div>
              
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} className="text-gray-400" /> Adresă de Email
                </label>
                <div className="text-lg font-bold text-white bg-black/40 px-4 py-3 rounded-xl border border-white/5 shadow-inner text-gray-300">
                  {userData.email}
                </div>
              </div>
            </div>
          </div>

          {/* ── SECȚIUNEA 2: Securitate și Parolă ── */}
          <div className="bg-[#0a0a0a]/60 backdrop-blur-3xl p-8 rounded-[32px] border border-red-500/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-red-600/10 transition-colors duration-700" />
            
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="bg-red-500/10 p-3 rounded-2xl border border-red-500/20 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]">
                  <Lock size={24} className="text-red-400" />
                </div>
                <h2 className="text-2xl font-black italic text-white tracking-wide">Protocol Securitate</h2>
              </div>
              <span className="text-[10px] font-bold text-red-500/50 uppercase tracking-widest border border-red-500/20 bg-red-500/10 px-3 py-1 rounded-full hidden sm:block">
                Modificare Parolă
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 pl-1">
                  <Key size={14} className="text-red-400" /> Parolă Nouă
                </label>
                <input 
                  type="password" 
                  name="newPassword" 
                  value={passwords.newPassword} 
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-medium focus:border-red-500 focus:ring-1 focus:ring-red-500/50 outline-none transition-all placeholder:text-gray-700 shadow-inner"
                  placeholder="Minim 6 caractere"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 pl-1">
                  <ShieldCheck size={14} className="text-red-400" /> Confirmă Parola
                </label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={passwords.confirmPassword} 
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-medium focus:border-red-500 focus:ring-1 focus:ring-red-500/50 outline-none transition-all placeholder:text-gray-700 shadow-inner"
                  placeholder="Reintrodu noua parolă"
                />
              </div>
            </div>

            {/* Buton Salvare */}
            <div className="flex justify-end pt-8 relative z-10">
              <button
                onClick={handleSavePassword}
                disabled={isSaving}
                className="relative group/btn overflow-hidden rounded-2xl p-[1px] shrink-0"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 rounded-2xl opacity-70 group-hover/btn:opacity-100 transition-opacity duration-300 blur-md" />
                <span className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 rounded-2xl" />
                <div className="relative px-8 py-4 bg-black/40 backdrop-blur-xl rounded-2xl flex items-center gap-3 transition-all duration-300 group-hover/btn:bg-black/20">
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 
                      <span className="text-white font-black text-sm tracking-widest uppercase">Se criptează...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="text-white group-hover/btn:scale-110 group-hover/btn:-rotate-3 transition-transform" size={22} /> 
                      <span className="text-white font-black text-sm tracking-widest uppercase text-shadow-sm">Actualizează Parola</span>
                    </>
                  )}
                </div>
              </button>
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
}