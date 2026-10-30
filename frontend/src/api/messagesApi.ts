import type { ChatMessage } from "../types/ChatMessage";

const API_URL = import.meta.env.VITE_API_URL;

async function sendMessage(text: string): Promise<ChatMessage> {
  const response = await fetch(`${API_URL}/api/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error("Kunde inte skicka meddelandet");
  }
  return response.json();
}

export { sendMessage }