"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Star, Clock, Flame, Trophy, X, MessageSquare, ThumbsUp, Loader2, Brain, Dumbbell, Camera, ScanLine, Activity, Sparkles, Wind } from 'lucide-react';
import { useAuth } from '@/src/hooks/useAuth';
import { useDashboardContext } from '@/src/context/DashboardContext';

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  tips: string;
}

interface AiPlan {
  warmup: string;
  exercises: Exercise[];
  cooldown: string;
}

interface Workout {
  id: number;
  title: string;
  category: string;
  duration: string;
  calories: string;
  difficulty: string;
  rating: number;
  reviewsCount: number;
  image: string;
  videoId?: string;
  videoUrl?: string;
  recommended: boolean;
  reviews: { user: string; text: string; rating: number; }[];
}

const CATEGORIES = ["Toate", "Full Body", "Cardio", "Picioare", "Piept & Brațe", "Abdomen"];

const WORKOUTS: Workout[] = [
  {
    id: 1,
    title: "HIIT Extrem - Ardere Grăsimi",
    category: "Cardio",
    duration: "15 min",
    calories: "350 kcal",
    difficulty: "Avansat",
    rating: 4.9,
    reviewsCount: 128,
    image: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?q=80&w=1000&auto=format&fit=crop",
    videoId: "1skBf6h2ksI", // Noul link (Pamela Reif - 15 Min Full Body HIIT)
    recommended: true,
    reviews: [
      { user: "Andrei P.", text: "M-a distrus, dar merită! 🔥", rating: 5 },
      { user: "Maria S.", text: "Foarte intens pentru începători.", rating: 4 }
    ]
  },
  {
    id: 2,
    title: "Picioare de Oțel & Fese",
    category: "Picioare",
    duration: "12 min",
    calories: "200 kcal",
    difficulty: "Mediu",
    rating: 4.7,
    reviewsCount: 85,
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=1000&auto=format&fit=crop",
    videoId: "Fu_oExrPX68", // Pamela Reif - 12 Min Leg Workout
    recommended: false,
    reviews: [
      { user: "Ionut T.", text: "Nu mai pot merge, 10/10.", rating: 5 },
      { user: "Diana M.", text: "Cel mai bun pentru picioare.", rating: 5 }
    ]
  },
  {
    id: 3,
    title: "Abdomen Sculptat în 10 Min",
    category: "Abdomen",
    duration: "10 min",
    calories: "120 kcal",
    difficulty: "Începător",
    rating: 4.5,
    reviewsCount: 340,
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop",
    videoId: "1f8yoFFdkcY", // Pamela Reif - 10 Min Beginner Ab Workout
    recommended: false,
    reviews: [
      { user: "Elena D.", text: "Scurt și la obiect.", rating: 5 },
      { user: "Radu M.", text: "Bun pentru dimineață.", rating: 4 }
    ]
  },
  {
    id: 4,
    title: "Piept & Spate Acasă",
    category: "Piept & Brațe",
    duration: "15 min",
    calories: "250 kcal",
    difficulty: "Mediu",
    rating: 4.8,
    reviewsCount: 92,
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop",
    videoId: "_bpnk9mxDk0", // Pamela Reif - 15 Min Complete Upper Body
    recommended: false,
    reviews: [
      { user: "Robert C.", text: "Pompare maximă!", rating: 5 }
    ]
  },
  {
    id: 5,
    title: "Mobilitate & Stretching",
    category: "Full Body",
    duration: "6 min",
    calories: "50 kcal",
    difficulty: "Ușor",
    rating: 4.9,
    reviewsCount: 56,
    image: "https://images.unsplash.com/photo-1591291621164-2c6367723315?q=80&w=1000&auto=format&fit=crop",
    videoId: "uaQyf7dbAMM", // Pamela Reif - 6 Min Upper Body Mobility + Stretch
    recommended: false,
    reviews: [
      { user: "Ana M.", text: "Mă simt mult mai relaxată.", rating: 5 }
    ]
  },
  {
    id: 6,
    title: "Cardio Dance Fun",
    category: "Cardio",
    duration: "15 min",
    calories: "250 kcal",
    difficulty: "Mediu",
    rating: 4.8,
    reviewsCount: 210,
    image: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=1000&auto=format&fit=crop",
    videoId: "sVt9cqNheOE", // Noul link (Pamela Reif - 15 Min Sweaty Dance Workout)
    recommended: false,
    reviews: [
      { user: "Mihai V.", text: "Foarte distractiv, trece timpul repede!", rating: 5 }
    ]
  },
  {
    id: 7,
    title: "Brațe Tonifiate (Fără Greutăți)",
    category: "Piept & Brațe",
    duration: "15 min",
    calories: "150 kcal",
    difficulty: "Începător",
    rating: 4.6,
    reviewsCount: 115,
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1000&auto=format&fit=crop",
    videoId: "fQJ3ydfSAP0", // Pamela Reif - 15 Min Standing Arms
    recommended: false,
    reviews: [
      { user: "Larisa P.", text: "Ard brațele incredibil!", rating: 5 }
    ]
  },
  {
    id: 8,
    title: "Upper Body Dumbbell Crush",
    category: "Full Body",
    duration: "10 min",
    calories: "200 kcal",
    difficulty: "Avansat",
    rating: 5.0,
    reviewsCount: 89,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop",
    videoId: "GJiEUi92-xE", // Pamela Reif - 10 Min Upper Body + Weights
    recommended: true, 
    reviews: [
      { user: "Alex K.", text: "Un antrenament complet.", rating: 5 },
      { user: "George B.", text: "Ai nevoie de gantere serioase.", rating: 4 }
    ]
  },
  {
    id: 9,
    title: "Killer Sixpack Challenge",
    category: "Abdomen",
    duration: "10 min",
    calories: "150 kcal",
    difficulty: "Mediu",
    rating: 4.4,
    reviewsCount: 540,
    image: "https://static.nike.com/a/images/f_auto/dpr_1.0,cs_srgb/w_1212,c_limit/ac7671a0-c57c-417b-91d1-de7f6de6bf0b/7-trainer-approved-plank-variations.jpg",
    videoId: "xXeoKMS0OVM", // Pamela Reif - 10 Min Killer Sixpack
    recommended: false,
    reviews: [
      { user: "Cristina", text: "Cele mai lungi 10 minute din viața mea.", rating: 4 }
    ]
  },
  {
    id: 10,
    title: "Fese Bombate - Glute Focus",
    category: "Picioare",
    duration: "15 min",
    calories: "280 kcal",
    difficulty: "Mediu",
    rating: 4.9,
    reviewsCount: 312,
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1000&auto=format&fit=crop",
    videoId: "s3PR9pySd1E", // Pamela Reif - 15 Min Booty Workout Booty Band
    recommended: false,
    reviews: [
      { user: "Ioana S.", text: "Rezultate vizibile după 2 săptămâni!", rating: 5 },
      { user: "Maria", text: "Excelent.", rating: 5 }
    ]
  }
];

