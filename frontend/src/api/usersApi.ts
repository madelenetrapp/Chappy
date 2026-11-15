type User = {
  userId: string;
  username: string;
};

async function getUsers(): Promise<User[]> {
  const response = await fetch("/api/users");

  if (!response.ok) {
    throw new Error("Kunde inte hämta användare")
  }

  return response.json();
}

export { getUsers };
export type { User };