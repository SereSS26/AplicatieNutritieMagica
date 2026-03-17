"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Droplet, Dumbbell } from 'lucide-react';
import StatCard from '@/src/components/dashboard/StatCard';
import { useDashboardContext } from '@/src/context/DashboardContext';
import { useUserGoals } from '@/src/hooks/useUserGoals'; // Noul nostru Hook

interface Props {
  onOpenWorkout: () => void;
}

export default function DashboardStatsGrid({ onOpenWorkout }: Props) {
  const router = useRouter();
  const { dailyStats } = useDashboardContext();
  const { totalCalories, waterGlasses, todayWorkout, loading, drinkWater, isSavingWater } = dailyStats;
  
  // Datele magice
  const { targetCalories, targetWater } = useUserGoals();

  const handleWaterClick = async () => {
    // Acum verificăm limita de apă personalizată, nu 8 standard!
    if (isSavingWater || waterGlasses >= targetWater) return;
    await drinkWater();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <StatCard 
        icon={<Flame className="text-orange-500" />} 
        title="Calorii Consumate" 
        value={loading ? "..." : totalCalories.toLocaleString('en-US')} 
        subtext={`/ ${targetCalories.toLocaleString('en-US')} kcal`} 
        onClick={() => router.push('/dashboard/nutritie')} 
      />
      <StatCard 
        icon={<Droplet className="text-cyan-500" />} 
        title="Hidratare" 
        value={loading ? "..." : `${(waterGlasses * 0.25).toFixed(1)}L`} 
        subtext={waterGlasses >= targetWater ? "Obiectiv atins! 💧" : `Apasa pt +1 pahar (${waterGlasses}/${targetWater})`} 
        onClick={handleWaterClick} 
      />
      <StatCard 
        icon={<Dumbbell className="text-purple-500" />} 
        title="Antrenament" 
        value={loading ? "..." : todayWorkout} 
        subtext={todayWorkout === "Fără antrenament" ? "Nu uita să te miști!" : "Completat azi"} 
        highlight={todayWorkout !== "Fără antrenament"} 
        onClick={onOpenWorkout} 
      />
    </div>
  );
}