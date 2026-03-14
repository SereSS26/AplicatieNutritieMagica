"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import Image from 'next/link'; // Folosim tag-ul img clasic pentru simplitate aici

// Aici adăugăm câmpul 'image' cu calea către poza din folderul public
const testimonials = [
  {
    id: 1,
    name: "Alexandru M.",
    role: "Utilizator Premium",
    text: "Pikachu AI-ul este absolut genial! Îmi estimează caloriile instantaneu și m-a ajutat să scap de 5kg în prima lună, fără să mă înfometez.",
    rating: 5,
    image: "/images/testimonial_1.png" // Pune '/nume-poza.jpg' sau lasă gol ("") dacă nu ai poză
  },
  {
    id: 2,
    name: "Elena G.",
    role: "Sportiv Amator",
    text: "Designul este senzațional. E prima aplicație de fitness pe care chiar îmi face plăcere să o deschid în fiecare zi. O recomand din suflet!",
    rating: 5,
    image: "/images/testimonial_2.png" 
  },
  {
    id: 3,
    name: "Mihai D.",
    role: "Utilizator Pro",
    text: "Integrarea cu inteligența artificială pentru calculul nutrițional m-a salvat de ore întregi de căutat pe net. Este pur și simplu viitorul!",
    rating: 5,
    image: "/images/testimonial_3.png"
  }
];

export default function TestimonialsSection() {
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
    </section>
  );
}