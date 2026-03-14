"use client";

<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, MessageSquarePlus, X, Send, CheckCircle2, Loader2, User } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';

interface Testimonial {
  id: string | number;
  name: string;
  role: string;
  text: string;
  rating: number;
  image?: string;
}

const HARDCODED_TESTIMONIALS: Testimonial[] = [
  {
    id: 'h1',
=======
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import Image from 'next/link'; // Folosim tag-ul img clasic pentru simplitate aici

// Aici adăugăm câmpul 'image' cu calea către poza din folderul public
const testimonials = [
  {
    id: 1,
>>>>>>> cf1ae22a259f9391ac1f0aa4377454bd986eaeaf
    name: "Alexandru M.",
    role: "Utilizator Premium",
    text: "Pikachu AI-ul este absolut genial! Îmi estimează caloriile instantaneu și m-a ajutat să scap de 5kg în prima lună, fără să mă înfometez.",
    rating: 5,
<<<<<<< HEAD
    image: "/images/testimonial_1.png" 
  },
  {
    id: 'h2',
=======
    image: "/images/testimonial_1.png" // Pune '/nume-poza.jpg' sau lasă gol ("") dacă nu ai poză
  },
  {
    id: 2,
>>>>>>> cf1ae22a259f9391ac1f0aa4377454bd986eaeaf
    name: "Elena G.",
    role: "Sportiv Amator",
    text: "Designul este senzațional. E prima aplicație de fitness pe care chiar îmi face plăcere să o deschid în fiecare zi. O recomand din suflet!",
    rating: 5,
    image: "/images/testimonial_2.png" 
  },
  {
<<<<<<< HEAD
    id: 'h3',
=======
    id: 3,
>>>>>>> cf1ae22a259f9391ac1f0aa4377454bd986eaeaf
    name: "Mihai D.",
    role: "Utilizator Pro",
    text: "Integrarea cu inteligența artificială pentru calculul nutrițional m-a salvat de ore întregi de căutat pe net. Este pur și simplu viitorul!",
    rating: 5,
    image: "/images/testimonial_3.png"
  }
];

export default function TestimonialsSection() {
<<<<<<< HEAD
  const [displayTestimonials, setDisplayTestimonials] = useState<Testimonial[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    checkUser();
    fetchAndShuffleTestimonials();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchAndShuffleTestimonials = async () => {
    const { data: realData } = await supabase.from('testimonials').select('*');
    
    let allPool: Testimonial[] = [...HARDCODED_TESTIMONIALS];
    if (realData && realData.length > 0) {
      allPool = [...realData, ...HARDCODED_TESTIMONIALS];
    }

    const shuffled = [...allPool].sort(() => 0.5 - Math.random());
    setDisplayTestimonials(shuffled.slice(0, 3));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (rating === 0) return alert("Te rugăm să acorzi o notă!");
    
    setIsSubmitting(true);
    const { error } = await supabase
      .from('testimonials')
      .insert([{ 
        name: currentUser.user_metadata.full_name || currentUser.email.split('@')[0], 
        text: reviewText, 
        rating, 
        role: 'Membru Comunitate',
        image: currentUser.user_metadata.avatar_url || ''
      }]);

    if (error) {
      alert("Eroare: " + error.message);
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
      setIsSuccess(true);
      fetchAndShuffleTestimonials();
      setTimeout(() => {
        setIsModalOpen(false);
        setTimeout(() => {
          setIsSuccess(false);
          setRating(0);
          setReviewText('');
        }, 500);
      }, 2000);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative z-10 mt-12 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
        <h2 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tight italic">
          Vocea <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-purple-400">Comunității</span>
        </h2>
      </motion.div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {displayTestimonials.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 backdrop-blur-xl hover:border-fuchsia-500/40 transition-all duration-500 group relative flex flex-col justify-between shadow-2xl"
            >
              <div className="absolute -top-4 -right-4 bg-[#0a0a0a] border border-white/10 p-3.5 rounded-2xl text-fuchsia-500 group-hover:scale-110 transition-all shadow-2xl rotate-12 group-hover:rotate-0">
                <Quote size={20} className="fill-current" />
              </div>
              
              <div className="mb-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < t.rating ? "currentColor" : "none"} className={i < t.rating ? "text-fuchsia-500" : "text-gray-700"} />
                  ))}
                </div>
                <p className="text-gray-200 font-medium italic leading-relaxed text-base">"{t.text}"</p>
              </div>
              
              <div className="flex items-center gap-4 border-t border-white/5 pt-6 mt-auto">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/10 shrink-0">
                  {t.image ? <img src={t.image} alt={t.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-fuchsia-600 to-purple-700 flex items-center justify-center text-white font-black text-xl">{t.name.charAt(0)}</div>}
                </div>
                <div>
                  <h4 className="text-white font-black text-sm uppercase">{t.name}</h4>
                  <p className="text-gray-500 text-[10px] font-bold uppercase">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {currentUser && (
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-20 flex justify-center">
          <button onClick={() => setIsModalOpen(true)} className="group relative px-10 py-5 rounded-2xl font-black text-white uppercase tracking-[0.2em] text-xs transition-all duration-500 active:scale-95">
            <span className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-2xl blur-md opacity-40 group-hover:opacity-100" />
            <span className="absolute inset-0 bg-[#0a0a0a] border border-white/10 rounded-2xl group-hover:border-fuchsia-500/50" />
            <span className="relative flex items-center gap-3">
              <MessageSquarePlus size={18} className="text-fuchsia-500" />
              Spune-ți Povestea
            </span>
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="absolute inset-0" onClick={() => !isSubmitting && setIsModalOpen(false)} />
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-[#050505] border border-white/10 rounded-[40px] p-8 md:p-12 w-full max-w-xl relative shadow-2xl z-10">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white"><X size={28} /></button>
              {isSuccess ? (
                <div className="flex flex-col items-center text-center py-10">
                  <div className="bg-fuchsia-500/20 p-6 rounded-full border border-fuchsia-500/30 mb-8 animate-bounce"><CheckCircle2 size={60} className="text-fuchsia-400" /></div>
                  <h3 className="text-4xl font-black text-white italic tracking-tighter">Impact Trimis!</h3>
                </div>
              ) : (
                <>
                  <h3 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter mb-10 text-center">Salut, <span className="text-fuchsia-500">{currentUser?.user_metadata?.full_name || currentUser?.email.split('@')[0]}</span>!</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-8">
                    <div className="flex flex-col items-center bg-white/[0.02] border border-white/5 rounded-[24px] p-8">
                      <div className="flex gap-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}>
                            <Star size={40} className={`transition-all duration-300 ${star <= (hoverRating || rating) ? 'text-fuchsia-500 fill-fuchsia-500 drop-shadow-[0_0_15px_#d946ef]' : 'text-gray-800'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea required value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Cum te-a ajutat Queen&King Cardio?" rows={4} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-white focus:border-fuchsia-500 outline-none resize-none" />
                    <button type="submit" disabled={isSubmitting} className="w-full relative bg-fuchsia-600 py-5 font-black text-white uppercase tracking-[0.2em] rounded-2xl transition-all flex justify-center items-center gap-3">
                      {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <><Send size={18} /> Publică Review</>}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
=======
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70 } }
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative z-10 mt-12">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-black mb-4 text-white tracking-tight">
          Ce spun <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-purple-400">Campionii</span> noștri
        </h2>
        <p className="text-gray-400 text-lg font-light max-w-2xl mx-auto">
          Nu ne crede pe cuvânt. Iată ce spun cei care și-au transformat deja corpul cu Queen&King Cardio.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {testimonials.map((t) => (
          <motion.div
            key={t.id}
            variants={itemVariants}
            className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md hover:border-fuchsia-500/30 transition-all duration-300 group relative flex flex-col justify-between"
          >
            <div>
              <div className="absolute -top-5 -right-5 bg-black border border-white/10 p-3 rounded-full text-fuchsia-500 group-hover:scale-110 group-hover:bg-fuchsia-600/20 transition-all duration-300 shadow-xl">
                <Quote size={20} className="fill-current" />
              </div>
              
              <div className="flex gap-1 mb-6 text-fuchsia-500">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              
              <p className="text-gray-300 mb-8 font-light italic leading-relaxed min-h-[96px]">
                "{t.text}"
              </p>
            </div>
            
            {/* Profilul utilizatorului (Cu suport pentru poză!) */}
            <div className="flex items-center gap-4 mt-auto">
              
              {/* Logica: Dacă are imagine, o arată. Dacă nu, arată inițiala numelui */}
              {t.image ? (
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-fuchsia-500/30 shadow-lg shrink-0">
                  <img 
                    src={t.image} 
                    alt={`Poza lui ${t.name}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Dacă poza nu e găsită, ascundem img-ul pentru a nu arăta iconița de eroare a browserului
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-fuchsia-600 to-blue-600 flex items-center justify-center font-bold text-white text-lg shadow-lg shrink-0">
                  {t.name.charAt(0)}
                </div>
              )}

              <div>
                <h4 className="text-white font-bold text-sm md:text-base">{t.name}</h4>
                <p className="text-gray-500 text-xs md:text-sm">{t.role}</p>
              </div>
            </div>
            
          </motion.div>
        ))}
      </motion.div>
>>>>>>> cf1ae22a259f9391ac1f0aa4377454bd986eaeaf
    </section>
  );
}