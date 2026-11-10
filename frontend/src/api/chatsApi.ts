const API_URL = import.meta.env.VITE_API_URL;

//skapar en DM eller hämtar en befintlig konversation
async function createDM(username: string, token: string): Promise<{chatId: string}> {
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

  return response.json();
}

export { createDM }


