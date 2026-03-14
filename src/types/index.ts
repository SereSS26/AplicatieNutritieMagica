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