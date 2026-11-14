import { type RequestHandler } from "express";
import jwt from "jsonwebtoken";

// Hämtar samma hemliga nyckel som används vid inloggning
const JWT_SECRET = process.env.JWT_SECRET;

// Stoppar backend om den hemliga nyckeln saknas
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET saknas i .env");
}

// Kontrollerar om användaren är inloggad, men tillåter även gäster
const optionalAuthentication: RequestHandler = (req, res, next) => {

  const authorization = req.headers.authorization;

  // om ingen tokan fortsätter användaren som gäst
  if (!authorization) {
    next();
    return;
} 

// kontrollerar att headern börjar med "Bearer"
// Bearer anger att användaren skickar en åtkonsttoken
if (!authorization.startsWith("Bearer ")) {
  res.status(401).json({ error: "Ogiltig Authorization-header" });
  return;
}

// tar bort "Bearer" så att endast tokan finns kvar
const token = authorization.slice(7);

try {
// verifierar token med samma hemliga nyckel som vid inloggning
// kontrollerar signaturen, giltighetstiden och algoritmen
const decoded = jwt.verify(token, JWT_SECRET,  {
  algorithms: ["HS256"],
});

// kontrollerar att token innehåller ett användar-id
if (
  typeof decoded === "string" ||
  typeof decoded.userId !== "string"
) {
  res.status(401).json({ error: "Ogiltig token" });
  return;
}

// sparar användarens ID tillfälligt för middlware och routes
// res.locals.userId används för att identifiera den inloggade användaren
res.locals.userId = decoded.userId;
  
// token är giltig - fortsätter till middleware eller route
next();

} catch {
  // nekar åtkomst om token är ogiltig eller har gått ut
  res.status(401).json({
    error: "Ogiltig eller utgången token",
  });
}
};

export { optionalAuthentication }