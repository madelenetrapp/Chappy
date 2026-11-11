import { z } from "zod"

//beskriver svaret från backend när en DM öppnas
const chatSchema = z.object({
  chatId: z.string(),
  type: z.literal("dm"),
  members: z.array(z.string()),
  locked: z.boolean(),
  createdAt: z.string(),
})

//skapar TS-typen från zod schemat 
type Chat = z.infer<typeof chatSchema>;

export { chatSchema }
export type { Chat };