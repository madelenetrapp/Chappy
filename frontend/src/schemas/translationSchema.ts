import { z } from "zod";

const translationSchema = z.object({
  translatedText: z.string(),
});

type Translation = z.infer<typeof translationSchema>;

export { translationSchema };
export type { Translation };