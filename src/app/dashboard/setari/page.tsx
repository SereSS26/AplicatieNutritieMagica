<<<<<<< HEAD
'use client';

import { useState, useEffect } from 'react';
import { Settings, Lock, User, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/src/lib/supabase'; // Asigură-te că această cale este corectă

export default function SettingsPage() {
  // Starea pentru datele utilizatorului (doar pentru afișare)
  const [userData, setUserData] = useState({
    name: 'Se încarcă...',
    email: 'Se încarcă...'
  });

  // Starea pentru parola nouă
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Încărcăm datele oficiale din Supabase când se deschide pagina
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserData({
          email: user.email || 'Email indisponibil',
          // Dacă ai setat numele la înregistrare în metadata, îl tragem de acolo
          name: user.user_metadata?.name || user.user_metadata?.full_name || 'Nume Setat'
        });
      }
    };

    fetchUserData();
  }, []);

  // Funcția de actualizare a inputurilor pentru parole
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  // Salvarea noii parole în Supabase
  const handleSavePassword = async () => {
    setStatusMessage({ type: '', text: '' });

    // Validări de bază
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
      // Aceasta este funcția Supabase care schimbă parola contului permanent!
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });

      if (error) throw error;

      // Succes!
      setStatusMessage({ type: 'success', text: 'Parola a fost actualizată! O poți folosi la următoarea logare.' });
      setPasswords({ newPassword: '', confirmPassword: '' }); // Golim câmpurile
      
    } catch (error: any) {
      console.error('Eroare la schimbarea parolei:', error);
      setStatusMessage({ type: 'error', text: 'A apărut o eroare. Parola nu a putut fi schimbată.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-6 text-white">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header-ul paginii */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="text-blue-500" size={32} />
            Setări Cont
          </h1>
          <p className="text-gray-400 mt-2">
            Aici poți vedea datele contului tău și poți actualiza parola de acces.
          </p>
        </div>

        {/* Mesaje de Succes sau Eroare */}
        {statusMessage.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 border ${
            statusMessage.type === 'success' ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-red-900/30 border-red-500 text-red-400'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* SECȚIUNEA 1: Informații Personale (BLOCATE / FIXE) */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-6 shadow-lg opacity-80">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-white border-b border-gray-700 pb-4">
            <User size={20} className="text-blue-400" />
            Detalii Cont (Fixe)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nume Utilizator</label>
              <input 
                type="text" 
                value={userData.name} 
                disabled
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-400 cursor-not-allowed outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Adresă de Email</label>
              <input 
                type="email" 
                value={userData.email} 
                disabled
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-400 cursor-not-allowed outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECȚIUNEA 2: Securitate și Parolă */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-6 shadow-lg">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-white border-b border-gray-700 pb-4">
            <Lock size={20} className="text-red-400" />
            Schimbă Parola
          </h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Parolă Nouă</label>
                <input 
                  type="password" 
                  name="newPassword" 
                  value={passwords.newPassword} 
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                  placeholder="Minim 6 caractere"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Confirmă Parola Nouă</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={passwords.confirmPassword} 
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                  placeholder="Reintrodu noua parolă"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Buton Salvare */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSavePassword}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-xl font-bold text-lg transition-all hover:scale-[1.02] shadow-lg shadow-red-500/20"
          >
            <ShieldCheck size={24} />
            {isSaving ? 'Se actualizează...' : 'Actualizează Parola'}
          </button>
        </div>

      </div>
    </div>
=======
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Save, Target, Activity, CheckCircle } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Stările pentru formular
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // Email-ul de obicei e read-only, dar îl afișăm
  
  // Setări extra (pentru care ar trebui să ai un tabel "profiles" în Supabase)
  const [calorieGoal, setCalorieGoal] = useState('2500');
  const [waterGoal, setWaterGoal] = useState('8');
  const [weight, setWeight] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Preluăm datele de bază din contul utilizatorului
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (user) {
        setEmail(user.email || '');
        setName(user.user_metadata?.full_name || '');
        
        // Dacă ai creat un tabel 'profiles' pentru celelalte setări, aici le preluăm:
        /*
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) {
           setCalorieGoal(profile.calorie_goal || '2500');
           setWaterGoal(profile.water_goal || '8');
           setWeight(profile.weight || '');
        }
        */
      }
    } catch (error) {
      console.error('Eroare la preluarea datelor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Salvăm Numele în metadata din Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: name }
      });
      if (authError) throw authError;

      // 2. Salvăm restul setărilor în tabelul "profiles" (opțional, dacă l-ai creat)
      /*
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: user.id,
          calorie_goal: parseInt(calorieGoal),
          water_goal: parseInt(waterGoal),
          weight: parseFloat(weight)
        });
        if (profileError) throw profileError;
      }
      */

      setSuccessMsg("Setările au fost salvate cu succes! ⚡");
      
      // Ascundem mesajul de succes după 3 secunde
      setTimeout(() => setSuccessMsg(''), 3000);
      
    } catch (error: any) {
      setErrorMsg(error.message || "A apărut o eroare la salvare.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-6 lg:p-12">
        <div className="w-10 h-10 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="h-full w-full p-6 lg:p-12 overflow-y-auto relative z-10 custom-scrollbar">
      <motion.div 
        className="max-w-4xl mx-auto" 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
      >
        
        {/* Header-ul Paginii */}
        <div className="mb-10">
          <p className="text-blue-500 font-mono text-sm tracking-widest uppercase mb-1">Personalizare</p>
          <h1 className="text-4xl font-black italic tracking-tight text-white">Setările Tale ⚙️</h1>
          <p className="text-gray-400 mt-2 text-sm">Modifică detaliile contului tău și ajustează-ți obiectivele zilnice.</p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-8">
          
          {/* SECȚIUNEA 1: Date Personale */}
          <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-white/5 p-6 md:p-8 rounded-[32px] relative overflow-hidden shadow-xl">
            {/* Glow Subtle de fundal */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-[60px]" />
            
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
              <User className="text-fuchsia-400" />
              Date Personale
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest uppercase text-gray-500 ml-1">Nume Complet</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-fuchsia-400 transition-colors" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-fuchsia-500/50 focus:bg-white/10 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest uppercase text-gray-500 ml-1">Adresă de Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-gray-400 opacity-70 cursor-not-allowed font-medium"
                  />
                </div>
                <p className="text-[10px] text-gray-500 ml-1">Email-ul nu poate fi schimbat momentan.</p>
              </div>
            </div>
          </div>

          {/* SECȚIUNEA 2: Obiective Fitness */}
          <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-white/5 p-6 md:p-8 rounded-[32px] relative overflow-hidden shadow-xl">
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px]" />
            
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
              <Target className="text-blue-400" />
              Obiective & Corp
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest uppercase text-gray-500 ml-1">Calorii Zilnice (Kcal)</label>
                <input
                  type="number"
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white text-center focus:outline-none focus:border-blue-500/50 transition-all font-bold text-lg"
                  placeholder="2500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest uppercase text-gray-500 ml-1">Apă Zilnic (Pahare)</label>
                <input
                  type="number"
                  value={waterGoal}
                  onChange={(e) => setWaterGoal(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white text-center focus:outline-none focus:border-cyan-500/50 transition-all font-bold text-lg"
                  placeholder="8"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest uppercase text-gray-500 ml-1">Greutate (KG)</label>
                <div className="relative group">
                  <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500/50 transition-all font-medium"
                    placeholder="Ex: 75.5"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* MESAJE DE SUCCES / EROARE */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center">
              {errorMsg}
            </div>
          )}
          
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              {successMsg}
            </motion.div>
          )}

          {/* BUTON DE SALVARE */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-white text-black font-black py-4 px-10 rounded-2xl transition-all transform hover:bg-gray-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest text-xs shadow-lg hover:shadow-white/20"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  Salvează Modificările
                </>
              )}
            </button>
          </div>

        </form>
      </motion.div>
    </main>
>>>>>>> cf1ae22a259f9391ac1f0aa4377454bd986eaeaf
  );
}