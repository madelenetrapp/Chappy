
import { Router } from "express";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDB } from "../db/dynamoDB.js";


const channelsRouter = Router();

channelsRouter.get("/", async (_req, res) => {
  try {
    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: "Chappy",
        FilterExpression: "sk = :metadata AND #type = :channel",
        ExpressionAttributeNames: {
          "#type": "type",
        },
        ExpressionAttributeValues: {
          ":metadata": "METADATA",
          ":channel": "channel",
        },
      })
    );

    res.json(result.Items ?? []);
  } catch (error) {
    console.error("Kunde inte hämta kanalerna:", error);
    res.status(500).json({ message: "kunde inte hämta kanaler" })
  }
});

export { channelsRouter }
