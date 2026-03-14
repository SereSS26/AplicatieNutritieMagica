"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { Send, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// AICI ESTE MAGIA! ⚡
// Încărcăm Planeta 3D doar pe client (ssr: false) și doar în fundal (Lazy Loading)
const EarthCanvas = dynamic(() => import('../canvas/Earth'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-fuchsia-500/50">
      <Loader2 className="animate-spin w-8 h-8" />
      <span className="text-sm font-mono uppercase tracking-widest">Se inițializează 3D...</span>
    </div>
  )
});

export default function ContactSection() {
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    emailjs.send(
      'service_z2x7ww5',    
      'template_f84nlq1',   
      {
        from_name: form.name,
        to_name: 'Echipa Q&K Cardio',
        from_email: form.email,
        message: form.message,
      },
      '6ydEW5mOpyzUyaxgj'   
    ).then(() => {
      setLoading(false);
      alert('Mesajul a fost trimis cu succes! Îți vom răspunde în curând. ⚡');
      setForm({ name: '', email: '', message: '' });
    }).catch((error) => {
      setLoading(false);
      console.error(error);
      alert('A apărut o eroare la trimitere. Te rog încearcă din nou.');
    });
  };

  return (
    <section id="contact" className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative z-10 overflow-hidden">
      <div className="flex xl:flex-row flex-col-reverse gap-10 overflow-hidden">
        
        {/* PARTEA STÂNGĂ: FORMULARUL */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex-[0.75] bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-[0_0_40px_rgba(217,70,239,0.1)]"
        >
          <p className="text-gray-400 text-sm tracking-widest uppercase mb-2">Ai întrebări?</p>
          <h2 className="text-4xl md:text-5xl font-black mb-8 text-white">Contactează-ne.</h2>

          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
            <label className="flex flex-col">
              <span className="text-white font-medium mb-2">Numele tău</span>
              <input
                type="text" name="name" value={form.name} onChange={handleChange} placeholder="Cum te numești?"
                className="bg-white/5 border border-white/10 py-4 px-6 text-white rounded-xl outline-none focus:border-fuchsia-500 transition-colors"
                required
              />
            </label>
            <label className="flex flex-col">
              <span className="text-white font-medium mb-2">Adresa de Email</span>
              <input
                type="email" name="email" value={form.email} onChange={handleChange} placeholder="Unde îți putem răspunde?"
                className="bg-white/5 border border-white/10 py-4 px-6 text-white rounded-xl outline-none focus:border-fuchsia-500 transition-colors"
                required
              />
            </label>
            <label className="flex flex-col">
              <span className="text-white font-medium mb-2">Mesajul tău</span>
              <textarea
                rows={5} name="message" value={form.message} onChange={handleChange} placeholder="Cu ce te putem ajuta?"
                className="bg-white/5 border border-white/10 py-4 px-6 text-white rounded-xl outline-none focus:border-fuchsia-500 transition-colors resize-none"
                required
              />
            </label>

            <button
              type="submit" disabled={loading}
              className="bg-fuchsia-600 py-4 px-8 rounded-xl outline-none w-fit text-white font-bold shadow-md hover:bg-fuchsia-500 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Se trimite...' : 'Trimite Mesajul'}
              {!loading && <Send size={18} />}
            </button>
          </form>
        </motion.div>

        {/* PARTEA DREAPTĂ: PLANETA 3D */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="xl:flex-1 xl:h-auto md:h-[550px] h-[350px] relative"
        >
          {/* Componenta care se încarcă leneș (lazy) */}
          <EarthCanvas />
        </motion.div>
        
      </div>
    </section>
  );
}