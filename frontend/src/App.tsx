import "./App.css";
import { useEffect, useRef, useState } from "react"; // React-hooks
import { getHealth } from "./api/healthApi.js"; // Kontrollerar backend
import ChatInput from "./components/ChatInput.js"; // Inmatningsfältet
import type { ChatMessage } from "./schemas/chatMessageSchema"; // Typ för meddelanden
import ChatMessageComponent from "./components/ChatMessage.js"; // Visar meddelanden
import { getMessages, sendMessage } from "./api/messagesApi.js"; // API-funktioner
import { createDM } from "./api/chatsApi.js"
// import { error } from "node:console";

//useEffect låter koden köras när komponenten monteras

function App() {

  //Hämtar användarens jwt från sessionStorage för att användas vid autentiserade API-anrop
  const token = sessionStorage.getItem("token");

  //hämtar den inloggade användarens ID
  const currentUserId = sessionStorage.getItem("userId")

  //Sparar ID för den konversation användaren valt
  const [chatId, setChatId] = useState<string | null>(null);

  //sparar användarnamnet på personen som användaren vill chatta med
  const [recipient, setRecipient] = useState<string>("");

  // State som innehåller alla meddelanden som visas
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  //Referens till området som innehåller de skickade meddelandena
  const messageRef = useRef<HTMLDivElement>(null);

  //skapar eller öppnar en DM med det angivna användarnamnet
  async function handleCreateDM(): Promise<void> {

    //avbryter om användaren saknar token eller inte har angett ett användarenamn
    if (!token || !recipient.trim()) return;

    try {

      //anropar backend för att skapa eller öppna en DM med mottagare
      const chat = await createDM(recipient, token);
      setChatId(chat.chatId);                                                     //sparar ID för den skapade eller öppna chatten
      console.log("DM öppnad", chat.chatId);
      setMessages([]);                                                            // tömmer tidigare meddelanden när användaren byter chatt
    } catch (error) {
      console.error("Kunde inte öppna DM:", error);
    }
  }
  // Körs när användaren skickar ett meddelande
  async function handleSend(text: string): Promise<void> {

    //avbryter om användaren saknar token eller ingen chatt är vald
    if (!token || !chatId) return;

    try {
      //skickar meddelandet till backend och får tillbaka det sparade meddelnadet
      const newMessages = await sendMessage(chatId, text, token);

      //lägger till det nya meddelandet utan att ta bort tidigare meddelanden
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

    //avbryter om användaren saknar token eller ingen chatt är vald
    if (!token || !chatId) return;

    //hämtar meddelandena för den välda chatten.
    try {
      const savedMessages = await getMessages(chatId, token);


      //sparar meddelandena i react state. //TODO: tala om datatyp
      setMessages(savedMessages);
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

  //Kontrollerar backend när komponenten monteras
  useEffect(() => {
    void checkBackend();
  }, []); //så att meddelandena hämtas när chatten öppnas inte varje gång react uppdaterar sidan

  //Hämtar meddelanden när användaren öppna en chatt
  useEffect(() => {
    void loadMessages();
  }, [chatId]);


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
            <input 
            type="text" 
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Användarnamn"
            />
            <button type="button" onClick={() => void handleCreateDM()}>
              Starta DM
            </button>
          </section>
        </aside>

        <main className="chat-content">
          <div className="chat-messages" ref={messageRef}>

            {/* går igenom alla meddelnaden och visar en komponent för varje meddelande */}
            {messages.map((messages) => (
              <ChatMessageComponent
                key={messages.id}                        //Unikt ID som react använder för att indentifiera meddelandet
                message={messages}                        // skickar meddelandets information till komponenten
                currentUserId={currentUserId ?? ""}       //skickar användarens ID för att skilja egna meddelanden från andras
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
