import { z } from "zod";

// kontrollerar att beckend skickar tillbaka en översatt text
const translationSchema = z.object({
  translatedText: z.string(),
});

// skapar en TS-typ utifrån schenat
type Translation = z.infer<typeof translationSchema>;

export { translationSchema };
export type { Translation };