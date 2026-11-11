import type { ChatMessage as ChatMassageType } from "../schemas/chatMessageSchema";
import "./ChatMessage.css"

type Props = {
  message: ChatMassageType;
  currentUserId: string; //den inloggade användarens ID
};

function ChatMassage({ message, currentUserId }: Props) {
  //Kontrollerar om meddelandet skickades av den inloggade användaren
  const isOwnMessage = message.senderId === currentUserId;

  return (
    <p className={`chat-message ${isOwnMessage ? "user" : "other"}`}>
      {message.text}
    </p>
  );
}

export default ChatMassage;

// import type – hämtar typen från vår andra fil.
// Props – beskriver vilken information komponenten ska få.
// message: ChatMessageType – kräver ett meddelande med rätt struktur.
// function ChatMessage – skapar React-komponenten.
// return <p>{message.text}</p> – visar meddelandets text på skärmen.
// export default – gör komponenten tillgänglig för andra filer.

//separerar hur ett meddelande visas från resten av chattens funktionalitet.