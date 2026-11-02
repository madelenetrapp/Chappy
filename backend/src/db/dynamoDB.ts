
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// Importerar AWS-klienten som ansluter till DynamoDB.

import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
// Importerar en klient som förenklar hanteringen av data.

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "eu-north-1"
  // Hämtar AWS-regionen från .env, annars används Stockholm.
});

const dynamoDB = DynamoDBDocumentClient.from(client);
// Skapar en DocumentClient utifrån AWS-klienten.

export { dynamoDB };
// Gör klienten tillgänglig för andra filer, exempelvis server.ts.
