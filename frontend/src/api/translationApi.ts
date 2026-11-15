
import { translationSchema } from "../schemas/translationSchema";
import type { Translation } from "../schemas/translationSchema";

const API_URL = import.meta.env.VITE_API_URL;

async function translateMessage(
  text: string,
  targetLanguage: string,
): Promise<Translation> {

  const response = await fetch(`${API_URL}/api/translation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, targetLanguage })
  })

  if (!response.ok) {
    throw new Error("Kunde inte översätta meddelandet");
  }

  const data: unknown = await response.json();

  const result = translationSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Ogiltigt översättningssvar från backend");
  }
  return result.data;
}

export { translateMessage };
