import { Router } from "express";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDB } from "../db/dynamoDB.js";


// skapar en router för kanalernas endpoint
const channelsRouter = Router();

// hämtar alla kanaler från dynamodb
channelsRouter.get("/", async (_req, res) => {
   try {
    // hämtar endast poster som är kanalens metadata
    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: "Chappy",
        FilterExpression: "sk = :metadata AND #type = :channel",   //// Hämtar bara poster där sk är "METADATA" och type är "channel", så att DM och andra poster filtreras bort.
        ExpressionAttributeNames: {
          "#type": "type",  //reserverat ord
        },
        ExpressionAttributeValues: {
          ":metadata": "METADATA",
          ":channel": "channel", 
        },
      })
    );

    // skickar tillbaka kanalerna som JSON
    res.json(result.Items ?? []);
   } catch (error) {
    console.error("Kunde inte hämta kanalerna:", error);
    res.status(500).json({ message: "kunde inte hämta kanaler" })
   }
});

export { channelsRouter }