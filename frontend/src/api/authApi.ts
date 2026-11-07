

type LoginResponse = {
  token: string;
};

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/authentication/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }
  );

  if (!response.ok) {
    throw new Error("Inloggningen misslyckades");
  }

  return response.json();
}