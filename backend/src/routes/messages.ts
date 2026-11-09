import express, { type Router } from "express";
import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"; // Kommandon för att spara och hämta data
import { dynamoDB } from "../db/dynamoDB.js";  // Databasanslutningen
import { requireAuthentication } from "../middleware/requireAuthentication.js"

//skapar en separat router för meddelandena
const router: Router = express.Router();

//kräver giltig JWT för alla endpoints i denna router
router.use(requireAuthentication);

// POST: Tar emot och sparar ett nytt meddelande
router.post("/:chatId", async (req, res) => {
  const { chatId } = req.params; //Hämtar chattens ID från URL:en
  const { text } = req.body; // Hämtar texten från anropet

  // Kontrollerar att texten är en sträng och inte tom
  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Ogiltigt meddelande" });
  }

  // Skapar meddelandet med unikt ID, text och avsändare
  const message = {
    id: crypto.randomUUID(),
    text: text.trim(),
    senderId: res.locals.userId,
    //innehåller användarens riktiga id (res.locals.userId kommer från jwt som verifierades av requireAuthentication), dynamo sparar vem som fktikt skickar meddelandet
  };

  try {
    // // Hämtar chattens metadata från DynamoDB för att kontrollera behörighet
    const result = await dynamoDB.send(
      new GetCommand({
        TableName: "Chappy",
        Key: {
          pk: `CHAT#${chatId}`,
          sk: `METADATA`,
        },
      })
    );

    //Kontrollerar att chatten finns
    const chat = result.Item;

    if (!chat) {
      return res.status(404).json({ error: "Chatten finns inte" });
    }

    // Kontrollerar att members är en array OCH att användarens ID finns i den
    // Om något av kraven inte uppfylls nekas användaren åtkomst
    if (
      !Array.isArray(chat.members) ||
      !chat.members.includes(res.locals.userId)
    ) {
      return res.status(403).json({ error: "Ingen behörighet till chatten" })
    }

    await dynamoDB.send(
      new PutCommand({
        TableName: "Chappy", // Databastabellen
        Item: {
          pk: `CHAT#${chatId}`, // Vilken chatt meddelandet tillhör
          sk: `MESSAGE#${new Date().toISOString()}#${message.id}`, // Sorteringsnyckel med tid och ID
          ...message, // Lägger till id, text och senderId
        },
      })
    );
  } catch {
    // Returnerar fel om meddelandet inte kan sparas
    return res.status(500).json({
      error: "Kunde inte spara meddelandet",
    });
  }

  // Bekräftar att meddelandet skapats och skickar tillbaka det
  return res.status(201).json(message);
});

// GET: Hämtar sparade meddelanden från DynamoDB
router.get("/:chatId", async (req, res) => {
  const { chatId } = req.params;

  try {
    //hämtar chattens funktion från DynampDB
    const chatResult = await dynamoDB.send(
      new GetCommand({
        TableName: "Chappy",
        Key: {
          pk: `CHAT#${chatId}`,
          sk: "METADATA",
        },
      })
    );

    //Kontrollerar att chatten finns
    const chat = chatResult.Item;

    if (!chat) {
      return res.status(404).json({ error: "Chatten finns inte" });
    }

    //kontrollerar att användaren tillhör chatten.
    if (
      !Array.isArray(chat.members) ||
      !chat.members.includes(res.locals.userId)
    ) {
      return res.status(403).json({
        error: "Ingen behörighet till chatten",
      });
    }

    const result = await dynamoDB.send(
      new QueryCommand({
        TableName: "Chappy",
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",   //Hämta alla meddelanden i chatten, men inte exempelvis dess metadata
        ExpressionAttributeValues: {
          ":pk": `CHAT#${chatId}`, // Väljer chatten
          ":prefix": "MESSAGE#", // Väljer endast meddelanden
        },
      })
    );

    // Skickar tillbaka meddelandena, eller en tom array
    return res.status(200).json(result.Items ?? []);
  } catch {
    // Returnerar fel om hämtningen misslyckas
    return res.status(500).json({
      error: "Kunde inte hämta chatthistoriken",
    });
  }
});

// // GET: Hämtar chattens metadata från DynamoDB
// Metadata beskriver chatten där meddelandena finns.
router.get("/:chatId/metadata", async (req, res) => {
  const { chatId } = req.params;

  try {
    const result = await dynamoDB.send(
      new GetCommand({
        TableName: "Chappy",
        Key: {
          pk: `CHAT#${chatId}`,
          sk: "METADATA",
        },
      })
    );

    //Kontrollerar att chatten finns
    const chat = result.Item;

    if (!chat) {
      return res.status(404).json({ error: "Chatten finns inte" });
    }

    //Kontrollerar att användaren är deltagare i chatten
    if (
      !Array.isArray(chat.members) ||
      !chat.members.includes(res.locals.userId)
    ) {
      return res.status(403).json({
        error: "Ingen behörighet till chatten"
      })
    }
    // Skickar tillbaka metadata
    return res.status(200).json;

  } catch {
    // Returnerar fel om hämtningen misslyckas
    return res.status(500).json({
      error: "Kunde inte hämta chattens metadata",
    });
  }
});


export default router;