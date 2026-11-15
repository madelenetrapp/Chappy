
import { PutCommand } from "@aws-sdk/lib-dynamodb"
import { dynamoDB } from "../db/dynamoDB.js"
import type { Chat } from "../types/Chat.js"
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";

const channels: Chat[] = [
  {
    chatId: "allmant",
    type: "channel",
    name: "Allmänt",
    members: [],
    locked: false,
    createdAt: new Date().toISOString(),
  },
  {
    chatId: "fragor-och-hjalp",
    type: "channel",
    name: "Frågor och hjälp",
    members: [],
    locked: false,
    createdAt: new Date().toISOString(),
  },
  {
    chatId: "team",
    type: "channel",
    name: "Team",
    members: [],
    locked: true,
    createdAt: new Date().toISOString(),
  },
  {
    chatId: "intern-information",
    type: "channel",
    name: "Intern information",
    members: [],
    locked: true,
    createdAt: new Date().toISOString(),
  },
];

async function createChannels() {

  for (const channel of channels) {
    try {
      await dynamoDB.send(
        new PutCommand({
          TableName: "Chappy",

          Item: {
            pk: `CHAT#${channel.chatId}`,
            sk: "METADATA",
            ...channel,
          },

          ConditionExpression: "attribute_not_exists(pk)"
        })
      );
    } catch (error) {

      if (!(error instanceof ConditionalCheckFailedException)) {
        throw error;
      }
    }
  }
}

createChannels().catch((error: unknown) => {

  console.error("Kunde inte skapa kanaler", error);

  process.exitCode = 1;
});
