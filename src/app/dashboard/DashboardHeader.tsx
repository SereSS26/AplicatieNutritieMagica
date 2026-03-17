"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';

// Opțional: dacă aveai componenta <UserProfile /> în dreapta, decomentează importul
// import UserProfile from '@/src/components/landing/UserProfile'; 

export default function DashboardHeader() {
  // Un salut implicit cât timp se încarcă datele
  const [greeting, setGreeting] = useState("Salut! ⚡");

  useEffect(() => {
    const fetchUserGreeting = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!profile) {
          const { data: fallbackProfile } = await supabase.from('users').select('*').eq('id', session.user.id).maybeSingle();
          if (fallbackProfile) profile = fallbackProfile;
        }

        const userMeta = session.user.user_metadata || {};
        
        // AICI ERA SECRETUL: citim "bărbat" sau "femeie", exact cum salvează pagina ta de profil!
        const rawGender = userMeta.gender ?? profile?.gender;
        const gender = rawGender ? String(rawGender).toLowerCase().trim() : '';
        
        // Extragem prenumele (primul cuvânt)
        const fullName = userMeta.full_name ?? userMeta.name ?? profile?.full_name ?? profile?.name ?? '';
        const firstName = fullName.split(' ')[0] || 'Prietene';

        // COMBINĂM TITLUL CU NUMELE TĂU (Ex: "Salut, Rege Artur! ⚡")
        if (gender === 'bărbat' || gender === 'm' || gender === 'masculin') {
          setGreeting(`Salut, Rege ${firstName}! ⚡`);
        } else if (gender === 'femeie' || gender === 'f' || gender === 'feminin') {
          setGreeting(`Salut, Queen ${firstName}! ⚡`);
        } else {
          setGreeting(`Salut, ${firstName}! ⚡`);
        }

      } catch (error) {
        console.error("Eroare la personalizarea salutului:", error);
      }
    };

    fetchUserGreeting();
  }, []);

  return (
    // Dacă aveai un flex aici pentru UserProfile, folosește <div className="flex justify-between items-end mb-10">
    <div className="flex justify-between items-end mb-10">
      <div>
        <p className="text-fuchsia-600 font-mono text-sm tracking-widest uppercase mb-1">
          {new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="text-4xl font-black italic tracking-tight text-white">{greeting}</h1>
      </div>

      {/* Dacă aveai avatarul în dreapta sus, îl pui aici. Dacă nu, poți șterge linia de mai jos */}
      {/* <UserProfile /> */}
    </div>
  );
}