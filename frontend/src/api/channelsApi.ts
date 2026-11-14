type Channel = {
  chatId: string;
  name: string;
  locked: boolean;
};

// Hämtar alla kanaler från backend
async function getChannels(): Promise<Channel[]> {
  const response = await fetch("/api/channels");

  if (!response.ok) {
    throw new Error("Kunde inte hämta kanaler");
  }

  return response.json();
}

export { getChannels };
export type { Channel };