

type ChatMessage = {
  id: string;  //meddelandets unika ID
  chatId: string; // konversationens ID
  senderId: string; // ID för användaren som skickade meddelandet
  text: string; //meddelandets innehåll
  createdAt: string; //tidpunkten då meddelandet skapades
};

export type { ChatMessage }

//type ChatMessage – definierar hur ett chattmeddelande ska vara uppbyggt.
//id: string – ett unikt ID för meddelandet.
//text: string – meddelandets innehåll.