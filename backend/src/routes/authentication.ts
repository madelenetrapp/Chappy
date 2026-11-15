
import { Router } from "express";
import { registrationSchema } from "../schemas/registrationSchema.js";
import { TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDB } from "../db/dynamoDB.js";
import { hashPassword } from "../utilities/password.js";
import { TransactionCanceledException } from "@aws-sdk/client-dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { verifyPassword } from "../utilities/password.js"
import jwt from "jsonwebtoken";

const authenticationRouter = Router();

const JWT_SEACRET = process.env.JWT_SECRET;

if (!JWT_SEACRET) {
  throw new Error("JWT_SECRET saknas i .env")
}

authenticationRouter.post("/register", async (request, response) => {

  const validation = registrationSchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).json({
      error: "Ogiltigt användarnamn eller lösenord",
    });
  }

  const { username, password } = validation.data;

  try {
    const hashedPassword = await hashPassword(password);

    const userId = crypto.randomUUID();

    const newUser = {
      pk: `USER#${userId}`,
      sk: `PROFILE`,
      username,
      hashedPassword,
    };

    await dynamoDB.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: "Chappy",
              Item: newUser,
              ConditionExpression: "attribute_not_exists(pk)",
            },
          },
          {
            Put: {
              TableName: "Chappy",
              Item: {
                pk: `USERNAME#${username.toLowerCase()}`,
                sk: `RESERVATION`,
                userId,
              },
              ConditionExpression: "attribute_not_exists(pk)",
            },
          },
        ],
      }),
    );

    return response.status(201).json({
      message: "Användaren har registrerats",
      userId,
    });

  } catch (error) {
    console.error("Registreringsfel:", error);

    if (
      error instanceof TransactionCanceledException &&
      error.CancellationReasons?.[1]?.Code === "ConditionalCheckFailed"
    ) {
      return response.status(409).json({
        error: "Användarnamnet är redan upptaget",
      });
    }

    return response.status(500).json({
      error: "Registreringen misslyckades",
    });
  }
});

authenticationRouter.post("/login", async (request, response) => {
  const validation = registrationSchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).json({
      error: "Ogiltigt användarnamn eller lösenord",
    });
  }

  const { username, password } = validation.data;

  const usernameResult = await dynamoDB.send(
    new GetCommand({
      TableName: "Chappy",
      Key: {
        pk: `USERNAME#${username.toLowerCase()}`,
        sk: "RESERVATION",
      },
    }),
  );

  const userId = usernameResult.Item?.userId;

  if (typeof userId !== "string") {
    return response.status(401).json({
      error: "Felaktigt användarnamn eller lösenord",
    });
  }

  const userResult = await dynamoDB.send(
    new GetCommand({
      TableName: "Chappy",
      Key: {
        pk: `USER#${userId}`,
        sk: "PROFILE",
      },
    }),
  );

  const hashedPassword = userResult.Item?.hashedPassword;

  if (typeof hashedPassword !== "string") {
    return response.status(401).json({
      error: "Felaktigt användarnamn eller lösenord",
    });
  }

  const passwordMatches = await verifyPassword(password, hashedPassword);

  if (!passwordMatches) {
    return response.status(401).json({
      error: "Felaktigt användarnamn eller lösenord",
    });
  }

  const token = jwt.sign(
    { userId },
    JWT_SEACRET,
    { expiresIn: "1h" }
  );

  return response.status(200).json({
    token,
    userId,
  });

});


export { authenticationRouter };
