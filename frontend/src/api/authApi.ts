
 // Beskriver vilken information backend skickar tillbaka vid inloggning.
type LoginResponse = {
  token: string; // JWT-token som används för att identifiera användaren.
  userId: string; // Den inloggade användarens unika ID.
};

// Funktion som skickar användarens inloggningsuppgifter till backend.
export async function login(
  username: string, 
  password: string 
): Promise<LoginResponse> { // Funktionen returnerar ett Promise med token och userId.

  // Skickar en HTTP-förfrågan till backend.
  const response = await fetch(
    // Hämtar backend-adressen från miljövariabeln och lägger till endpointen.
    `${import.meta.env.VITE_API_URL}/api/authentication/login`,
    {
      method: "POST", // POST används för att skicka inloggningsuppgifter.

      // Talar om för backend att informationen skickas som JSON.
      headers: { "Content-Type": "application/json" },

      // Omvandlar användarnamn och lösenord till JSON-format.
      body: JSON.stringify({ username, password }),
    }
  );

  // Kontrollerar om backend svarade med en lyckad HTTP-status (200–299).
  if (!response.ok) {
    
    throw new Error("Inloggningen misslyckades");
  }

  // Omvandlar JSON-svaret till ett JavaScript-objekt.
  // Svaret innehåller token och userId.
  return response.json();
}

// Funktion som registrerar en ny användare via backend.
export async function register(
  username: string,
  password: string 
): Promise<void> { // Funktionen returnerar inget värde vid lyckad registrering.

  // Skickar registreringsuppgifterna till backend.
  const response = await fetch(
    // Backend-adressen tillsammans med registreringens endpoint.
    `${import.meta.env.VITE_API_URL}/api/authentication/register`,
    {
      method: "POST", // Skickar uppgifterna för att skapa en användare.

      // Anger att innehållet är JSON.
      headers: { "Content-Type": "application/json" },

      // Omvandlar användarnamn och lösenord till JSON.
      body: JSON.stringify({ username, password }),
    }
  );

  // Kontrollerar om registreringen misslyckades.
  if (!response.ok) {
    
    throw new Error("Registreringen misslyckades");
  }

 
}
