
import express from "express";
import cors from "cors";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDB } from "./db/dynamoDB.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/api/messages", async (req, res) => {
  const { text } = req.body;

  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Ogiltigt meddelande" });
  }

  const message = {
    id: crypto.randomUUID(),
    text: text.trim(),
    sender: "user",
  };

  try {
    await dynamoDB.send(
      new PutCommand({
        TableName: "Chappy",
        Item: {
          pk: "CHAT#456",
          sk: `MESSAGE#${new Date().toISOString()}#${message.id}`,
          ...message,
        },
      })
    );
  } catch {
    return res.status(500).json({
      error: "Kunde inte spara meddelandet",
    });
  }

  return res.status(201).json(message);
});

app.get("/api/messages", async (_req, res) => {
  try {
    const result = await dynamoDB.send(
      new QueryCommand({
        TableName: "Chappy",
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",   //Hämta alla meddelanden i chatten, men inte exempelvis dess metadata
        ExpressionAttributeValues: {
          ":pk": "CHAT#456",
          ":prefix": "MESSAGE#",
        },
      })
    );

    return res.status(200).json(result.Items ?? []);
  } catch {
    return res.status(500).json({
      error: "Kunde inte hämta chatthistoriken",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
