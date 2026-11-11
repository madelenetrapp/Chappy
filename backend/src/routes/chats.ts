
import { Router } from "express"; // Gör det möjligt att skapa separata API-routes.

import {
  GetCommand, // Hämtar en specifik post från DynamoDB.
  QueryCommand, // Hämtar flera poster som matchar ett sökvillkor.
  TransactWriteCommand, // Sparar flera poster som en gemensam transaktion.
  PutCommand, // Skapar eller ersätter en post i DynamoDB.
} from "@aws-sdk/lib-dynamodb";

import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb"; // Fel när ett villkor för en databasoperation inte uppfylls.
import { dynamoDB } from "../db/dynamoDB.js"; // Importerar vår konfigurerade DynamoDB-klient.
import { requireAuthentication } from "../middleware/requireAuthentication.js"; // Kontrollerar användarens JWT-token.
import type { Chat } from "../types/Chat.js"; // TypeScript-typ som beskriver en konversation.

// chats.ts ansvarar för att skapa och hämta konversationer.
// messages.ts ansvarar för att skicka, spara och hämta meddelanden.

// Skapar en router där vi samlar endpoints för chattar.
const chatsRouter = Router();

// Middleware som körs innan alla endpoints i denna router.
// Användaren måste vara inloggad för att komma vidare.
chatsRouter.use(requireAuthentication);

