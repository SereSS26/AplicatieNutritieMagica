"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';

export function useUserGoals() {
  const [targetCalories, setTargetCalories] = useState<number>(2500); // Default fallback
  const [targetProtein, setTargetProtein] = useState<number>(160);
  const [targetWater, setTargetWater] = useState<number>(8); // 8 pahare default
  const [loadingGoals, setLoadingGoals] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserGoal = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Dacă nu e logat (ex: pe landing page ca vizitator), lăsăm valorile default
        if (!session?.user) {
          setLoadingGoals(false);
          return;
        }

        // Căutăm datele în baza de date
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
        
        const rawWeight = userMeta.weight ?? profile?.current_weight ?? profile?.weight ?? 75;
        const rawHeight = userMeta.height ?? profile?.height ?? 170;
        const rawAge = userMeta.age ?? profile?.age ?? 30;
        
        const weight = parseFloat(String(rawWeight)) || 75;
        const height = parseFloat(String(rawHeight)) || 170;
        const age = parseInt(String(rawAge)) || 30;
        
        const gender = String(userMeta.gender ?? profile?.gender ?? 'masculin').toLowerCase();
        const activityLevel = String(userMeta.activity_level ?? profile?.activity_level ?? 'sedentar').toLowerCase();
        const goal = String(userMeta.goal ?? profile?.goal ?? 'mentinere').toLowerCase();

        // 1. Calcul BMR
        let bmr = (10 * weight) + (6.25 * height) - (5 * age);
        bmr = (gender.includes('masculin') || gender === 'm') ? bmr + 5 : bmr - 161;

        // 2. Multiplicator Activitate
        let multiplier = 1.2;
        if (activityLevel.includes('usor') || activityLevel.includes('ușor')) multiplier = 1.375;
        else if (activityLevel.includes('moderat')) multiplier = 1.55;
        else if (activityLevel.includes('foarte') || activityLevel.includes('activ')) multiplier = 1.725;

        // 3. Calcul TDEE și Ajustare Obiectiv
        let calculatedTdee = Math.round(bmr * multiplier);
        if (goal.includes('slabi') || goal.includes('slăbi') || goal.includes('pierd')) calculatedTdee -= 500;
        else if (goal.includes('masa') || goal.includes('masă') || goal.includes('muscul') || goal.includes('cres')) calculatedTdee += 300;

        const finalCalories = userMeta.calorie_goal ? parseInt(String(userMeta.calorie_goal)) : calculatedTdee;
        
        // 4. Setăm stările
        setTargetCalories(finalCalories);
        setTargetProtein(Math.round((finalCalories * 0.3) / 4)); // aprox 30% din calorii din proteine
        
        // Apă: aprox 35ml per kg corp. Un pahar = 250ml
        const waterGlasses = Math.round((weight * 35) / 250);
        setTargetWater(waterGlasses);

      } catch (error) {
        console.error("Eroare la preluarea obiectivelor:", error);
      } finally {
        setLoadingGoals(false);
      }
    };

    fetchUserGoal();
  }, []);

  return { targetCalories, targetProtein, targetWater, loadingGoals };
}