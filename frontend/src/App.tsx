import { useEffect, useState } from "react";
import { getHealth } from "./api/healthApi.js";
import ChatInput from "./components/ChatInput.js";
import type { ChatMessage } from "./types/ChatMessage.js";
import ChatMessageComponent from "./components/ChatMessage.js";
// import { error } from "node:console";

//useEffect låter koden köras när komponenten monteras

function App() {

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  function handleSend(text: string) {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text,
      sender: "user",
    };

    setMessages((previous) => [...previous, newMessage])
  }

  useEffect(() => {
    getHealth()
      .then((data) => console.log("Backend:", data))
      .catch((error) => console.error(error));
  }, []);
  return (
    <div>
      <h1>Chappy</h1>

      {messages.map((message) => (
        <ChatMessageComponent key={message.id} message={message} />
      ))}
      <ChatInput onSend={handleSend} />
    </div>
  );

}
export default App;


//getHealth anropar backend
//.then() skriver ut svaret i console
//.catch() fångar ev. fel
// [] tom beroende lista, gör att useEffect inte körs igen vid vanliga omrenderingar

