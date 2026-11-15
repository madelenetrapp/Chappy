
import type { RefObject } from "react";
import type { ChatMessage } from "../schemas/chatMessageSchema.js";
import ChatMessageComponent from "./ChatMessage.js";
import ChatInput from "./ChatInput.js";

type ChatWindowProps = {
  messageRef: RefObject<HTMLDivElement | null>;
  messages: ChatMessage[];
  currentUserId: string | null;
  translations: Record<string, string>;
  handleSend: (text: string) => Promise<void>;
};

function ChatWindow({
  messageRef,
  messages,
  currentUserId,
  translations,
  handleSend,
}: ChatWindowProps) {
  return (
    <main className="chat-content">

      <div
        className="chat-messages"
        ref={messageRef}
      >
        {messages.map((message) => (
          <ChatMessageComponent
            key={message.id}
            message={message}
            currentUserId={currentUserId ?? ""}
            translatedText={translations[message.id]}
          />
        ))}
      </div>

      <div className="chat-input-area">
        <ChatInput onSend={handleSend} />
      </div>
    </main>
  );
}

export default ChatWindow;
