import { z } from "zod"

const chatSchema = z.object({
  chatId: z.string(),
  type: z.literal("dm"),
  members: z.array(z.string()),
  locked: z.boolean(),
  createdAt: z.string(),
})

type Chat = z.infer<typeof chatSchema>;

export { chatSchema }
export type { Chat };