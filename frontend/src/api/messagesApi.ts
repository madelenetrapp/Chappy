//importerar scheman för att validera svar från backend
import { chatMessageSchema, chatMessagesSchema } from "../schemas/chatMessageSchema";
//importerar typen som skapas från Zod-schemat
import type { ChatMessage } from "../schemas/chatMessageSchema";

const API_URL = import.meta.env.VITE_API_URL;

// Skickar ett meddelande till backend.
async function sendMessage(chatId: string, text: string, token: string): Promise<ChatMessage> {
  const response = await fetch(`${API_URL}/api/messages/${chatId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error("Kunde inte skicka meddelandet");
  }

  //Hämtar JSON-svaret från bckend 
  const data: unknown = await response.json();
  //validerar svaret från backend mot zod-schemat
  const result = chatMessageSchema.safeParse(data);

  //kontrollerar om meddelandet har fel struktur
  if (!result.success) {
    throw new Error("Ogiltigt meddelande från backend")
  }

  //returnerar validerade meddelandet
  return result.data;
}

// Hämtar meddelanden från en specifik chatt.
async function getMessages(chatId: string, token: string): Promise<ChatMessage[]> {
  const response = await fetch(`${API_URL}/api/messages/${chatId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Kunde inte hämta chatthistoriken");
  }

  //Hämtar chatthistorik från backend
  const data: unknown = await response.json();

  //validerar hela listan med meddelnaden
  const result = chatMessagesSchema.safeParse(data);

  //avbryter om listan innehåller ogiltiga meddelanden
  if (!result.success) {
    throw new Error("Ogiltig chatthistorik från backend");
  }
    return result.data;
}

export { sendMessage, getMessages };
