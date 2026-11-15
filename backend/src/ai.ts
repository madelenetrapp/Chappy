
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY saknas i .env");
}

const ai = new GoogleGenAI({ apiKey });

async function translateText(
  text: string,
  targetLanguage: string
): Promise<string | null> {

  try {
    const instruction = `Translate the text into ${targetLanguage}.
Return only the translation. Preserve the original meaning.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: text,
      config: {
        systemInstruction: instruction,
      },
    });

    return response.text ?? null;
  } catch (error) {

    const message: string =
      error instanceof Error ? error.message : String(error);

    console.error("Gemini translation faild:", message);
    return null;
  }
}

export { translateText }
