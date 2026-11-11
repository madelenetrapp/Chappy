import "dotenv/config"; // Läser in miljövariabler från .env -- för att jag ska kunna få rätt koder när jag testar endpoints i insomnia (exempelvis JWT_SECRET som används för autentisering)
import express from "express"; // Ramverk för backend och API
import cors from "cors"; // Tillåter anrop från frontend
import messagesRouter from "./routes/messages.js"; //koppla router till server
import { authenticationRouter } from "./routes/authentication.js";
import { chatsRouter } from "./routes/chats.js";

const app = express(); // Skapar Express-servern
const PORT = Number(process.env.PORT) || 3001; // Port från miljövariabel, annars 3001

// Tillåter frontend att kommunicera med backend
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

//routerkopplingar:
// Gör JSON från inkommande anrop tillgänglig i req.body
app.use(express.json());

//Kopplar registreringen och inloggningen till API:et.
app.use("/api/authentication", authenticationRouter)

//kopplar meddelandet routern till API:et
app.use("/api/messages", messagesRouter)

//Endpoint
// GET: Kontrollerar att backend fungerar
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

//
app.use("/api/chats", chatsRouter)

// Startar backend och lyssnar på angiven port
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});





//POST http://localhost:3001/api/chats/dm