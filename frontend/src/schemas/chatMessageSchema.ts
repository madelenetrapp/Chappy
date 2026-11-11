import * as z from "zod";

const chatMessageSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  senderId: z.string(),
  text: z.string(),
  createdAt: z.string(),
});

//validerar en array med chattmeddelanden
const chatMessagesSchema = z.array(chatMessageSchema);

//skapar TS typerna automatiskt från zod-schemat
//man slipper skriva i samma fält två gånger
type ChatMessage = z.infer<typeof chatMessageSchema>;

export {chatMessageSchema, chatMessagesSchema}
export type {ChatMessage}
// type talar om att Chatmessage bara används för typkontroll, inte som ett värde när programmet körs.




//Importera Zod från paketet "zod"
//Använda samma import som i davids exempel: (z from zod)

//skapa och exportera en konstant som heter chatMessagesSchema
//använd z.object() för att beskriva ett chattmeddelande

//lägg in följande fält i z.object():
// - id    -> z.string() - meddelandets unika ID
//- chatId  -> z.string() - konversationens ID
//- senderId  -> z.string() - avsändarens ID
//- text     -> z.string() - meddelandets innehåll

//Skapa och exportera chatMessagesSchema
//Använd z.array(chatMessageSchema)
//Då skapas typen automatiskt från zod-schemat
//behöver inte definiera samma fält en gång till

// chatMessageSchema = validerar ett meddelande
// chatMessageSchema = validerar en lista med meddelanden
// ChatMessage = TypeScript-typen som härleds från schemat