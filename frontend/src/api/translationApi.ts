import { translationSchema } from "../schemas/translationSchema";
import type { Translation } from "../schemas/translationSchema";

// hämtar backend adressen från miljövariabler
const API_URL = import.meta.env.VITE_API_URL;

// skickar text och valt språk till backend för översättning
async function translateMessage(
  text: string,
  targetLanguage: string,
): Promise<Translation> {

  // Skickar ett POST anrop till översättning endpoint
  const response = await fetch(`${API_URL}/api/translation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, targetLanguage })
  })

  // Kontrollerar om backend svarade med ett fel
  if (!response.ok) {
    throw new Error("Kunde inte översätta meddelandet");
  }

  // hämtar JSON svaret från backend
  const data: unknown = await response.json();

  // Validerar svaret med Zod-schemat
  const result = translationSchema.safeParse(data);

  // Kontrollerar om svaret har fel struktur
  if (!result.success) {
    throw new Error("Ogiltigt översättningssvar från backend");
  }
  // Returnerar den validerade översättningen
  return result.data;
}

// Exporterar funktionen så att andra filer kan använda den
export { translateMessage };