import "dotenv/config"; // Läser in miljövariabler från .env -- för att jag ska kunna få rätt koder när jag testar endpoints i insomnia (exempelvis JWT_SECRET som används för autentisering)
import express from "express"; // Ramverk för backend och API
import cors from "cors"; // Tillåter anrop från frontend
import messagesRouter from "./routes/messages.js"; //koppla router till server
import { authenticationRouter } from "./routes/authentication.js";
import { chatsRouter } from "./routes/chats.js";
import path from "node:path"; // Hanterar sökvägar till filer och mappar
import { fileURLToPath } from "node:url"; // Omvandlar filens URL till en vanlig sökväg

const app = express(); // Skapar Express-servern
const PORT = Number(process.env.PORT) || 3001; // Port från miljövariabel, annars 3001

// Hittar mappen där React-appen byggs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, "../../frontend/dist");

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

// Gör React-appens byggda filer tillgängliga via Express
app.use(express.static(frontendPath));

// Visar React-appen när användaren besöker en frontend-route
app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Startar backend och lyssnar på angiven port
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});





//POST http://localhost:3001/api/chats/dm