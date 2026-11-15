
type LoginResponse = {
  token: string;
  userId: string;
};

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {

  const response = await fetch(
    "/api/authentication/login",
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

export async function register(
  username: string,
  password: string
): Promise<void> {

  const response = await fetch(
    "/api/authentication/register",
    {
      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ username, password }),
    }
  );

  if (!response.ok) {

    throw new Error("Registreringen misslyckades");
  }


}
