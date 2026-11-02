
import { useEffect, useState } from "react"; // React-hooks
import { getHealth } from "./api/healthApi.js"; // Kontrollerar backend
import ChatInput from "./components/ChatInput.js"; // Inmatningsfältet
import type { ChatMessage } from "./types/ChatMessage.js"; // Typ för meddelanden
import ChatMessageComponent from "./components/ChatMessage.js"; // Visar meddelanden
import { getMessages, sendMessage } from "./api/messagesApi.js"; // API-funktioner
// import { error } from "node:console";

//useEffect låter koden köras när komponenten monteras

function App() {

  // State som innehåller alla meddelanden som visas
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Körs när användaren skickar ett meddelande
  async function handleSend(text: string) {
    try {
      const newMessage = await sendMessage(text); // Skickar till backend
      setMessages((previous) => [...previous, newMessage]); // Lägger till i state
    } catch (error) {
      console.error("Kunde inte skicka meddelandet:", error);
    }
  };

  // Kontrollerar backend när komponenten monteras
useEffect(() => {
  getHealth()
    .then((data) => console.log("Backend:", data))
    .catch((error) => console.error(error));
}, []);

// Hämtar sparade meddelanden när komponenten monteras
useEffect(() => {
  getMessages()
  .then((messages) => {
    setMessages(
      messages.filter(
        (message) =>
          typeof message.id === "string" && // Måste ha ID
        typeof message.text === "string" && // Måste ha text
        (message.sender === "user" || message.sender === "ai") // Giltig avsändare
      )
    );
  })
  .catch((error) => console.error(error));
}, []);

//.filter är för att sortera bort gamala meddelnaden -  testdatan (tillfällig)

// Bestämmer vad som ska visas på sidan
return (
  <div>
    <h1>Chappy</h1>

    {/* Skapar en ChatMessage-komponent för varje meddelande */}
    {messages.map((message) => (
      <ChatMessageComponent key={message.id} message={message} />
    ))}
    {/* Skickar handleSend till inmatningskomponenten */}
    <ChatInput onSend={handleSend} />
  </div>
);

}

export default App; // Gör komponenten tillgänglig för main.tsx


//getHealth anropar backend
//.then() skriver ut svaret i console
//.catch() fångar ev. fel
// [] tom beroende lista, gör att useEffect inte körs igen vid vanliga omrenderingar
