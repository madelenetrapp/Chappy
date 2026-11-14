import express, { type Router } from "express";
import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"; // Kommandon för att spara och hämta data
import { dynamoDB } from "../db/dynamoDB.js";  // Databasanslutningen
import { optionalAuthentication } from "../middleware/optionalAuthentication.js";

//skapar en separat router för meddelandena
const router: Router = express.Router();

// Tillåter gäster utan JWT och verifierar JWT för inloggade användare
router.use(optionalAuthentication);

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
    chatId,
    senderId: res.locals.userId ?? "guest",
    text: text.trim(),
    createdAt: new Date().toISOString(),
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

    // DM: endast deltagare får skriva
    // Låst kanal: endast inloggade får skriva
    // Öppen kanal: även gäster får skriva
    const allowed =
      chat.type === "channel"
        ? chat.locked === false || Boolean(res.locals.userId)
        : chat.type === "dm" &&
        Boolean(res.locals.userId) &&
        Array.isArray(chat.members) &&
        chat.members.includes(res.locals.userId);

    if (!allowed) {
      return res.status(403).json({
        error: "Ingen behörighet till chatten",
      });
    }

    await dynamoDB.send(
      new PutCommand({
        TableName: "Chappy", // Databastabellen
        Item: {
          pk: `CHAT#${chatId}`, // Vilken chatt meddelandet tillhör
          sk: `MESSAGE#${message.createdAt}#${message.id}`, // Sorteringsnyckel med tid och ID
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

    // Kontrollerar att chatten finns innan behörigheten kontrolleras
    if (!chat) {
      return res.status(404).json({ error: "Chatten finns inte" });
    }

    // Öppen kanal: alla får läsa
    // Låst kanal: endast inloggade får läsa
    // DM: endast deltagare får läsa
    const allowed =
      chat.type === "channel"
        ? chat.locked === false || Boolean(res.locals.userId)
        : chat.type === "dm" &&
        Boolean(res.locals.userId) &&
        Array.isArray(chat.members) &&
        chat.members.includes(res.locals.userId);

    if (!allowed) {
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

    // Öppen kanal: alla får läsa metadata
    // Låst kanal: endast inloggade
    // DM: endast deltagare
    const allowed =
      chat.type === "channel"
        ? chat.locked === false || Boolean(res.locals.userId)
        : chat.type === "dm" &&
        Boolean(res.locals.userId) &&
        Array.isArray(chat.members) &&
        chat.members.includes(res.locals.userId);

    if (!allowed) {
      return res.status(403).json({
        error: "Ingen behörighet till chatten",
      });
    }

    // Skickar tillbaka chattens metadata
    return res.status(200).json(chat);

  } catch {
    return res.status(500).json({
      error: "Kunde inte hämta chattens metadata",
    });
  }
});



export default router;


// Funktion	  -     Öppen kanal    - Låst kanal	   - DM
// Gäst kan läsa	      Ja	            Nej	         Nej
// Gäst kan skriva	    Ja	            Nej	         Nej
// Inloggad kan läsa	  Ja	            Ja	         Endast deltagare
// Inloggad kan skriva	Ja	            Ja	         Endast deltagare