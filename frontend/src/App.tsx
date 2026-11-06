import "./App.css";
import { useEffect, useRef, useState } from "react"; // React-hooks
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

  //Referens till området som innehåller de skickade meddelandena
  const messageRef = useRef<HTMLDivElement>(null);

  // Körs när användaren skickar ett meddelande
  async function handleSend(text: string): Promise<void> {
    try {

        const newMessages = await sendMessage(text);

 setMessages((previousMessages) => [
        ...previousMessages,
        newMessages,
      ]);
    } catch (error) {
      console.error("Kunde inte skicka meddelandet:", error);
    }
  };

// Hämtar tidigare meddelanden från backend 
async function loadMessages(): Promise<void> {
  try {
    const savedMessages = await getMessages();

    //filterar bort data som inte har rätt struktur
    const validMessages = savedMessages.filter(
    (messages) =>
      typeof messages.id === "string" &&
    typeof messages.text === "string" &&
    (messages.sender === "user" || messages.sender === "ai")
);

//sparar meddelandena i react state.
setMessages(validMessages);
  } catch (error) {
    console.error("Kunde inte hmta meddelanden:", error);
  }
}

//ontrollerar att backend svarar
async function checkBackend(): Promise<void> {
  try {
    const data = await getHealth();
    console.log("Backend", data);
  } catch (error) {
    console.log("Kunde inte ansluta till backend:", error);
  }
  
}

//kör funktionerna när komponenten monteras/hämtar meddelandena när chatten öppnas
useEffect(() => {
  void checkBackend();
  void loadMessages();
}, []); //så att meddelandena hämtas när chatten öppnas inte varje gång react uppdaterar sidan


//Scrolla längst ner när meddelandelistan uppdateras
useEffect(() => {
  if (!messageRef.current) return;

  messageRef.current.scrollTop = messageRef.current?.scrollHeight;
}, [messages]);


//renderar chattsidan enligt Figma
return (
  <div className="chat-layout">
    <header className="chat-header">
      <h1>Chappy</h1>
    </header>

    {/* de tre huvuud-blocken  */}
  <div className="chat-main">
    <aside className="chat-sidebar">
      <section className="sidebar-section">
        <h2>Tillgängliga chattar</h2>
      </section>

      <section className="sidebar-section">
        <h2>Kontakter</h2>
      </section>
    </aside>

    <main className="chat-content">
      <div className="chat-messages" ref={messageRef}>
        {messages.map((messages) => (
          <ChatMessageComponent
          key={messages.id}
          message={messages}
          />
        ))}
      </div>

        {/* fält att skicka meddelandet i */}
          <div className="chat-input-area">
            <ChatInput onSend={handleSend} />
          </div>
    </main>

    {/* högerpanel förspråkinställningar */}
    <aside className="chat-settings">
      <h2>Språkinställningar</h2>
    </aside>

  </div>
  </div>
);
}

export default App; // Gör komponenten tillgänglig för main.tsx


//getHealth anropar backend
//.then() skriver ut svaret i console
//.catch() fångar ev. fel
// [] tom beroende lista, gör att useEffect inte körs igen vid vanliga omrenderingar
