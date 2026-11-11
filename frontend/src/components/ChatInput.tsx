import { useState } from "react";

// import { ChatMessage } from "./../schemas/chatMessageSchema";
import "./ChatInput.css"

type Props = {
  onSend: (text: string) => void;
  // Funktionen tar emot en sträng och returnerar inget. tar emot meddelandet som en textsträng - skickar vidare meddelandet till App.tsx (hämtar inget resulötat)
};

function ChatInput({ onSend }: Props) {
  // Tar emot funktionen onSend från App.tsx via props.

  const [text, setText] = useState<string>("");
  // text = det användaren skriver.
  // setText = uppdaterar texten.
  // "" = textfältet är tomt från början.

  function handleSend() {
    // Körs när användaren klickar på skicka.

    if (!text.trim()) return;
    // Avbryter om texten är tom eller bara innehåller mellanslag.

    onSend(text);
    // Skickar texten till handleSend i App.tsx

    setText("");
    // Tömmer textfältet efter att meddelandet skickats
  }

  return (
    <div className="chat-input-container">
      <textarea 
      className="chat-input"
        value={text}
        // Visar värdet från Reacts state i textfältet

        onChange={(e) => setText(e.target.value)}
        // Uppdaterar state varje gång användaren skriver.

        placeholder="Skriv ett meddelande..."
        rows={1}
      />
      <button className="chat-send-button" type="button" onClick={handleSend}>Skicka</button>
    </div>
  );
}

export default ChatInput;
// Gör komponenten tillgänglig för App.tsx.
