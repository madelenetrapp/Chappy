type ChatType = "dm" | "channel";

type Chat = {
  chatId: string;
  type: ChatType;
  name?: string;
  members: string[];
  locked: boolean;
  createdAt: string;
};

type ChatMessage = {
  messageId: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export type { ChatType, Chat, ChatMessage }