"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Flame, Brain, TrendingUp, Apple } from 'lucide-react';

const bilete = [
  {
    id: 1,
    titlu: "Antrenament AI",
    descriere: "Rutine generate inteligent și adaptate la corpul tău.",
    icon: Flame,
    color: "from-orange-500 to-red-600",
    shadow: "shadow-orange-500/40",
    actionType: "link",
    href: "/dashboard/antrenamente",
    quote: "Singurul antrenament prost este cel pe care nu l-ai făcut."
  },
  {
    id: 2,
    titlu: "Nutriție Smart",
    descriere: "Calcul precis la gram pentru macros și calorii zilnice.",
    icon: Apple,
    color: "from-fuchsia-500 to-purple-600",
    shadow: "shadow-fuchsia-500/40",
    actionType: "link",
    href: "/dashboard/nutritie",
    quote: "Corpul tău este singurul loc în care vei trăi. Ai grijă de el."
  },
  {
    id: 3,
    titlu: "Analiză Progres",
    descriere: "Grafice detaliate și tracking pe termen lung.",
    icon: TrendingUp,
    color: "from-blue-500 to-cyan-600",
    shadow: "shadow-cyan-500/40",
    actionType: "link",
    href: "/dashboard/progres",
    quote: "Progresul zilnic mic duce la rezultate masive."
  },
  {
    id: 4,
    titlu: "Suport Premium",
    descriere: "Asistentul tău personal disponibil 24/7.",
    icon: Brain,
    color: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/40",
    actionType: "link",
    href: "/dashboard",
    quote: "Fiecare campion a avut pe cineva în colțul lui. Noi suntem aici."
  }
];

export default function RotatingTickets() {
  const router = useRouter();

  const handleTicketAction = (bilet: any) => {
    if (bilet.actionType === 'link') {
      router.push(bilet.href);
    }
  };

  return (
    <section className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Titlul Secțiunii cu intrare lină */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
            Pachetul <span className="text-fuchsia-600">VIP</span>
          </h2>
          <p className="text-gray-400 mt-4 font-medium">Tot ce ai nevoie pentru a-ți distruge limitele.</p>
        </motion.div>
        
        {/* Grid-ul (am scos perspectiva de aici pentru a nu deforma colțurile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {bilete.map((bilet, index) => (
            /* Containerul care dă efectul 3D independent pentru fiecare card + efectul de cascadă la scroll */
            <motion.div 
              key={bilet.id} 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              className="relative h-[320px] w-full group" 
              style={{ perspective: '1200px' }} // Perspectiva mărită pentru un 3D mai natural
            >
              
              <motion.div
                onClick={() => handleTicketAction(bilet)}
                className="w-full h-full relative cursor-pointer"
                initial={{ rotateY: 0 }}
                whileHover={{ rotateY: 180, scale: 1.02 }} // Scale puțin mai mic ca să pară mai greu/premium
                transition={{ 
                  duration: 0.8, // Timp puțin mai lung
                  type: "spring", 
                  stiffness: 100, // Am înmuiat arcul (era 260)
                  damping: 15,   // Am redus frânarea (era 20)
                  mass: 0.8      // Masa mai mică pentru o întoarcere mai iute, dar lină
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                
                {/* --- FAȚA BILETULUI --- */}
                <div 
                  className={`absolute inset-0 rounded-3xl p-6 bg-gradient-to-br ${bilet.color} flex flex-col items-center justify-center text-center shadow-2xl ${bilet.shadow} border border-white/20`}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <bilet.icon size={56} className="text-white mb-6 drop-shadow-lg" />
                  <h3 className="text-xl font-black text-white uppercase tracking-wider mb-3">{bilet.titlu}</h3>
                  <p className="text-white/90 text-sm font-medium">{bilet.descriere}</p>
                </div>

                {/* --- SPATELE BILETULUI --- */}
                <div 
                  className="absolute inset-0 rounded-3xl bg-[#0a0a0a] border border-fuchsia-500/30 flex flex-col items-center justify-center text-center shadow-xl overflow-hidden px-4"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  {/* Efect de lumină difuză */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${bilet.color} opacity-10 blur-2xl rounded-full scale-150`}></div>
                  
                  <div className="relative z-10 flex flex-col items-center w-full">
                    <span className="text-4xl font-black italic text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                      Q&K
                    </span>
                    <div className="w-12 h-px bg-white/20 my-4"></div>
                    
                    {/* Citatul Motivațional */}
                    <p className="text-gray-300 text-sm font-medium italic tracking-wide mb-4 text-center leading-relaxed">
                      "{bilet.quote}"
                    </p>
                    
                    {/* Indicație de click */}
                    <span className="text-fuchsia-400 text-xs font-semibold bg-white/5 px-3 py-1 rounded-full border border-white/10 animate-pulse mt-2">
                      Apasă pentru acces
                    </span>
                  </div>
                </div>

              </motion.div>
            </motion.div>
          ))}
          
        </div>
      </div>
    </section>
  );
}