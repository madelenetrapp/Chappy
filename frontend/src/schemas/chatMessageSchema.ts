
import * as z from "zod";

const chatMessageSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  senderId: z.string(),
  text: z.string(),
  createdAt: z.string(),
});

const chatMessagesSchema = z.array(chatMessageSchema);

type ChatMessage = z.infer<typeof chatMessageSchema>;

export {chatMessageSchema, chatMessagesSchema}
export type {ChatMessage}
