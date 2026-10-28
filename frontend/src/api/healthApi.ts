

const API_URL = import.meta.env.VITE_API_URL;


//import.meta.env = är vits sätt att läsa miljövariabler
// VITE_API_URL = variabeln som ksa innehålla adressen till express-backend


export async function getHealth() {
  const response = await fetch(`${API_URL}/api/health`);

  //fetch skickar en get förfrågan till Express

  if (!response.ok) {
    throw new Error("kunde inte ansluta till backend");
  }

  return response.json();
}