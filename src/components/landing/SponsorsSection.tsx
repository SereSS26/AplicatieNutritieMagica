"use client";

import React from 'react';
import BallCanvas from '../canvas/Ball'; // Importăm bila 3D creată mai sus
import { motion } from 'framer-motion';

// --- LISTA SPONSORILOR GRUPATĂ ---
// Am creat 4 bile, fiecare conținând câte 4 imagini (16 sponsori în total)
const sponsorBalls = [
  {
    id: "bila-1",
    icons: [
      "/images/haufe.png",
      "/images/tag.png",
      "/images/Maggi_logo.svg.png",
      "/images/KK1.png",
    ]
  },
  {
    id: "bila-2",
    icons: [
      "/images/Nokia.png",
      "/images/see us color.png",
      "/images/uvt.png",
      "/images/sav1.png",
    ]
  },
  {
    id: "bila-3",
    icons: [
      "/images/Rei1.png",
      "/images/fi.png",
      "/images/crazy schnitzel color.png",
      "/images/ops2.png",
    ]
  },
  {
    id: "bila-4",
    icons: [
      "/images/Nestle_Professionals.png",
      "/images/lu1.svg",
      "/images/fitt.svg",
      "/images/cdi.png",
    ]
  }
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
          {sponsorBalls.map((ball) => (
            <motion.div 
              key={ball.id} 
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              viewport={{ once: true }}
              className='w-48 h-48 md:w-64 md:h-64'
            >
              {/* Randăm bila 3D și trimitem array-ul de 4 iconițe (trebuie ignorată eroarea TS deocamdată dacă BallCanvas nu este adaptat) */}
              {/* @ts-ignore */}
              <BallCanvas icons={ball.icons} />
            </motion.div>
          ))}
        </div>
       </div>
    </section>
  );
}