// POST /api/chats/dm
// Skapar en privat konversation eller hämtar en som redan finns.
chatsRouter.post("/dm", async (req, res) => {

  // Hämtar mottagarens användarnamn från frontendens request body.
  const { username } = req.body;

  // Hämtar den inloggade användarens ID från JWT-kontrollen.  //TODO: kontrollera userID (ej any)
  const userId = res.locals.userId;

  // Kontrollerar att username är en sträng och inte är tomt.
  if (typeof username !== "string" || !username.trim()) {
    return res.status(400).json({ error: "Ogiltigt användarnamn" });
  }

  try {
    // Letar efter mottagaren i DynamoDB.
    const userResult = await dynamoDB.send(
      new GetCommand({
        TableName: "Chappy", 

        // GetCommand kräver postens båda nycklar: pk och sk.
        Key: {
          pk: `USERNAME#${username.trim().toLocaleLowerCase()}`,

          // Identifierar posten som kopplar användarnamn till användar-ID.
          sk: "RESERVATION",
        },
      })
    );

    // Hämtar mottagarens ID från databasen.
    // ?. gör att koden inte kraschar om posten saknas.
    const recipientId = userResult.Item?.userId;

    // Om användaren inte finns returneras 404.
    if (typeof recipientId !== "string") {
      return res.status(404).json({ error: "Användaren finns inte" });
    }

    // Förhindrar att användaren startar en DM med sig själv.
    if (userId === recipientId) {
      return res.status(400).json({
        error: "Du kan inte starta en DM med dig själv",
      });
    }

    // Lägger båda användarnas ID i en array.
    // sort() ger alltid samma ordning oavsett vem som startar chatten.   //TODO: borde vara en lista av sträng
    const members = [userId, recipientId].sort();

    // Skapar ett unikt och förutsägbart ID för just dessa två användare.
    // Därför får Anna + Erik samma DM som Erik + Anna.
    const chatId = `dm-${members.join("-")}`;

    // Söker efter en befintlig konversation med detta chatId.
    const existing = await dynamoDB.send(
      new GetCommand({
        TableName: "Chappy",
        Key: {
          pk: `CHAT#${chatId}`, // Identifierar konversationen.
          sk: "METADATA", // Identifierar postens typ: chattinformation.
        },
      })
    );

    // Om konversationen redan finns behöver vi inte skapa en ny.
    if (existing.Item) {

      // Går igenom båda användarna.
      for (const memberId of members) {
        try {
          await dynamoDB.send(
            new PutCommand({
              TableName: "Chappy",

              // Skapar en koppling mellan användaren och chatten.
              // Kopplingen används för att visa chatten i användarens chattlista.
              Item: {
                pk: `USER#${memberId}`, // Vilken användare kopplingen tillhör.
                sk: `CHAT#${chatId}`, // Vilken chatt användaren är kopplad till.
                chatId, // Chattens ID.
                type: "dm", // Anger att det är en privat konversation.
              },

              // Skapar bara kopplingen om den inte redan finns.
              // Förhindrar att en befintlig koppling skrivs över.
              ConditionExpression: "attribute_not_exists(pk)",
            })
          );
        } catch (error) {

          // Om kopplingen redan finns är det inget problem.
          // Andra databasfel ska däremot hanteras av den yttre catch-satsen.
          if (!(error instanceof ConditionalCheckFailedException)) {
            throw error;
          }
        }
      }

      // 200 OK betyder att en befintlig konversation returneras.
      return res.status(200).json(existing.Item);
    }

    // Om chatten inte finns skapar vi ett nytt Chat-objekt.
    // TypeScript kontrollerar att objektet följer typen Chat.
    const chat: Chat = {
      chatId, // Det gemensamma chatt-ID:t.
      type: "dm", // Privat konversation mellan två användare.
      members, // Array med båda användarnas ID.
      locked: true, // Sparar chatten som låst enligt vår datamodell.
      createdAt: new Date().toISOString(), // Datum och tid när chatten skapades.
    };

    // Sparar den nya konversationen i DynamoDB.
    await dynamoDB.send(
      new TransactWriteCommand({

        // Alla poster i transaktionen måste kunna sparas.
        // Annars genomförs ingen av skrivningarna.
        TransactItems: [
          {
            Put: {
              TableName: "Chappy",

              // Första posten innehåller information om själva chatten.
              Item: {
                pk: `CHAT#${chatId}`, // Chattens partitionsnyckel.
                sk: "METADATA", // Visar att posten innehåller chattinformation.
                ...chat, // Lägger till alla egenskaper från Chat-objektet.
              },

              // Förhindrar att en befintlig chatt skrivs över.
              ConditionExpression: "attribute_not_exists(pk)",
            },
          },

          // map() skapar en databasoperation för varje användare.
          // Blir alltså två chattkopplingar: en för Anna och en för Erik.
          ...members.map((memberId) => ({
            Put: {
              TableName: "Chappy",

              Item: {
                pk: `USER#${memberId}`, // Användarens ID.
                sk: `CHAT#${chatId}`, // Chattens ID.
                chatId, // Gör det möjligt att hitta konversationen.
                type: "dm", // Typ av konversation.
              },
            },
          })),
        ],
      })
    );

    // 201 Created betyder att en ny konversation har skapats.
    // Frontend får tillbaka information om chatten.
    return res.status(201).json(chat);

  } catch {
    // Returnerar serverfel om något oväntat går fel.
    return res.status(500).json({ error: "Kunde inte skapa DM" });
  }
});

// GET /api/chats
// Hämtar alla konversationer som tillhör den inloggade användaren.
chatsRouter.get("/", async (req, res) => {

  // Hämtar användarens ID från JWT-kontrollen.
  const userId = res.locals.userId;

  try {
    // Söker efter användarens chattkopplingar i DynamoDB.
    const result = await dynamoDB.send(
      new QueryCommand({
        TableName: "Chappy",

        // pk måste matcha användaren.
        // begins_with() begränsar sökningen till chattkopplingar.
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",

        // Ersätter variablerna i sökvillkoret med riktiga värden.
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`, // Endast den inloggade användarens poster.
          ":sk": "CHAT#", // Endast poster som börjar med CHAT#.
        },
      })
    );

    // 200 OK betyder att hämtningen lyckades.
    // ?? [] returnerar en tom array om inga poster hittas.
    return res.status(200).json(result.Items ?? []);

  } catch {
    // Returnerar serverfel om hämtningen misslyckas.
    return res.status(500).json({
      error: "Kunde inte hämta chattar",
    });
  }
});

// Exporterar routern så att server.ts kan använda den.
export { chatsRouter };
