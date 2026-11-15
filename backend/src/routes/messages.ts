
import express, { type Router } from "express";
import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDB } from "../db/dynamoDB.js";
import { optionalAuthentication } from "../middleware/optionalAuthentication.js";

const router: Router = express.Router();

router.use(optionalAuthentication);

router.post("/:chatId", async (req, res) => {
  const { chatId } = req.params;
  const { text } = req.body;

  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Ogiltigt meddelande" });
  }

  const message = {
    id: crypto.randomUUID(),
    chatId,
    senderId: res.locals.userId ?? "guest",
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  try {
    const result = await dynamoDB.send(
      new GetCommand({
        TableName: "Chappy",
        Key: {
          pk: `CHAT#${chatId}`,
          sk: `METADATA`,
        },
      })
    );

    const chat = result.Item;

    if (!chat) {
      return res.status(404).json({ error: "Chatten finns inte" });
    }

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
        TableName: "Chappy",
        Item: {
          pk: `CHAT#${chatId}`,
          sk: `MESSAGE#${message.createdAt}#${message.id}`,
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

router.get("/:chatId", async (req, res) => {
  const { chatId } = req.params;

  try {
    const chatResult = await dynamoDB.send(
      new GetCommand({
        TableName: "Chappy",
        Key: {
          pk: `CHAT#${chatId}`,
          sk: "METADATA",
        },
      })
    );

    const chat = chatResult.Item;

    if (!chat) {
      return res.status(404).json({ error: "Chatten finns inte" });
    }

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
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
        ExpressionAttributeValues: {
          ":pk": `CHAT#${chatId}`,
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

    const chat = result.Item;

    if (!chat) {
      return res.status(404).json({ error: "Chatten finns inte" });
    }

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

    return res.status(200).json(chat);

  } catch {
    return res.status(500).json({
      error: "Kunde inte hämta chattens metadata",
    });
  }
});

export default router;
