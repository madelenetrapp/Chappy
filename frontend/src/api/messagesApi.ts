
import { chatMessageSchema, chatMessagesSchema } from "../schemas/chatMessageSchema";
import type { ChatMessage } from "../schemas/chatMessageSchema";

const API_URL = import.meta.env.VITE_API_URL;

async function sendMessage(chatId: string, text: string, token: string | null): Promise<ChatMessage> {
  const response = await fetch(`${API_URL}/api/messages/${chatId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error("Kunde inte skicka meddelandet");
  }

  const data: unknown = await response.json();
  const result = chatMessageSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Ogiltigt meddelande från backend")
  }

  return result.data;
}

async function getMessages(chatId: string, token: string | null): Promise<ChatMessage[]> {
  const response = await fetch(`${API_URL}/api/messages/${chatId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error("Kunde inte hämta chatthistoriken");
  }

  const data: unknown = await response.json();

  const result = chatMessagesSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Ogiltig chatthistorik från backend");
  }
  return result.data;
}

export { sendMessage, getMessages };
