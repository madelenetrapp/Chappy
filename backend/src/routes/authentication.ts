import { Router } from "express";
import { registrationSchema } from "../schemas/registrationSchema.js"; //importerar validering
import { PutCommand } from "@aws-sdk/lib-dynamodb";
// importerar kommandot för att spara data i DynamoDB
import { dynamoDB } from "../db/dynamoDB.js";
// återanvänder befintliga databasanslutningen
import { hashPassword } from "../utilities/password.js";
// importerar funktionen som hashar lösenord

const authenticationRouter = Router();

authenticationRouter.post("/register", async (request, response) => {
  //tar emot ett POST-anrop för att registrera en användare

  const validation = registrationSchema.safeParse(request.body);
  //kontrollerar om användaruppgifterna följer vårt Zod-schema

  if (!validation.success) {
    //avbryter om uppgifterna är ogiltiga.
    return response.status(400).json({
      error: "Ogiltigt användarnamn eller lösenord",
    });
  }

  const { username, password } = validation.data;
  // Hämtar de validerade uppgifterna.

  try {
    //försöker genomföra registreringen.
   const hashedPassword = await hashPassword(password);

    const userId = crypto.randomUUID();

    const newUser = {
      pk: `USER#${userId}`,
      sk: `PROFILE`,
      username,
      hashedPassword,
    };

    //Sparar användare i DynamoDB
    await dynamoDB.send(
      new PutCommand({
        TableName: "Chappy",
        Item: newUser,
        ConditionExpression: "attribute_not_exists(pk)",
      }),
    );

    //Returneras endast om registreringen lyckades.
    return response.status(201).json({
      message: "Användaren har registrerats",
      userId,
    });
  } catch {
    //hanterar fel utan att exponera känslig information.
    return response.status(500).json({
      error: "Registreringen misslyckades",
    });
  }
});

export { authenticationRouter };

// nu: lägger registrering och inloggning i en separat fil i stället för att skriva alla endpoints direkt i server.ts