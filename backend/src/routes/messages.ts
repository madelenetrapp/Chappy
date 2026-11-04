import express, { type Router } from "express";
import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"; // Kommandon för att spara och hämta data
import { dynamoDB } from "../db/dynamoDB.js";  // Databasanslutningen

//skapar en separat router för meddelandena
const router: Router = express.Router();

// POST: Tar emot och sparar ett nytt meddelande
router.post("/", async (req, res) => {
  const { text } = req.body; // Hämtar texten från anropet

  // Kontrollerar att texten är en sträng och inte tom
  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Ogiltigt meddelande" });
  }

  // Skapar meddelandet med unikt ID, text och avsändare
  const message = {
    id: crypto.randomUUID(),
    text: text.trim(),
    sender: "user",
  };

  try {
    // Sparar meddelandet i DynamoDB
    await dynamoDB.send(
      new PutCommand({
        TableName: "Chappy", // Databastabellen
        Item: {
          pk: "CHAT#456", // Vilken chatt meddelandet tillhör
          sk: `MESSAGE#${new Date().toISOString()}#${message.id}`, // Sorteringsnyckel med tid och ID
          ...message, // Lägger till id, text och sender
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
router.get("/", async (_req, res) => {
  try {
    const result = await dynamoDB.send(
      new QueryCommand({
        TableName: "Chappy",
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",   //Hämta alla meddelanden i chatten, men inte exempelvis dess metadata
        ExpressionAttributeValues: {
          ":pk": "CHAT#456", // Väljer chatten
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
router.get("/metadata", async (_req, res) => {
  try {
    const result = await dynamoDB.send(
      new GetCommand({
        TableName: "Chappy",
Key: {
  pk: "CHAT#456",
  sk: "METADATA",
},
      })
    );

    // Skickar tillbaka metadata, eller null om chatten saknas
    return res.status(200).json(result.Item ?? null);
  } catch {
    // Returnerar fel om hämtningen misslyckas
    return res.status(500).json({
      error: "Kunde inte hämta chattens metadata",
    });
  }
});


export default router;