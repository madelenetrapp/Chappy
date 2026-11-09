import { Router } from "express";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDB } from "../db/dynamoDB.js";
import { requireAuthentication } from "../middleware/requireAuthentication.js"
import type { Chat } from "../types/Chat.js"

//Skapar en separat router för konversationer  (ansvarar för att skapa och hantera DM och kanaler)
const chatsRouter = Router();

//Kräver inloggning för alla endpoints.
chatsRouter.use(requireAuthentication);

// Skapar eller hämtar en privat DM mellan två användare.
chatsRouter.post("/dm", async (req, res) => {
  const { username } = req.body;
  const userId = res.locals.userId;

  //kontrollerar att ett användarnamn har skickats
  if (typeof username !== "string" || !username.trim()) {
    return res.status(400).json({ error: "Ogiltigt användarnamn" });
  }

  try {
    //Hitta mottagarens ID via användarnamnet
    const userResult = await dynamoDB.send(
      new GetCommand({
        TableName: "Chappy",
        Key: {
          pk: `USERNAME#${username.trim().toLocaleLowerCase()}`,
          sk: "RESERVATION",
        },
      })
    );
    const recipientId  = userResult.Item?.userId;

    if (typeof recipientId !== "string") {
      return res.status(404).json({ error: "Användaren finns inte" });
    }

    if (userId === recipientId) {
      return res.status(400).json({ error: "Du kan inte starta en DM med dig själv" })
    }

    //Sorterar ID:n så att ANNA + Erik och Erik ? Anna får samma DM
    const members = [userId, recipientId].sort();
    const chatId = `dm-${members.join("-")}`;

    //Kontrollerar om konversationen redan finns
    const existing = await dynamoDB.send(
      new GetCommand({
        TableName: "Chappy",
        Key: {
          pk: `CHAT#${chatId}`,
          sk: "METADATA",
        },
      })
    );

    if (existing.Item) {
      return res.status(200).json(existing.Item);
    }

    //skapar konversationens metadata
    const chat: Chat = {
      chatId,
      type: "dm",
      members,
      locked: true,
      createdAt: new Date().toISOString(),
    };

    await dynamoDB.send(
      new PutCommand({
        TableName: "Chappy",
        Item: {
          pk: `CHAT#${chatId}`,
          sk: "METADATA",
          ...chat,
        },
        ConditionExpression: "attribute_not_exists(pk)"
      })
    );

    return res.status(201).json(chat);
  } catch {
    return res.status(500).json({ error: "Kunde inte skapa DM" });
  }
});

export { chatsRouter }

//messages.ts ansvarar för att skicka och hämta meddelanden
//         -->
//Hitta mottagare via användarnamnet
//skapar ett genemsammt chatt-ID 
//sparar deltagarna i dynamoDB
//om chatten redan finns returneras den istället