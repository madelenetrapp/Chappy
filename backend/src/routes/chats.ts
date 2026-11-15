
import { Router } from "express";

import {
  GetCommand,
  QueryCommand,
  TransactWriteCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { dynamoDB } from "../db/dynamoDB.js";
import { requireAuthentication } from "../middleware/requireAuthentication.js";
import type { Chat } from "../types/Chat.js";

const chatsRouter = Router();

chatsRouter.use(requireAuthentication);

chatsRouter.post("/dm", async (req, res) => {

  const { username } = req.body;

  const userId = res.locals.userId;

  if (typeof username !== "string" || !username.trim()) {
    return res.status(400).json({ error: "Ogiltigt användarnamn" });
  }

  try {
    const userResult = await dynamoDB.send(
      new GetCommand({
        TableName: "Chappy",

        Key: {
          pk: `USERNAME#${username.trim().toLocaleLowerCase()}`,

          sk: "RESERVATION",
        },
      })
    );

    const recipientId = userResult.Item?.userId;

    if (typeof recipientId !== "string") {
      return res.status(404).json({ error: "Användaren finns inte" });
    }

    if (userId === recipientId) {
      return res.status(400).json({
        error: "Du kan inte starta en DM med dig själv",
      });
    }

    const members = [userId, recipientId].sort();

    const chatId = `dm-${members.join("-")}`;

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

      for (const memberId of members) {
        try {
          await dynamoDB.send(
            new PutCommand({
              TableName: "Chappy",

              Item: {
                pk: `USER#${memberId}`,
                sk: `CHAT#${chatId}`,
                chatId,
                type: "dm",
              },

              ConditionExpression: "attribute_not_exists(pk)",
            })
          );
        } catch (error) {

          if (!(error instanceof ConditionalCheckFailedException)) {
            throw error;
          }
        }
      }

      return res.status(200).json(existing.Item);
    }

    const chat: Chat = {
      chatId,
      type: "dm",
      members,
      locked: true,
      createdAt: new Date().toISOString(),
    };

    await dynamoDB.send(
      new TransactWriteCommand({

        TransactItems: [
          {
            Put: {
              TableName: "Chappy",

              Item: {
                pk: `CHAT#${chatId}`,
                sk: "METADATA",
                ...chat,
              },

              ConditionExpression: "attribute_not_exists(pk)",
            },
          },

          ...members.map((memberId) => ({
            Put: {
              TableName: "Chappy",

              Item: {
                pk: `USER#${memberId}`,
                sk: `CHAT#${chatId}`,
                chatId,
                type: "dm",
              },
            },
          })),
        ],
      })
    );

    return res.status(201).json(chat);

  } catch {
    return res.status(500).json({ error: "Kunde inte skapa DM" });
  }
});

chatsRouter.get("/", async (req, res) => {

  const userId = res.locals.userId;

  try {
    const result = await dynamoDB.send(
      new QueryCommand({
        TableName: "Chappy",

        KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",

        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":sk": "CHAT#",
        },
      })
    );

    return res.status(200).json(result.Items ?? []);

  } catch {
    return res.status(500).json({
      error: "Kunde inte hämta chattar",
    });
  }
});

export { chatsRouter };
