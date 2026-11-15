// Importerar Googles Gemini SDK
import { GoogleGenAI } from "@google/genai";

// hämtar API-nyckeln från miljövariabler
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY saknas i .env");
}

// Skapar Gemini-klienten.
const ai = new GoogleGenAI({ apiKey });

// skickar text till gemini och returnerar översättningen
async function translateText(
  text: string,
  targetLanguage: string
): Promise<string | null> {

  try {
    // anger hur gemini ska översätta meddelandet
    const instruction = `Translate the text into ${targetLanguage}.
Return only the translation. Preserve the original meaning.`;

    // skickar texten till gemini
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: text,
      config: {
        systemInstruction: instruction,
      },
    });

    // returnerar översättning eller null som svaret saknas
    return response.text ?? null;
  } catch (error) {

    // hanterar fel från gemini
    const message: string =
      error instanceof Error ? error.message : String(error);

    console.error("Gemini translation faild:", message);
    return null;
  }
}

export { translateText }