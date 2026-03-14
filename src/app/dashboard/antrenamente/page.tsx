"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Star, Clock, Flame, Trophy, X, MessageSquare, ThumbsUp, Loader2, Brain, Dumbbell, Camera, ScanLine } from 'lucide-react';
import PoseEstimationCanvas from '@/src/components/dashboard/PoseEstimationCanvas';
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

// --- DATE MOCKUP (Aici poți conecta baza de date Supabase mai târziu) ---
const CATEGORIES = ["Toate", "Full Body", "Cardio", "Picioare", "Piept & Brațe", "Abdomen"];

const WORKOUTS: Workout[] = [
  {
    id: 1,
    title: "HIIT Extrem - Ardere Grăsimi",
    category: "Cardio",
    duration: "20 min",
    calories: "350 kcal",
    difficulty: "Avansat",
    rating: 4.9,
    reviewsCount: 128,
    image: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?q=80&w=1000&auto=format&fit=crop",
    videoId: "ml6cT4AZdqI", // ID YouTube (Exemplu)
    // videoId: "ml6cT4AZdqI", <-- Ștergem sau ignorăm YouTube
    // videoUrl: "/videos/hiit_cardio.mp4", // <-- Comentăm asta ca să revină la YouTube
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
    duration: "45 min",
    calories: "400 kcal",
    difficulty: "Mediu",
    rating: 4.7,
    reviewsCount: 85,
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=1000&auto=format&fit=crop",
    videoUrl: "/genuflexiuni_corecte.mp4",
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
    videoId: "1f8yoFFdkcY",
    recommended: false,
    reviews: [
      { user: "Elena D.", text: "Scurt și la obiect.", rating: 5 },
      { user: "Radu M.", text: "Bun pentru dimineață.", rating: 4 }
    ]
  },
  {
    id: 4,
    title: "Piept Masiv Acasă",
    category: "Piept & Brațe",
    duration: "30 min",
    calories: "250 kcal",
    difficulty: "Mediu",
    rating: 4.8,
    reviewsCount: 92,
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop",
    videoId: "IODxDxX7oi4",
    recommended: false,
    reviews: [
      { user: "Robert C.", text: "Pompare maximă!", rating: 5 }
    ]
  },
  {
    id: 5,
    title: "Yoga pentru Mobilitate",
    category: "Full Body",
    duration: "25 min",
    calories: "100 kcal",
    difficulty: "Ușor",
    rating: 4.9,
    reviewsCount: 56,
    image: "https://images.unsplash.com/photo-1591291621164-2c6367723315?q=80&w=1000&auto=format&fit=crop",
    videoId: "v7AYKMP6rOE",
    recommended: false,
    reviews: [
      { user: "Ana M.", text: "Mă simt mult mai relaxată.", rating: 5 }
    ]
  },
  {
    id: 6,
    title: "Kickboxing Cardio Fun",
    category: "Cardio",
    duration: "30 min",
    calories: "450 kcal",
    difficulty: "Mediu",
    rating: 4.8,
    reviewsCount: 210,
    image: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=1000&auto=format&fit=crop",
    videoId: "lKKbeJXg8b0", // Exemplu ID
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
    videoId: "hAGfBjvIRFI",
    recommended: false,
    reviews: [
      { user: "Larisa P.", text: "Ard brațele incredibil!", rating: 5 }
    ]
  },
  {
    id: 8,
    title: "Full Body Dumbbell Crush",
    category: "Full Body",
    duration: "40 min",
    calories: "500 kcal",
    difficulty: "Avansat",
    rating: 5.0,
    reviewsCount: 89,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop",
    videoId: "W4eKVKwf3rQ",
    recommended: true, // Încă o recomandare posibilă
    reviews: [
      { user: "Alex K.", text: "Un antrenament complet.", rating: 5 },
      { user: "George B.", text: "Ai nevoie de gantere serioase.", rating: 4 }
    ]
  },
  {
    id: 9,
    title: "Plank Challenge - Core",
    category: "Abdomen",
    duration: "5 min",
    calories: "50 kcal",
    difficulty: "Mediu",
    rating: 4.4,
    reviewsCount: 540,
    image: "https://static.nike.com/a/images/f_auto/dpr_1.0,cs_srgb/w_1212,c_limit/ac7671a0-c57c-417b-91d1-de7f6de6bf0b/7-trainer-approved-plank-variations.jpg",
    videoId: "pSHjTRCQxIw",
    recommended: false,
    reviews: [
      { user: "Cristina", text: "Cele mai lungi 5 minute din viața mea.", rating: 4 }
    ]
  },
  {
    id: 10,
    title: "Fese Bombate - Glute Focus",
    category: "Picioare",
    duration: "25 min",
    calories: "280 kcal",
    difficulty: "Mediu",
    rating: 4.9,
    reviewsCount: 312,
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1000&auto=format&fit=crop",
    videoId: "pL8ZPAyXjM4",
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
  
  // Stare pentru AI Coach (Camera)
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [accuracyScore, setAccuracyScore] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Filtrare antrenamente
  const filteredWorkouts = WORKOUTS.filter(w => 
    selectedCategory === "Toate" ? true : w.category === selectedCategory
  );

  // Găsește recomandarea (primul antrenament 'recommended' din lista filtrată sau primul disponibil)
  const recommendedWorkout = filteredWorkouts.find(w => w.recommended) || filteredWorkouts[0];
  const otherWorkouts = filteredWorkouts.filter(w => w.id !== recommendedWorkout?.id);

  // Funcție pentru a deschide modalul și a genera antrenamentul
  const handleOpenWorkout = async (workout: Workout) => {
    setIsCameraOpen(false); // Resetăm camera la deschidere
    setSelectedWorkout(workout);
    
    // Dacă avem un video (Local sau YouTube), NU mai generăm planul AI.
    if (workout.videoUrl || workout.videoId) return;

    setAiPlan(null); // Resetăm planul vechi
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
      // Fallback simplu dacă pică AI-ul
      setAiPlan({ exercises: [], warmup: "Încălzire standard 5 min", cooldown: "Stretching ușor" });
    } finally {
      setLoadingAi(false);
    }
  };

  // Funcția de salvare în Supabase
  const handleFinishWorkout = async () => {
    if (!selectedWorkout) return;
    
    setIsSaving(true);

    const caloriesValue = parseInt(selectedWorkout.calories.replace(/\D/g, '')) || 0;
    
    // Salvăm antrenamentul în Dashboard (care va updata și baza de date și state-ul de pe prima pagină)
    await dailyStats.addExercise(selectedWorkout.title, caloriesValue);

    // --- SALVARE LOCALĂ (PENTRU DEMO CALENDAR) ---
    const newExercise = {
      date: new Date().toISOString().split('T')[0],
      calories_burned: caloriesValue,
      name: selectedWorkout.title,
      user_id: userId
    };
    const existingData = JSON.parse(localStorage.getItem('demo_exercises') || '[]');
    localStorage.setItem('demo_exercises', JSON.stringify([...existingData, newExercise]));

    alert(`Felicitări! Ai ars ${caloriesValue} kcal! 🔥`);
    
    setSelectedWorkout(null); // Închidem modalul
    setAiPlan(null);
    setIsSaving(false);       // Oprim spinner-ul
  };

  // Efect pentru a asigura că videoclipul pornește automat când se deschide modalul sau camera
  useEffect(() => {
    if (selectedWorkout && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.log("Autoplay prevented:", e));
      }
    }
  }, [selectedWorkout, isCameraOpen]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="p-6 md:p-10 min-h-screen text-white pb-32">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
          Sala de <span className="text-fuchsia-500">Antrenament</span>
        </h1>
        <p className="text-gray-400">Alege zona pe care vrei să o lucrezi astăzi.</p>
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
            className={`fixed inset-0 z-[200] flex items-center justify-center ${isCameraOpen ? 'p-0' : 'p-4'} bg-black/80 backdrop-blur-sm`}
            onClick={() => setSelectedWorkout(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`bg-[#0a0a0a] ${isCameraOpen ? 'w-full h-full rounded-none max-w-none max-h-none' : 'w-full max-w-5xl max-h-[90vh] rounded-3xl'} overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row transition-all duration-500`}
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Partea Stângă: VIDEO PLAYER (Local) sau PLAN AI */}
              <div className={`${isCameraOpen ? 'w-full h-full' : 'w-full md:w-2/3'} bg-black relative flex flex-col justify-center overflow-hidden transition-all duration-500`}>
                {/* Verificăm dacă avem Video Local SAU YouTube */}
                {selectedWorkout.videoUrl || selectedWorkout.videoId ? (
                  <div className="relative w-full h-full flex">
                    
                    {/* Buton Plutitor de Ieșire (Doar în Fullscreen) */}
                    {isCameraOpen && (
                      <button 
                        onClick={() => setIsCameraOpen(false)}
                        className="absolute top-6 right-6 z-50 bg-red-600/90 hover:bg-red-600 text-white px-5 py-2.5 rounded-full font-bold shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center gap-2 backdrop-blur-md transition-all hover:scale-105 border border-white/20"
                      >
                        <X size={18} /> Ieși din Modul Live
                      </button>
                    )}

                    {/* CONTAINER VIDEO (LOCAL SAU YOUTUBE) */}
                    <div className={`relative transition-all duration-500 ${isCameraOpen ? 'w-1/2 border-r border-white/10' : 'w-full'}`}>
                      
                      {/* A. Dacă e YouTube */}
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
                      /* B. Dacă e Video Local */
                      <video
                        ref={videoRef}
                        src={selectedWorkout.videoUrl}
                        controls={!isCameraOpen}
                        autoPlay
                        loop
                        playsInline
                        className="w-full h-full object-contain bg-black"
                      /> 
                      )}

                      {/* Label Video */}
                      {isCameraOpen && (
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-white border border-white/10">
                          ANTRENOR
                        </div>
                      )}
                    </div>
  
                    {/* WEBCAM USER (AI COACH) */}
                    {isCameraOpen && (
                      <div className="w-1/2 relative">
                        <PoseEstimationCanvas 
                          onAccuracyChange={setAccuracyScore} 
                          trainerVideoRef={videoRef} // Trimitem referința video-ului local către AI
                        />
                        {/* Overlay AI - HUD */}
                        <div className="absolute inset-0 pointer-events-none">
                          {/* Grid de scanare */}
                          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                          <div className="absolute top-4 right-4 bg-red-600/80 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-2 animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full"></div> LIVE
                          </div>
  
                          {/* Scorul de Acuratețe */}
                          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-3/4 bg-black/60 backdrop-blur-xl border border-fuchsia-500/30 rounded-2xl p-4">
                            <div className="flex justify-between items-end mb-2">
                              <span className="text-fuchsia-400 text-xs font-bold uppercase tracking-widest">Acuratețe Mișcare</span>
                              <span className="text-2xl font-black text-white">{accuracyScore}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                              <motion.div
                                animate={{ width: `${accuracyScore}%` }}
                                transition={{ type: "spring", stiffness: 50 }}
                                className={`h-full rounded-full ${accuracyScore > 90 ? 'bg-green-500' : accuracyScore > 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              />
                            </div>
                            <p className="text-center text-xs text-gray-300 mt-2 font-mono">
                              {accuracyScore > 85 
                                ? "EXCELENT! Menține ritmul." 
                                : accuracyScore > 60 
                                  ? "Bun, dar atenție la postură." 
                                  : "Corectează poziția! Nu te opri."}
                            </p>
                          </div>
  
                          {/* Linii de scanare decorative */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-white/10 rounded-3xl">
                            <ScanLine className="absolute top-4 left-4 text-fuchsia-500/50" size={24} />
                            <ScanLine className="absolute bottom-4 right-4 text-fuchsia-500/50 rotate-180" size={24} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Cazul 2: Nu avem video, folosim AI-ul */
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
              {!isCameraOpen && (
              <div className="w-full md:w-1/3 flex flex-col h-[50vh] md:h-auto border-l border-white/10 transition-all duration-500">
                
                {/* Header Modal */}
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

                {/* Buton Activare AI Coach */}
                <div className="px-6 pb-4">
                    <button 
                      onClick={() => setIsCameraOpen(!isCameraOpen)}
                      className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        isCameraOpen ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {isCameraOpen ? <><X size={16} /> Oprește Camera</> : <><Camera size={16} /> Analiză AI Live</>}
                    </button>
                </div>

                {/* Tab-uri / Statistici */}
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

                {/* Lista de Recenzii (Scrollable) */}
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

                {/* Footer Modal - Buton Acțiune */}
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
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}

    </div>
  );
}