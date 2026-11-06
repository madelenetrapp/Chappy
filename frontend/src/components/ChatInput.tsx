import { useState } from "react";
// import { ChatMessage } from "./types/ChatMessage";
import "./ChatInput.css"

  type Props = {
    onSend: (text: string) => void;
  }

function ChatInput({ onSend }: Props) {
  const [text, setText] = useState<string>("");

  function handleSend() {
    if (!text.trim()) return;

    onSend(text);
    setText("");
  }

  return (
    <div className="chat-input-container">
      <textarea 
      className="chat-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Skriv ett meddelande..."
        rows={1}
      />
      <button className="chat-send-button" type="button" onClick={handleSend}>Skicka</button>
    </div>
  );
}

export default ChatInput;