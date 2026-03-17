"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Scale, Ruler, Activity, Loader2, Leaf, Calendar, Zap } from 'lucide-react';

// 1. Schema de validare Zod (Am adăugat Vârstă și Activitate, vitale pentru calculele calorice)
const onboardingSchema = z.object({
  nume: z.string().min(2, "Nume prea scurt"),
  prenume: z.string().min(2, "Prenume prea scurt"),
  varsta: z.string().min(1, "Obligatoriu"),
  sex: z.enum(["masculin", "feminin"], { message: "Selectează sexul biologic" }),
  greutate_actuala: z.string().min(1, "Obligatoriu"),
  greutate_dorita: z.string().min(1, "Obligatoriu"),
  inaltime: z.string().min(1, "Obligatoriu"),
  nivel_activitate: z.enum(["sedentar", "usor", "moderat", "foarte_activ"], { message: "Selectează nivelul de activitate" }),
  is_vegetarian: z.boolean(),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      is_vegetarian: false
    }
  });

  const selectedSex = watch('sex');
  const selectedActivity = watch('nivel_activitate');
  const isVegetarian = watch('is_vegetarian');

  const onSubmit = async (data: OnboardingFormValues) => {
    setIsSubmitting(true);

    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (authError || !user) {
        alert("Sesiunea a expirat. Te rugăm să te loghezi din nou.");
        router.push('/auth');
        return;
      }

      // Salvăm datele (inclusiv cele noi) în baza de date
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        first_name: data.prenume,
        last_name: data.nume,
        age: parseInt(data.varsta),
        current_weight: parseFloat(data.greutate_actuala),
        target_weight: parseFloat(data.greutate_dorita),
        height: parseFloat(data.inaltime),
        gender: data.sex,
        activity_level: data.nivel_activitate,
        is_vegetarian: data.is_vegetarian,
        onboarding_completed: true // Un flag bun de pus pentru viitor
      });

      if (error) throw error;

      router.push('/dashboard');
    } catch (error) {
      console.error("Eroare la salvare:", error);
      alert("A apărut o eroare la salvarea profilului. Încearcă din nou.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activityLevels = [
    { id: "sedentar", label: "Sedentar", desc: "Muncă de birou, zero sport" },
    { id: "usor", label: "Ușor Activ", desc: "1-3 antrenamente/săpt" },
    { id: "moderat", label: "Moderat", desc: "3-5 antrenamente/săpt" },
    { id: "foarte_activ", label: "Foarte Activ", desc: "6-7 antrenamente sau muncă fizică" },
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center p-4 lg:p-8 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none z-0" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl bg-[#0a0a0a]/80 border border-white/10 p-6 md:p-10 rounded-[32px] backdrop-blur-2xl relative z-10 shadow-2xl"
      >
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-fuchsia-600/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-fuchsia-500/30 shadow-[0_0_20px_rgba(217,70,239,0.2)]">
            <Activity className="text-fuchsia-500 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tight">Setare <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-500">Profil</span></h1>
          <p className="text-gray-400 mt-2 text-sm font-medium">Caloriile și antrenamentele tale vor fi calculate în funcție de aceste date.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* SECȚIUNEA 1: Date Personale */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Date Personale</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2"><User size={14}/> Nume</label>
                  <input {...register("nume")} placeholder="Nume" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all outline-none" />
                  {errors.nume && <p className="text-red-400 text-[10px] mt-1 uppercase font-bold">{errors.nume.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2"><User size={14}/> Prenume</label>
                  <input {...register("prenume")} placeholder="Prenume" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all outline-none" />
                  {errors.prenume && <p className="text-red-400 text-[10px] mt-1 uppercase font-bold">{errors.prenume.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Calendar size={14}/> Vârstă</label>
                  <input type="number" {...register("varsta")} placeholder="Ex: 25" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all outline-none" />
                  {errors.varsta && <p className="text-red-400 text-[10px] mt-1 uppercase font-bold">{errors.varsta.message}</p>}
                </div>
             </div>
          </div>

          {/* SECȚIUNEA 2: Fizic & Obiective */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Fizic & Obiective</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Scale size={14}/> Acum (kg)</label>
                  <input type="number" step="0.1" {...register("greutate_actuala")} placeholder="Ex: 80" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all outline-none" />
                  {errors.greutate_actuala && <p className="text-red-400 text-[10px] mt-1 uppercase font-bold">{errors.greutate_actuala.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Scale size={14}/> Obiectiv (kg)</label>
                  <input type="number" step="0.1" {...register("greutate_dorita")} placeholder="Ex: 70" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all outline-none" />
                  {errors.greutate_dorita && <p className="text-red-400 text-[10px] mt-1 uppercase font-bold">{errors.greutate_dorita.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Ruler size={14}/> Înălțime (cm)</label>
                  <input type="number" {...register("inaltime")} placeholder="Ex: 175" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all outline-none" />
                  {errors.inaltime && <p className="text-red-400 text-[10px] mt-1 uppercase font-bold">{errors.inaltime.message}</p>}
                </div>
             </div>

             <div className="mt-4 pt-4 border-t border-white/5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Sex Biologic (pentru calcul metabolic)</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Masculin", value: "masculin" }, 
                    { label: "Feminin", value: "feminin" }
                  ].map((s) => (
                    <button 
                      type="button" 
                      key={s.value}
                      onClick={() => setValue("sex", s.value as "masculin" | "feminin", { shouldValidate: true })}
                      className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${selectedSex === s.value ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 border-transparent text-white shadow-lg' : 'bg-black/50 border-white/10 text-gray-400 hover:border-white/30'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                {errors.sex && <p className="text-red-400 text-[10px] mt-1 uppercase font-bold">{errors.sex.message}</p>}
             </div>
          </div>

          {/* SECȚIUNEA 3: Activitate & Stil de viață */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-4 flex items-center gap-2"><Zap size={14} className="text-yellow-500" /> Stil de Viață</h3>
             
             <div>
               <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Cât de activ ești?</label>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {activityLevels.map((act) => (
                    <button
                      type="button"
                      key={act.id}
                      onClick={() => setValue("nivel_activitate", act.id as "sedentar" | "usor" | "moderat" | "foarte_activ", { shouldValidate: true })}
                      className={`text-left p-3 rounded-xl border transition-all ${selectedActivity === act.id ? 'bg-fuchsia-500/10 border-fuchsia-500/50' : 'bg-black/50 border-white/10 hover:border-white/20'}`}
                    >
                      <p className={`font-bold text-sm ${selectedActivity === act.id ? 'text-fuchsia-400' : 'text-gray-300'}`}>{act.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{act.desc}</p>
                    </button>
                 ))}
               </div>
               {errors.nivel_activitate && <p className="text-red-400 text-[10px] mt-1 uppercase font-bold">{errors.nivel_activitate.message}</p>}
             </div>

             <div className="mt-4 pt-4 border-t border-white/5">
               <button 
                  type="button"
                  onClick={() => setValue("is_vegetarian", !isVegetarian)}
                  className={`w-full py-4 px-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 ${isVegetarian ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-black/50 border-white/10 text-gray-400 hover:border-white/30'}`}
                >
                  <Leaf size={16} className={isVegetarian ? 'text-green-400' : 'text-gray-500'} />
                  {isVegetarian ? 'Am regim Vegetarian/Vegan' : 'Dietă Standard (consum carne)'}
                </button>
             </div>
          </div>

          {/* Buton Submit */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 mt-8 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Finalizează & Intră în Dashboard"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}