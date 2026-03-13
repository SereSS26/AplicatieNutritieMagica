import { createClient } from '@supabase/supabase-js';

// ACEST CLIENT ARE DREPTURI DEPLINE (ADMIN)
// Folosește-l doar în API Routes (Server Side), niciodată în componentele React (Client Side)!

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verificăm dacă avem variabilele de mediu necesare. Fără ele, API-ul de admin nu poate funcționa.
if (!supabaseUrl) {
  throw new Error('EROARE FATALĂ: Variabila de mediu NEXT_PUBLIC_SUPABASE_URL lipsește.');
}
if (!supabaseServiceKey) {
  throw new Error('EROARE FATALĂ: Variabila de mediu SUPABASE_SERVICE_ROLE_KEY lipsește. Adaug-o în fișierul .env.local și repornește serverul.');
}

export const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});