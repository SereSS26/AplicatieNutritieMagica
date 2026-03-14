"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Luăm userul curent din Supabase
    const fetchUser = async () => {
<<<<<<< HEAD
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
=======
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
>>>>>>> cf1ae22a259f9391ac1f0aa4377454bd986eaeaf
    };
    
    fetchUser();

    // Ascultăm dacă userul se loghează sau se deconectează
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { userId };
}