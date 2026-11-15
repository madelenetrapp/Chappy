import { z } from "zod";

const registrationSchema = z.object({

  username: z.string().trim().min(3).max(30),

  password: z.string().min(8),
});

export { registrationSchema } 