export default function AntrenamentePage() {
  const { userId } = useAuth();
  const { dailyStats } = useDashboardContext();
  const [selectedCategory, setSelectedCategory] = useState("Toate");
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [aiPlan, setAiPlan] = useState<AiPlan | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [breathConfig, setBreathConfig] = useState({ phase: 'Inspiră', time: 4, duration: 4 });
  const videoRef = useRef<HTMLVideoElement>(null);

  const filteredWorkouts = WORKOUTS.filter(w => 
    selectedCategory === "Toate" ? true : w.category === selectedCategory
  );

  const recommendedWorkout = filteredWorkouts.find(w => w.recommended) || filteredWorkouts[0];
  const otherWorkouts = filteredWorkouts.filter(w => w.id !== recommendedWorkout?.id);

  const handleOpenWorkout = async (workout: Workout) => {
    setSelectedWorkout(workout);
    
    if (workout.videoUrl || workout.videoId) return;

    setAiPlan(null); 
    setLoadingAi(true);

    try {
      const response = await fetch('/api/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: workout.category,
          difficulty: workout.difficulty,
          duration: workout.duration
        })
      });

      if (!response.ok) throw new Error("Eroare API");
      
      const data = await response.json();
      setAiPlan(data);
    } catch (error) {
      console.error(error);
      setAiPlan({ exercises: [], warmup: "Încălzire standard 5 min", cooldown: "Stretching ușor" });
    } finally {
      setLoadingAi(false);
    }
  };

  const handleFinishWorkout = async () => {
    if (!selectedWorkout) return;
    
    setIsSaving(true);

    const caloriesValue = parseInt(selectedWorkout.calories.replace(/\D/g, '')) || 0;
    
    await dailyStats.addExercise(selectedWorkout.title, caloriesValue);

    const newExercise = {
      date: new Date().toISOString().split('T')[0],
      calories_burned: caloriesValue,
      name: selectedWorkout.title,
      user_id: userId
    };
    const existingData = JSON.parse(localStorage.getItem('demo_exercises') || '[]');
    localStorage.setItem('demo_exercises', JSON.stringify([...existingData, newExercise]));

    alert(`Felicitări! Ai ars ${caloriesValue} kcal! 🔥`);
    
    setSelectedWorkout(null); 
    setAiPlan(null);
    setIsSaving(false);       
  };

  useEffect(() => {
    if (selectedWorkout && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.log("Autoplay prevented:", e));
      }
    }
  }, [selectedWorkout]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Logica pentru timer-ul de respirație (Metoda 4-7-8)
  useEffect(() => {
    if (!isRecoveryOpen) {
      setBreathConfig({ phase: 'Inspiră', time: 4, duration: 4 }); // Resetăm când se închide modalul
      return;
    }
    
    const interval = setInterval(() => {
      setBreathConfig(prev => {
        if (prev.time > 1) {
          return { ...prev, time: prev.time - 1 };
        } else {
          if (prev.phase === 'Inspiră') return { phase: 'Menține', time: 7, duration: 7 };
          if (prev.phase === 'Menține') return { phase: 'Expiră', time: 8, duration: 8 };
          return { phase: 'Inspiră', time: 4, duration: 4 };
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecoveryOpen]);

  return (
    <div className="p-6 md:p-10 min-h-screen text-white pb-32">
      
      {/* Header actualizat cu Panel Premium */}
      <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="w-full lg:w-2/3">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
            Sala de <span className="text-fuchsia-500">Antrenament</span>
          </h1>
          
          {/* PANELUL PREMIUM */}
          <div className="mt-4 flex items-start sm:items-center gap-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden group/panel transition-all hover:border-fuchsia-500/30 hover:shadow-[0_8px_30px_rgba(217,70,239,0.15)] w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-transparent pointer-events-none opacity-50 group-hover/panel:opacity-100 transition-opacity" />
            
            <div className="bg-fuchsia-500/20 p-2.5 rounded-xl border border-fuchsia-500/30 shrink-0 relative z-10 shadow-[inset_0_0_15px_rgba(217,70,239,0.2)]">
              <Dumbbell size={22} className="text-fuchsia-400" />
            </div>
            
            <p className="text-gray-300 font-medium text-sm sm:text-base leading-relaxed relative z-10">
              Alege zona pe care vrei să o lucrezi astăzi și lasă <span className="text-white font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">AI-ul</span> să îți genereze un plan perfect adaptat de <span className="inline-block mt-1 sm:mt-0 text-fuchsia-400 font-black uppercase tracking-widest text-[10px] sm:text-xs sm:mx-1 bg-fuchsia-500/10 px-2.5 py-1 rounded-lg border border-fuchsia-500/20 shadow-[0_0_10px_rgba(217,70,239,0.2)]">Antrenament</span>.
            </p>
          </div>
        </div>
        
        {/* Butonul Recuperare Cardiacă */}
        <button 
          onClick={() => setIsRecoveryOpen(true)}
          className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black px-6 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:-translate-y-1 transition-all shrink-0 h-fit"
        >
          <Wind className="animate-pulse" size={24} />
          <div className="text-left flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-emerald-200 leading-none mb-1">Recuperare Cardiacă</span>
            <span className="leading-none text-sm">RESPIRAȚIE (4-7-8)</span>
          </div>
        </button>
      </div>

      {/* Categorii */}
      <div className="flex gap-3 overflow-x-auto pb-6 mb-6 custom-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat 
                ? 'bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)]' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* RECOMANDAREA AI */}
      {recommendedWorkout && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 relative group cursor-pointer"
          onClick={() => handleOpenWorkout(recommendedWorkout)}
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-600 to-blue-600 rounded-[32px] blur opacity-40 group-hover:opacity-70 transition duration-500"></div>
          <div className="relative h-[400px] w-full rounded-[30px] overflow-hidden">
            <img src={recommendedWorkout.image} alt={recommendedWorkout.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-fuchsia-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  Recomandat de AI
                </span>
                <div className="flex items-center gap-1 text-yellow-400 bg-black/50 px-2 py-1 rounded-full backdrop-blur-md">
                  <Star size={14} fill="currentColor" />
                  <span className="text-xs font-bold">{recommendedWorkout.rating}</span>
                </div>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-black italic uppercase mb-4">{recommendedWorkout.title}</h2>
              
              <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-300 mb-6">
                <div className="flex items-center gap-2"><Clock size={18} className="text-fuchsia-500"/> {recommendedWorkout.duration}</div>
                <div className="flex items-center gap-2"><Flame size={18} className="text-orange-500"/> {recommendedWorkout.calories}</div>
                <div className="flex items-center gap-2"><Trophy size={18} className="text-yellow-500"/> {recommendedWorkout.difficulty}</div>
              </div>

              <button className="bg-white text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center gap-2">
                <Play size={20} fill="currentColor" /> Începe Antrenamentul
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* GRID ANTRENAMENTE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {otherWorkouts.map((workout, index) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleOpenWorkout(workout)}
            className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden hover:border-fuchsia-500/50 transition-all group cursor-pointer hover:shadow-[0_0_30px_rgba(217,70,239,0.15)]"
          >
            <div className="h-48 relative overflow-hidden">
              <img src={workout.image} alt={workout.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-yellow-400 text-xs font-bold">
                <Star size={12} fill="currentColor" /> {workout.rating}
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-xs font-bold text-fuchsia-500 uppercase tracking-wider mb-2">{workout.category}</div>
              <h3 className="text-xl font-bold mb-4 line-clamp-1">{workout.title}</h3>
              
              <div className="flex justify-between items-center text-gray-400 text-xs font-medium">
                <span className="flex items-center gap-1"><Clock size={14} /> {workout.duration}</span>
                <span className="flex items-center gap-1"><Flame size={14} /> {workout.calories}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* MODAL VIDEO & DETALII */}
      {mounted && createPortal(
        <AnimatePresence>
        {selectedWorkout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedWorkout(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a0a] w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row transition-all duration-500"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Partea Stângă: VIDEO PLAYER (Local) sau PLAN AI */}
              <div className="w-full md:w-2/3 bg-black relative flex flex-col justify-center overflow-hidden transition-all duration-500">
                {selectedWorkout.videoUrl || selectedWorkout.videoId ? (
                  <div className="relative w-full h-full flex">                     
                    <div className="relative transition-all duration-500 w-full h-full">
                      {selectedWorkout.videoId && !selectedWorkout.videoUrl ? (
                        <iframe 
                          width="100%" 
                          height="100%" 
                          src={`https://www.youtube.com/embed/${selectedWorkout.videoId}?autoplay=1&rel=0&controls=1`} 
                          title="YouTube video player" 
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                          className="w-full h-full object-contain bg-black"
                        ></iframe>
                      ) : (
                      <video
                        ref={videoRef}
                        src={selectedWorkout.videoUrl}
                        controls
                        autoPlay
                        loop
                        playsInline
                        className="w-full h-full object-contain bg-black"
                      /> 
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full p-8 overflow-y-auto custom-scrollbar bg-[#050505]">
                    {loadingAi ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-fuchsia-500 blur-xl opacity-20 animate-pulse"></div>
                          <Brain size={64} className="text-fuchsia-500 animate-bounce relative z-10" />
                        </div>
                        <h3 className="text-2xl font-black italic text-white">Generăm Antrenamentul...</h3>
                        <p className="text-gray-400 max-w-xs">Inteligența Artificială îți pregătește seturile și repetările pentru {selectedWorkout.title}.</p>
                      </div>
                    ) : aiPlan ? (
                      <div className="space-y-6">
                        <div className="bg-fuchsia-900/20 border border-fuchsia-500/30 p-4 rounded-2xl">
                          <h4 className="text-fuchsia-400 font-bold uppercase text-xs tracking-widest mb-1">Încălzire (Warmup)</h4>
                          <p className="text-white text-sm">{aiPlan.warmup}</p>
                        </div>
  
                        <div className="space-y-3">
                          <h4 className="text-white font-black uppercase text-lg flex items-center gap-2">
                            <Dumbbell className="text-fuchsia-500" /> Rutina Principală
                          </h4>
                          {aiPlan.exercises?.map((ex: Exercise, idx: number) => (
                            <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-start gap-4 hover:bg-white/10 transition-colors group">
                              <div className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-fuchsia-500 shrink-0 group-hover:bg-fuchsia-500 group-hover:text-white transition-colors">
                                {idx + 1}
                              </div>
                              <div>
                                <h5 className="font-bold text-white text-lg">{ex.name}</h5>
                                <div className="flex gap-3 text-sm text-gray-400 mt-1">
                                  <span className="bg-black/30 px-2 py-0.5 rounded text-xs border border-white/5">{ex.sets}</span>
                                  <span className="bg-black/30 px-2 py-0.5 rounded text-xs border border-white/5">{ex.reps}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 italic">💡 {ex.tips}</p>
                              </div>
                            </div>
                          ))}
                        </div>
  
                        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-2xl">
                          <h4 className="text-blue-400 font-bold uppercase text-xs tracking-widest mb-1">Relaxare (Cooldown)</h4>
                          <p className="text-white text-sm">{aiPlan.cooldown}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-red-400">Eroare la încărcare.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Partea Dreaptă: Detalii & Recenzii */}
              <div className="w-full md:w-1/3 flex flex-col h-[50vh] md:h-auto border-l border-white/10 transition-all duration-500">
                
                <div className="p-6 border-b border-white/10 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black italic uppercase leading-tight mb-1">{selectedWorkout.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{selectedWorkout.difficulty}</span>
                      <span>• {selectedWorkout.duration}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedWorkout(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-3 border-b border-white/10 divide-x divide-white/10 bg-white/5">
                  <div className="p-4 text-center">
                    <div className="text-fuchsia-500 font-black text-lg">{selectedWorkout.calories}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Ardere</div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-yellow-500 font-black text-lg flex justify-center items-center gap-1">
                      {selectedWorkout.rating} <Star size={12} fill="currentColor"/>
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Rating</div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-blue-500 font-black text-lg">{selectedWorkout.reviewsCount}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Recenzii</div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                    <MessageSquare size={14} /> Ce spun sportivii
                  </h4>
                  
                  <div className="space-y-4">
                    {selectedWorkout.reviews.length > 0 ? (
                      selectedWorkout.reviews.map((review, idx) => (
                        <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/5">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-sm text-white">{review.user}</span>
                            <div className="flex text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-gray-600" : ""} />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm italic">&quot;{review.text}&quot;</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-4 text-sm">
                        Fii primul care lasă o recenzie!
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-white/10 bg-black/20">
                  <button 
                    onClick={handleFinishWorkout}
                    disabled={isSaving}
                    className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <><Loader2 size={18} className="animate-spin" /> Salvăm...</>
                    ) : (
                      <><ThumbsUp size={18} /> Am terminat antrenamentul!</>
                    )}
                  </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}

      {/* MODAL RECUPERARE CARDIACĂ / RESPIRAȚIE */}
      {mounted && createPortal(
        <AnimatePresence>
          {isRecoveryOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
            >
              <div className="w-full h-full max-w-7xl max-h-[95vh] relative flex flex-col border border-white/10 shadow-2xl rounded-3xl overflow-hidden bg-[#030303] items-center justify-center">
                
                {/* Header Recuperare */}
                <div className="absolute top-6 left-0 z-50 bg-black/60 backdrop-blur-md pl-5 pr-6 py-4 rounded-r-2xl border-y border-r border-emerald-500/30 shadow-[5px_0_20px_rgba(16,185,129,0.2)]">
                  <h2 className="text-2xl font-black text-emerald-400 italic mb-1 uppercase tracking-widest flex items-center gap-3">
                    <Wind size={24} /> Recuperare Cardiacă
                  </h2>
                  <p className="text-gray-300 text-sm">Respiră profund pentru a-ți normaliza ritmul cardiac.</p>
                </div>

                {/* Close Button */}
                <button 
                  onClick={() => setIsRecoveryOpen(false)}
                  className="absolute top-6 right-6 z-50 bg-red-600/90 hover:bg-red-500 text-white px-6 py-3 rounded-full font-black uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center gap-2 backdrop-blur-md transition-all hover:scale-105 border border-white/20"
                >
                  <X size={20} /> Oprește
                </button>

                {/* Cercul de Respirație */}
                <div className="flex flex-col items-center justify-center w-full h-full relative">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                  
                  <motion.div
                    animate={{ 
                      scale: breathConfig.phase === 'Inspiră' ? 1.6 : breathConfig.phase === 'Expiră' ? 1 : 1.6
                    }}
                    transition={{ 
                      duration: breathConfig.phase === 'Menține' ? 0 : breathConfig.duration, 
                      ease: "easeInOut" 
                    }}
                    className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-emerald-500/10 border-[6px] border-emerald-500/40 flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.3)] relative z-10"
                  >
                    <div className="absolute inset-0 rounded-full bg-emerald-400/10 blur-xl animate-pulse" style={{ animationDuration: '3s' }}></div>
                    <div className="flex flex-col items-center justify-center relative z-20 text-white text-center">
                       <span className="text-2xl md:text-3xl font-black uppercase tracking-widest drop-shadow-md text-emerald-300">{breathConfig.phase}</span>
                       <span className="text-5xl md:text-7xl font-black mt-2 font-mono drop-shadow-lg">{breathConfig.time}s</span>
                    </div>
                  </motion.div>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-24 md:mt-32 text-gray-300 max-w-lg text-center text-sm md:text-base leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/10 relative z-10 shadow-2xl"
                  >
                    <strong className="text-emerald-400 block mb-2 text-lg uppercase tracking-wider">Tehnica 4-7-8</strong>
                    <span className="opacity-80">Inspiră profund pe nas timp de 4 secunde, menține respirația 7 secunde și expiră lent pe gură timp de 8 secunde. Repetă ciclul până simți că te-ai relaxat complet.</span>
                  </motion.p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}