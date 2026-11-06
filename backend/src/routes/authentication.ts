import { Router } from "express";
import { registrationSchema } from "../schemas/registrationSchema.js"; //importerar validering
import { TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
// sparar användarprofilen och reserverar användarnamnet i samma transaktion, antingen sparas båda posterna eller ingen, förhindrar att två samtidiga registeringar får samma användarnamn..
import { dynamoDB } from "../db/dynamoDB.js";
// återanvänder befintliga databasanslutningen
import { hashPassword } from "../utilities/password.js";
// importerar funktionen som hashar lösenord
import { TransactionCanceledException  } from "@aws-sdk/client-dynamodb";

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

    //Sparar användare i DynamoDB om användarnamnet redan finns avbryts hela transaktionen. oavsett stora eller små bokstäver.
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
                pk: `USERNAME#${username.toLocaleLowerCase()}`,
                sk: `RESERVATION`,
                userId,
              },
              ConditionExpression: "attribute_not_exists(pk)",
            },
          },
        ],
      }),
    );


  
    //Returneras endast om registreringen lyckades.
    return response.status(201).json({
      message: "Användaren har registrerats",
      userId,
    });

  } catch (error) {
    //fångar felet
    //kontrollerar om dynamodb har avbrutit transaktionen.

    //[1] är den andra operationen i TransactItems, där användarnamnet reserveras 
    //?. kontrollerar att informationen finns innan den läser
    // ConditionalCheckFailed = villkoret uppfylls inte - användarnamnet är redan reserverat.    (kontrollerar om registreraingen misslyckas för att användarnamnet redan finns = i så fall får användaren (409) ist för (500))
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

export { authenticationRouter };

// nu: lägger registrering och inloggning i en separat fil i stället för att skriva alla endpoints direkt i server.ts