import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, difficulty, duration } = body;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Acționează ca un antrenor de fitness expert. Creează un plan de antrenament detaliat pentru categoria "${category}", nivel "${difficulty}", durată aproximativă "${duration}".
      
      Răspunde STRICT cu un obiect JSON valid (fără markdown, fără \`\`\`json), care să conțină o listă de exerciții.
      Formatul trebuie să fie exact așa, folosind ID-uri simple în engleză pentru exerciții comune (ex: jumping_jacks, push_ups, squats, lunges, crunches, leg_raises, burpees, high_knees, plank):
      {
        "exercises": [
          { "id": "exercise_id_in_english", "name": "Nume Exercițiu", "reps": "12 repetări", "sets": "3 seturi", "tips": "Sfat scurt de execuție" }
        ],
        "warmup": "O frază scurtă despre încălzire",
        "cooldown": "O frază scurtă despre relaxare"
      }
      Generează minim 5 exerciții. Totul în limba Română.
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();

    // Curățăm formatarea markdown dacă AI-ul o pune
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    const workoutPlan = JSON.parse(responseText);

    return NextResponse.json(workoutPlan);
  } catch (error) {
    console.error("Eroare generare antrenament:", error);
    return NextResponse.json(
      { error: "Nu am putut genera antrenamentul." }, 
      { status: 500 }
    );
  }
}