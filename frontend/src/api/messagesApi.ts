import type { ChatMessage } from "../types/ChatMessage";

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

  return response.json();
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

  return response.json();
}

export { sendMessage, getMessages };
