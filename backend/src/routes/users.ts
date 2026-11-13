import { Router } from "express";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDB } from "../db/dynamoDB.js";

const usersRouter = Router();

//hämtar alla registerade användare från dynamoDB
usersRouter.get("/", async (_req, res) => {
  try {
    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: "Chappy",
        FilterExpression: "sk = :profile",
        ExpressionAttributeValues: {
          ":profile": "PROFILE",
        },
        ProjectionExpression: "pk, username",
      })
    );

    //Returnerar endast användar-id och användarnamn
    const users = (result.Items ?? [])
      .filter(
        (user) =>
          typeof user.pk === "string" &&
          user.pk.startsWith("USER#") &&
          typeof user.username === "string"
      )
      .map((user) => ({
        userId: (user.pk as string).slice(5),
        username: user.username as string,
      }));
    return res.status(200).json(users);

  } catch (error) {
    console.error("Kunde inte hämta användare:", error);

    return res.status(500).json({
      error: "Kunde inte hämta användare",
    });
  }
});

export { usersRouter };