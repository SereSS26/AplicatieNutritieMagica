"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Droplet, Dumbbell } from 'lucide-react';
import StatCard from '@/src/components/dashboard/StatCard';
import { useDashboardContext } from '@/src/context/DashboardContext';

interface Props {
  onOpenWorkout: () => void;
  onOpenWater: () => void;
}

export default function DashboardStatsGrid({ onOpenWorkout, onOpenWater }: Props) {
  const router = useRouter();
  const { dailyStats } = useDashboardContext();
  const { totalCalories, waterGlasses, todayWorkout, loading } = dailyStats;

  // Calculăm progresul pentru barele animate (maxim 100%)
  const calProgress = Math.min((totalCalories / 2500) * 100, 100);
  const waterProgress = Math.min((waterGlasses / 8) * 100, 100);
  const workoutProgress = todayWorkout !== "Fără antrenament" ? 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <StatCard 
        icon={<Flame size={24} className="text-orange-500" />} 
        title="Calorii Consumate" 
        value={loading ? "..." : totalCalories.toLocaleString('en-US')} 
        subtext="/ 2,500 kcal recomandate" 
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