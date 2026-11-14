import { PutCommand } from "@aws-sdk/lib-dynamodb"
import { dynamoDB } from "../db/dynamoDB.js"
import type { Chat } from "../types/Chat.js"
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";

//de fyra fasta kanalerna
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

//sparar kanelerna i DynamoDB
async function createChannels() {

  //går igenom och försöker apara en kanal i taget
  for (const channel of channels) {
    try {
      await dynamoDB.send(
        new PutCommand({
          TableName: "Chappy",

          // sparar kanalen med samma struktur som de andra chattarna
          Item: {
            pk: `CHAT#${channel.chatId}`,
            sk: "METADATA",
            ...channel,
          },

          // förhindrar att en kanal som redan finns skrivs över
          ConditionExpression: "attribute_not_exists(pk)"
        })
      );
    } catch (error) {

      // om kanalen redan finns fortsätter nästa kanal
      // andra fel skickas vidare
      if (!(error instanceof ConditionalCheckFailedException)) {
        throw error;
      }
    }
  }
}

// startar funktioenen när filen körs
createChannels().catch((error:unknown) => {

  // visar felet i terminalen om något går fel
  console.error("Kunde inte skapa kanaler", error);

  // markerar att scriptet misslyckas
  process.exitCode = 1;
});

// locked: false = gäster och inloggade ska kunna använda kanalen.
//locked: true = bara inloggade ska kunna använda kanalen.
//members: [] = vi har ingen separat medlemslista för dessa kanaler.