import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Inițializăm Gemini cu cheia din .env.local
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = body.message;

    // Folosim modelul rapid și inteligent Gemini 1.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // AICI E SECRETUL: Promptul de sistem (Personalitatea)
    const prompt = `Ești Pikachu, un antrenor personal și nutriționist AI de elită pentru aplicația Queen&King Cardio. 
    Răspunzi mereu prietenos, energic și pui ocazional "Pika!" sau emoji-uri cu fulgere ⚡. 
    Oferi sfaturi corecte științific, scurte și la obiect despre sport, calorii, antrenamente și nutriție.
    Nu scrie texte kilometrice, fii concis.
    
    Întrebarea utilizatorului este: "${userMessage}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ reply: responseText });
  } catch (error) {
    console.error("Eroare Gemini:", error);
    return NextResponse.json(
      { reply: "Pika... am o problemă de conexiune ⚡ Încearcă din nou!" }, 
      { status: 500 }
    );
  }
}