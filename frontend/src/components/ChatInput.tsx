import { useState } from "react";

function ChatInput() {
  const [text, setText] = useState<string>("");

  function handleSend() {
    console.log(text);    //test
  }

  return (
    <div>
    <input
    type="text"
    value={text}
    onChange={(e) => setText(e.target.value)}
    placeholder="Skriv ett meddelande..."
    />
    <button type="button" onClick={handleSend}>Skicka</button>
    </div>
  );
}

export default ChatInput;