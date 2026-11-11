import { type RequestHandler } from "express";
import jwt from "jsonwebtoken";

//hämtar samma hemliga nyckel som anänvds vid inloggning.
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET saknas i .env");
}

//kontrollerar användarens token innan ett API-anrop tillåts
const requireAuthentication: RequestHandler = (req, res, next) => {
  const authorization = req.headers.authorization;


  //Token ska skickas som: Bearer <token>
  //authorization? kontrollerar att headern finns 
  //.startsWith("Bearer ") – kontrollerar att den börjar med Bearer . Standard för att skicka åtkomsttoken i HTTP-anrop. Bearer talar om vilken typ av autentisering som används.
  //.slice(7) – tar bort de sju första tecknen (Bearer ), så bara token återstår.
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : undefined;

  if (!token) {
    res.status(401).json({ error: "Token saknas" });
    return;
  }

  try {
    //Verifierar att token innehåller ett användar-ID
    //jwt.verify() – kontrollerar att token har en giltig signatur och inte har gått ut
    //Den hemliga nyckeln som också användes när token skapades
    //algorithms: ["HS256"] – tillåter endast signeringsalgoritmen HS256
    //decoded – innehåller informationen från den verifierade token
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],                                  //TODO: behövs anges?
    });

    if (typeof decoded === "string" || typeof decoded.userId !== "string") {
      res.status(401).json({ error: "Ogiltig token" });
      return;
    }

    //Gör användararens ID tillgängligt för nästa middleware eller route
    //decoded.userId – hämtar användarens ID från den verifierade token
    //res.locals - tillfällig lagringsplats under ett API anrop (finns bara under ansport inte permanent)
    //res.locals.userId – gör användarens ID tillgängligt för efterföljande middleware och routes
    res.locals.userId = decoded.userId;

    next();
  } catch {
    res.status(401).json({ error: "Ogiltig eller utgången token" });
  }
};

export { requireAuthentication }

//Anna loggar in och får en JWT med sitt userId.
//Anna skickar ett meddelande med sin token.
//Backend verifierar token och hämtar Annas userId.
//Backend kan spara meddelandet med Anna som avsändare i DynamoDB.

//backend måste verifiera token med samma algoritm som användes när den skapades. minskar risken för attacker. Använder: algorithms: ["HS256"] 
//algorithms: ["HS256"]  -- standardalgoritm i biblioteket jwt.verify()-funktionen -- samma backend skapar och verifierar JWT med en hämlig nyckel