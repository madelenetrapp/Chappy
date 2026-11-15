
import { chatSchema } from "../schemas/chatSchema";
import type { Chat } from "../schemas/chatSchema";

const API_URL = import.meta.env.VITE_API_URL;

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

  const data: unknown = await response.json();

  const result = chatSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Ogiltig chattdata från backend")
  }

  return result.data;
}

type ChatListItem = {
  chatId: string;
  type: string;
};

async function getChats(token: string): Promise<ChatListItem[]> {
  const response = await fetch(`${API_URL}/api/chats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Kunde inte hämta chattar");
  }

  return response.json();
}

export { createDM, getChats };
export type { ChatListItem }
