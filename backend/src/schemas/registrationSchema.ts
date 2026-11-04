import { z } from "Zod";

const registrationSchema = z.object({
  // definierar vilka uppgifter som krävs vid registrering

  username: z.string().trim().min(3).max(30),
  //användarnamnet måste innehålla 3-30 tecken.

  password: z.string().min(8),
  // lösenordet måste innehålla minst 8 tecken
});

export { registrationSchema } 