import type { ChatMessage as ChatMassageType } from "../types/ChatMessage";

type Props = {
  message: ChatMassageType;
};

function ChatMassage({ message }: Props) {
  return <p>{message.text}</p>;
}

export default ChatMassage;

// import type – hämtar typen från vår andra fil.
// Props – beskriver vilken information komponenten ska få.
// message: ChatMessageType – kräver ett meddelande med rätt struktur.
// function ChatMessage – skapar React-komponenten.
// return <p>{message.text}</p> – visar meddelandets text på skärmen.
// export default – gör komponenten tillgänglig för andra filer.

//separerar hur ett meddelande visas från resten av chattens funktionalitet.