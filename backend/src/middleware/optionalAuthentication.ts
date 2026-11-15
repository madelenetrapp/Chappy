
import { type RequestHandler } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET saknas i .env");
}

const optionalAuthentication: RequestHandler = (req, res, next) => {

  const authorization = req.headers.authorization;

  if (!authorization) {
    next();
    return;
  }

  if (!authorization.startsWith("Bearer ")) {
    res.status(401).json({ error: "Ogiltig Authorization-header" });
    return;
  }

  const token = authorization.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (
      typeof decoded === "string" ||
      typeof decoded.userId !== "string"
    ) {
      res.status(401).json({ error: "Ogiltig token" });
      return;
    }

    res.locals.userId = decoded.userId;

    next();

  } catch {
    res.status(401).json({
      error: "Ogiltig eller utgången token",
    });
  }
};

export { optionalAuthentication };
