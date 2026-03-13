"use client";

import React from 'react';
import BallCanvas from '../canvas/Ball'; // Importăm bila 3D creată mai sus
import { motion } from 'framer-motion';

// --- LISTA SPONSORILOR ---
// AICI TREBUIE SĂ PUI CĂILE CĂTRE IMAGINILE TALE REALE DIN FOLDERUL PUBLIC
const sponsors = [
  { name: "Sponsor 1", icon: "/images/haufe.png" }, // Ex: /sponsors/google.png
  { name: "Sponsor 2", icon: "/images/Nokia.png" },
  { name: "Sponsor 3", icon: "/images/oncegen.png" },
  { name: "Sponsor 4", icon: "/images/pebune.png" },
  // Poți adăuga oricâți dorești
];

export default function SponsorsSection() {
  return (
    <section className="py-24 relative z-10">
       <div className="max-w-7xl mx-auto px-6">
         {/* Titlul Secțiunii */}
         <motion.div 
           initial={{ opacity: 0, y: -20 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           viewport={{ once: true }}
           className="text-center mb-20"
         >
          <p className="text-fuchsia-500 font-mono text-sm tracking-widest uppercase mb-2 flex items-center justify-center gap-2">
             Partenerii Noștri
          </p>
          <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
            Sponsori <span className="text-fuchsia-600">&</span> Susținători
          </h2>
        </motion.div>

        {/* Grid-ul cu Bilele 3D */}
        <div className='flex flex-wrap justify-center gap-10'>
          {sponsors.map((sponsor) => (
            <motion.div 
              key={sponsor.name} 
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              viewport={{ once: true }}
              className='w-48 h-48 md:w-64 md:h-64'
            >
              {/* Randăm bila 3D pentru fiecare sponsor */}
              <BallCanvas icon={sponsor.icon} />
              
              {/* Opțional: Numele sponsorului sub bilă */}
              {/* <p className="text-center text-gray-400 text-sm mt-2">{sponsor.name}</p> */}
            </motion.div>
          ))}
        </div>
       </div>
    </section>
  );
}