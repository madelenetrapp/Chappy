import { chatSchema } from "../schemas/chatSchema";
import type { Chat } from "../schemas/chatSchema";

const API_URL = import.meta.env.VITE_API_URL;

//skapar en DM eller hämtar en befintlig konversation
async function createDM(username: string, token: string): Promise<Chat> {
  const response = await fetch(`${API_URL}/api/chats/dm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ username }),
  });

  if (!response.ok) {
    throw new Error("Kunde inte öppna konversationen");
  }

  //hämtar JSON-svaret från backend
  const data: unknown = await response.json();

  //validerar svaret mot Zod-schemat
  const result = chatSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Ogiltig chattdata från backend")
  }

  return result.data;
}

export { createDM }


//Bearer = den som har en giltig token kan använda den för att identifiera sig