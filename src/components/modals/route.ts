import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Utilizator lipsă.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configurația Supabase lipsește din mediul de stocare.');
    }

    const safeSupabaseUrl = supabaseUrl.includes('localhost') ? supabaseUrl.replace('localhost', '127.0.0.1') : supabaseUrl;
    const supabase = createClient(safeSupabaseUrl, supabaseKey);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

    // Prelevăm ultima analiză medicală a utilizatorului
    const { data: analysis } = await supabase
      .from('health_analyses')
      .select('parameters_details')
      .eq('user_id', userId)
      .order('analysis_date', { ascending: false })
      .limit(1)
      .single();

    let healthContext = "Utilizatorul nu are analize medicale înregistrate recent în sistem. Recomandă-i o masă generală foarte sănătoasă și echilibrată, bogată în proteine.";

    if (analysis && analysis.parameters_details) {
      // Filtrăm doar parametrii care sunt în afara limitelor (cu probleme)
      const badParams = analysis.parameters_details.filter((p: any) => p.status === 'scazut' || p.status === 'ridicat');

      if (badParams.length > 0) {
        const paramsString = badParams.map((p: any) => `- ${p.nume}: nivel ${p.status} (${p.valoare} ${p.unitate})`).join('\n');
        healthContext = `Atenție! Utilizatorul are următoarele analize medicale în afara limitelor normale:\n${paramsString}\n
REGULI STRICTE DE GENERAȚIE CLINICĂ (Nerespectarea lor este periculoasă pentru sănătate):
- Dacă are glicemie, glucoză sau hemoglobină glicozilată ridicată: EXCLUDE total zahărul, dulciurile și limitează drastic carbohidrații simpli (pâine albă, paste).
- Dacă are colesterol sau trigliceride ridicate: EXCLUDE prăjelile, carnea grasă, fast-food-ul și untul. Recomandă DOAR grăsimi sănătoase (avocado, pește, ulei de măsline crud).
- Dacă are acid uric ridicat: Evită carnea roșie și fructele de mare.
- Dacă are carențe (ex: fier, calciu, magneziu, vitamine scăzute): Obligatoriu include ingrediente de top bogate în aceste elemente (ex: spanac/ficat pentru fier, lactate/migdale pentru calciu).

Acționează ca un medic nutriționist de top. Recomandă o masă principală care CORECTEAZĂ exact aceste probleme și RESPECTĂ cu strictețe interdicțiile. Fii creativ, alege ceva delicios și realist, și explică clar de ce ai exclus anumite lucruri și de ce le-ai ales pe celelalte.`;
      } else {
        healthContext = "Toate analizele medicale recente ale utilizatorului sunt în limite perfect normale! Recomandă-i o masă delicioasă, echilibrată și bogată în proteine pentru a-și menține starea excelentă de sănătate.";
      }
    }

    const prompt = `
    ${healthContext}

    Returnează STRICT un obiect JSON valid, fără niciun alt text explicativ înainte sau după (fără marcaje markdown de tip \`\`\`json).

    Structura obligatorie a JSON-ului:
    {
      "name": "<Numele mesei, ex: Salată cu spanac, quinoa și somon la grătar>",
      "calories": <număr întreg, estimarea caloriilor totale (între 300 și 800)>,
      "protein": <număr întreg, estimarea cantității de proteine în grame>,
      "explanation": "<2-3 propoziții care explică clar cum ingredientele din această masă interacționează cu analizele lui proaste pentru a le regla>"
    }
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    try {
      const cleanJsonText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const mealData = JSON.parse(cleanJsonText);
      return NextResponse.json({ success: true, meal: mealData });
    } catch (parseError) {
      console.error('Eroare la parsarea JSON-ului generat:', responseText);
      return NextResponse.json({ success: false, error: 'AI-ul a generat un format invalid.' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Eroare API /recommend-meal:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}