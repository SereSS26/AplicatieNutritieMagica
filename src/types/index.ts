// types/index.ts

export type Meal = {
    id: string;
    user_id?: string;
    name: string;
    calories: number;
    protein: number;
    date?: string;
    created_at?: string; // Supabase returnează data creării ca string (ISO)
  };
  
  export type DailyStats = {
    id?: string;
    user_id?: string;
    date?: string;
    water_glasses: number;
  };
  
  export type Exercise = {
    id?: string;
    user_id?: string;
    name: string;
    date?: string;
    created_at?: string;
  };

  export interface HealthParameter {
  nume: string;
  valoare: string;
  unitate: string;
  interval_referinta: string;
  status: 'normal' | 'scazut' | 'ridicat';
  evolutie?: 'imbunatatire' | 'stagnare' | 'inrautatire' | 'necunoscut';
}

export interface HealthAnalysis {
  id: string;
  user_id: string;
  analysis_date: string;
  general_score: number;
  evolution_status: 'imbunatatire' | 'stagnare' | 'inrautatire';
  parameters_details: HealthParameter[];
  created_at?: string;
}