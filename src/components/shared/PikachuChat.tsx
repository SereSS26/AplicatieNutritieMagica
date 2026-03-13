"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bot, User } from 'lucide-react';

export default function PikachuChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Mesajul inițial
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Pika-pi! ⚡ Sunt asistentul tău Queen&King Cardio. Vrei să știi câte calorii are o banană sau cum să faci un antrenament HIIT?' }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll la ultimul mesaj
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    // Afișăm imediat mesajul nostru
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      // Trimitem mesajul către "Creierul" nostru (ruta de API din Next.js)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await res.json();
      
      // Afișăm răspunsul de la Gemini
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Pika-eroare! Nu m-am putut conecta la server. ⚡" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col items-end">
      
      {/* Fereastra de Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="mb-4 w-80 sm:w-96 bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(217,70,239,0.15)] flex flex-col"
          >
            {/* Header Chat */}
            <div className="bg-fuchsia-600/10 border-b border-white/5 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="bg-fuchsia-600 p-1.5 rounded-full">
                  <Bot size={16} className="text-black" />
                </div>
                <span className="font-bold text-sm">PikaAI <span className="text-fuchsia-600">Antrenor</span></span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Zona de mesaje */}
            <div className="p-4 h-80 overflow-y-auto flex flex-col gap-3 text-sm">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-fuchsia-600 text-black rounded-tr-sm font-medium' 
                      : 'bg-white/10 text-white rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {/* Animație de tastare (Typing indicator) */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 text-gray-400 p-3 rounded-2xl rounded-tl-sm flex gap-1">
                    <span className="animate-bounce delay-100">.</span>
                    <span className="animate-bounce delay-200">.</span>
                    <span className="animate-bounce delay-300">.</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-white/5 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Întreabă-mă ceva..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-fuchsia-600/50 transition-colors"
              />
              <button 
                type="submit" 
                disabled={!input.trim()}
                className="bg-fuchsia-600 text-black p-2 rounded-xl hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Butonul Pikachu GIF care deschide/închide chatul */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative group cursor-pointer hover:scale-110 transition-transform focus:outline-none"
      >
        {/* Un mic indicator roșu (notificare) dacă chatul e închis */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-[#030303]"></span>
          </span>
        )}
        
        <Image 
          src="/gifs/pikachu.gif" 
          alt="Pikachu AI"
          width={80} 
          height={80} 
          className="drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]"
          unoptimized 
        />
      </button>

    </div>
  );
}