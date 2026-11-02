
import express from "express"; // Ramverk för backend och API
import cors from "cors"; // Tillåter anrop från frontend
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"; // Kommandon för att spara och hämta data
import { dynamoDB } from "./db/dynamoDB.js"; // Databasanslutningen

const app = express(); // Skapar Express-servern
const PORT = Number(process.env.PORT) || 3001; // Port från miljövariabel, annars 3001

// Tillåter frontend att kommunicera med backend
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// Gör JSON från inkommande anrop tillgänglig i req.body
app.use(express.json());

// GET: Kontrollerar att backend fungerar
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// POST: Tar emot och sparar ett nytt meddelande
app.post("/api/messages", async (req, res) => {
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
app.get("/api/messages", async (_req, res) => {
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

// Startar backend och lyssnar på angiven port
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
