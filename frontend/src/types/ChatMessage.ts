

type ChatMessage = {
  id: string;
  text: string;
  sender: "user" | "ai";
};

export type { ChatMessage }

//type ChatMessage – definierar hur ett chattmeddelande ska vara uppbyggt.
//id: string – ett unikt ID för meddelandet.
//text: string – meddelandets innehåll.
//sender: "user" | "ai" – avsändaren måste vara "user" eller "ai".
//export type { ChatMessage } – gör typen tillgänglig i andra filer.