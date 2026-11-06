import { Router } from "express";

//importerar validering
import { registrationSchema } from "../schemas/registrationSchema.js"; 
// sparar användarprofilen och reserverar användarnamnet i samma transaktion, antingen sparas båda posterna eller ingen, förhindrar att två samtidiga registeringar får samma användarnamn..
import { TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
// återanvänder befintliga databasanslutningen
import { dynamoDB } from "../db/dynamoDB.js";
// importerar funktionen som hashar lösenord
import { hashPassword } from "../utilities/password.js";
// Hanterar fel när en DynamoDB-transaktion avbryts.
import { TransactionCanceledException  } from "@aws-sdk/client-dynamodb";
//Hämtar en specifik post från dynamoDB.
import { GetCommand } from "@aws-sdk/lib-dynamodb";

//kontrollerar om lösenordet matchar det hashade lösenordet
import { verifyPassword } from "../utilities/password.js"

//Används för att sakapa JWT vid lyckad inloggning.
import jwt from "jsonwebtoken";



const authenticationRouter = Router();

//Hämtar den hemliga nyckeln från miljövariablerna
const JWT_SEACRET = process.env.JWT_SECRET;

//Storppar serverstarten om nyckeln saknas
if (!JWT_SEACRET) {
  throw new Error("JWT_SECRET saknas i .env")
}


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
// 1. await dynamoDB.send() – skickar kommandot till databasen och väntar på resultatet.
// 2. new TransactWriteCommand() – skapar en transaktion. Antingen lyckas alla operationer eller ingen.
// 3. TransactItems – en array med de två operationerna som ska utföras.
// 4. Första Put – sparar användarprofilen (newUser) med användar-ID, användarnamn och hashat lösenord.
// 5. Andra Put – reserverar användarnamnet:
// - pk: USERNAME#... identifierar användarnamnet.
// - toLowerCase() gör att Anna och ANNA behandlas som samma användarnamn.
// - sk: "RESERVATION" anger postens sorteringsnyckel.
// - userId kopplar användarnamnet till användarprofilen.
// 6. ConditionExpression: "attribute_not_exists(pk)" – tillåter bara att posten skapas om dess nyckel inte redan finns.



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

//Tar emot ett POST-anrop för att logga in en användare.
authenticationRouter.post("/login", async (request, response) => {
  //validerar användarnamn och lösenord med befintligt zod-schema
  const validation = registrationSchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).json({
      error: "Ogiltigt användarnamn eller lösenord",
    });
  }

  const { username, password } = validation.data;

  // Nästa steg: hämta användaren från dynamo

// Hämtar användarnamnets reservation från dynamodb.
const usernameResult = await dynamoDB.send(
  new GetCommand({
    TableName: "Chappy",
    Key: {
      pk: `USERNAME#${username.toLowerCase()}`,
      sk: "RESERVATION",
    },
  }),
);

//Hämtar användarens ID från reservationen.
const userId = usernameResult.Item?.userId;

//Avbryter inloggningen om användarnamnet inte finns.
if (typeof userId !== "string") {
  return response.status(401).json({
    error: "Felaktigt användarnamn eller lösenord",
  });
}

// hämtar användarprofilen från dynamoDB med användarens ID.
const userResult = await dynamoDB.send(
  new GetCommand({
    TableName: "Chappy",
    Key: {
      pk: `USER#${userId}`,
      sk: "PROFILE",
    },
  }),
);

//Hämtar det hashade lösenordet från användarprofilen
const hashedPassword = userResult.Item?.hashedPassword;

//Avbryter om användarprofilen eller lösenordshashen saknas.
if (typeof hashedPassword !== "string") {
  return response.status(401).json({
    error: "Felaktigt användarnamn eller lösenord",
  });
}

//Jämför det angivna lösenordet med den sparade hashen.
// verifyPassword() använder bcrypt för att kontrollera lösenordet utan att vi behöver spara det i klartext.
const passwordMatches = await verifyPassword(password, hashedPassword);

if (!passwordMatches) {
  return response.status(401).json({
    error: "Felaktigt användarnamn eller lösenord",
  });
}

//Skapar en signerad JWT med användarens id
const token = jwt.sign(                           //skapar och signerar token
  { userId },                                     // identifierar den inloggade användaren
  JWT_SEACRET,                                    //används för signeringen
  { expiresIn: "1h" }                             //innebär att token går ut efter en timma
);

//Skickar tillbaka token när inloggningen lyckas
return response.status(200).json({
  token,                                              // token - innehåller användarens signerade JWT
})


});


export { authenticationRouter };

// nu: lägger registrering och inloggning i en separat fil i stället för att skriva alla endpoints direkt i server.ts