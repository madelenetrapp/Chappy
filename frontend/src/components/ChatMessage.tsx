
import type { ChatMessage as ChatMassageType } from "../schemas/chatMessageSchema";
import "./ChatMessage.css"

type Props = {
  message: ChatMassageType;
  currentUserId: string;
  translatedText?: string;
};

function ChatMassage({
  message,
  currentUserId,
  translatedText,
}: Props) {
  const isOwnMessage = message.senderId === currentUserId;

  return (
    <div className={`message-wrapper ${isOwnMessage ? "user" : "other"}`}>
      <p className={`chat-message ${isOwnMessage ? "user" : "other"}`}>
        {message.text}
      </p>

      {!isOwnMessage &&
        translatedText && (
          <p className="chat-message other translated-message">
            {translatedText}
          </p>
        )}
    </div>
  );
}

export default ChatMassage;
