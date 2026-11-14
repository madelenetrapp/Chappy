//de typer av konversationer som Chappy stödjer
type ChatType = "dm" | "channel";

//Beskriver en provat konversation eller kansal
//name kan finnas men måste inte (ex. kanal kan vara "allmänt")
type Chat = {
  chatId: string;
  type: ChatType;
  name?: string;
  members: string[];
  locked: boolean;
  createdAt: string;
};

//Beskriver ett meddelande i en konversation
type ChatMessage = {
  messageId: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export type { ChatType, Chat, ChatMessage }