import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Inițializăm Gemini folosind cheia din environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const targetCalories = body.targetCalories || 2500;

    // Forțăm modelul să returneze un format JSON curat (specific lui Gemini)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    // Promptul strict pentru a asigura formatarea pentru interfața ta
    const prompt = `Generează un plan alimentar premium pe 7 zile în limba română cu zilele fix: "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică". 
    Targetul caloric este de aproximativ ${targetCalories} kcal pe zi. 
    Pentru fiecare zi, include fix 4 mese cu numele exact: "Mic Dejun", "Prânz", "Cină", "Gustare".
    Fiecare masă trebuie să conțină între 2 și 4 alimente variate, nu repeta aceleași mese zilnic.
    
    Returnează STRICT un array JSON valid care respectă structura TypeScript de mai jos:
    Array<{
      day: string;
      meals: Array<{
        name: string;
        foods: Array<{
          id: string; // Ex: "luni-micdejun-1"
          name: string; // Numele alimentului
          calories: number; // Număr întreg real
          protein: number; // Număr întreg real (grame)
          carbs: number; // Număr întreg real (grame)
          fat: number; // Număr întreg real (grame)
          amount: string; // Ex: "150g" sau "2 bucăți"
        }>
      }>
    }>`;

    const result = await model.generateContent(prompt);
    return NextResponse.json(JSON.parse(result.response.text()));
  } catch (error) {
    console.error("Eroare Gemini la generarea planului:", error);
    return NextResponse.json({ error: "Eroare la conectarea cu AI-ul." }, { status: 500 });
  }
}