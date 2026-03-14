import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const foodName = body.food;

    if (!foodName) {
      return NextResponse.json({ error: "Numele mâncării lipsește" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Aici e magia: îi spunem AI-ului să returneze fix formatul de care avem nevoie în cod
    const prompt = `Estimează numărul total de calorii și gramele de proteine pentru următoarea masă/aliment: "${foodName}".
    Răspunde STRICT și DOAR cu un obiect JSON valid, fără absolut niciun alt text, fără explicații, fără markdown.
    Exemplu de răspuns pe care îl aștept: {"calories": 250, "protein": 15}`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();

    // AI-ul uneori pune ```json la început. Curățăm textul:
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    // Transformăm textul în date reale de JavaScript
    const nutritionData = JSON.parse(responseText);

    return NextResponse.json(nutritionData);
  } catch (error) {
    console.error("Eroare estimare nutriție:", error);
    return NextResponse.json(
      { error: "Nu am putut estima datele. Încearcă să introduci manual." }, 
      { status: 500 }
    );
  }
}