"use client";

<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
=======
import React from 'react';
>>>>>>> cf1ae22a259f9391ac1f0aa4377454bd986eaeaf
import { useRouter } from 'next/navigation';
import { Flame, Droplet, Dumbbell } from 'lucide-react';
import StatCard from '@/src/components/dashboard/StatCard';
import { useDashboardContext } from '@/src/context/DashboardContext';
<<<<<<< HEAD
import { supabase } from '@/src/lib/supabase';
=======
>>>>>>> cf1ae22a259f9391ac1f0aa4377454bd986eaeaf

interface Props {
  onOpenWorkout: () => void;
  onOpenWater: () => void;
}

export default function DashboardStatsGrid({ onOpenWorkout, onOpenWater }: Props) {
  const router = useRouter();
  const { dailyStats } = useDashboardContext();
  const { totalCalories, waterGlasses, todayWorkout, loading } = dailyStats;
<<<<<<< HEAD
  const [targetCalories, setTargetCalories] = useState<number>(2500);

  useEffect(() => {
    const fetchUserGoal = async () => {
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
        
        const rawWeight = userMeta.weight ?? profile?.current_weight ?? profile?.weight ?? 75;
        const rawHeight = userMeta.height ?? profile?.height ?? 170;
        const rawAge = userMeta.age ?? profile?.age ?? 30;
        
        const weight = parseFloat(String(rawWeight)) || 75;
        const height = parseFloat(String(rawHeight)) || 170;
        const age = parseInt(String(rawAge)) || 30;
        
        const gender = String(userMeta.gender ?? profile?.gender ?? 'masculin').toLowerCase();
        const activityLevel = String(userMeta.activity_level ?? profile?.activity_level ?? 'sedentar').toLowerCase();

        let bmr = (10 * weight) + (6.25 * height) - (5 * age);
        bmr = (gender.includes('masculin') || gender === 'm') ? bmr + 5 : bmr - 161;

        let multiplier = 1.2;
        if (activityLevel.includes('usor') || activityLevel.includes('ușor')) multiplier = 1.375;
        else if (activityLevel.includes('moderat')) multiplier = 1.55;
        else if (activityLevel.includes('foarte') || activityLevel.includes('activ')) multiplier = 1.725;

        const calculatedTdee = Math.round(bmr * multiplier);
        const userCalorieGoal = userMeta.calorie_goal ? parseInt(String(userMeta.calorie_goal)) : calculatedTdee;
        
        setTargetCalories(userCalorieGoal);
      } catch (error) {
        console.error("Eroare la preluarea obiectivului caloric:", error);
      }
    };

    fetchUserGoal();
  }, []);

  // Calculăm progresul pentru barele animate (maxim 100%)
  const calProgress = Math.min((totalCalories / targetCalories) * 100, 100);
=======

  // Calculăm progresul pentru barele animate (maxim 100%)
  const calProgress = Math.min((totalCalories / 2500) * 100, 100);
>>>>>>> cf1ae22a259f9391ac1f0aa4377454bd986eaeaf
  const waterProgress = Math.min((waterGlasses / 8) * 100, 100);
  const workoutProgress = todayWorkout !== "Fără antrenament" ? 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <StatCard 
        icon={<Flame size={24} className="text-orange-500" />} 
        title="Calorii Consumate" 
        value={loading ? "..." : totalCalories.toLocaleString('en-US')} 
<<<<<<< HEAD
        subtext={`/ ${targetCalories.toLocaleString('en-US')} kcal recomandate`} 
=======
        subtext="/ 2,500 kcal recomandate" 
>>>>>>> cf1ae22a259f9391ac1f0aa4377454bd986eaeaf
        progress={calProgress}
        onClick={() => router.push('/dashboard/nutritie')} 
      />
      <StatCard 
        icon={<Droplet size={24} className="text-cyan-500" />} 
        title="Hidratare" 
        value={loading ? "..." : `${(waterGlasses * 0.25).toFixed(1)}L`} 
        subtext={waterGlasses >= 8 ? "Obiectiv atins! 💧" : `Apasă pt detalii (${waterGlasses}/8)`} 
        progress={waterProgress}
        onClick={onOpenWater} 
      />
      <StatCard 
        icon={<Dumbbell size={24} className="text-purple-500" />} 
        title="Antrenament" 
        value={loading ? "..." : todayWorkout} 
        subtext={todayWorkout === "Fără antrenament" ? "Nu uita să te miști!" : "Obiectiv completat azi"} 
        highlight={todayWorkout !== "Fără antrenament"} 
        progress={workoutProgress}
        onClick={onOpenWorkout} 
      />
    </div>
  );
}