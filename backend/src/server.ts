
import "dotenv/config";
import express from "express";
import cors from "cors";
import messagesRouter from "./routes/messages.js";
import { authenticationRouter } from "./routes/authentication.js";
import { chatsRouter } from "./routes/chats.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { usersRouter } from "./routes/users.js";
import { channelsRouter } from "./routes/channels.js";
import { translationRouter } from "./routes/translation.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, "../../frontend/dist");

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.use("/api/authentication", authenticationRouter)

app.use("/api/messages", messagesRouter)

app.use("/api/channels", channelsRouter);

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/chats", chatsRouter)

app.use("/api/users", usersRouter)

app.use(express.static(frontendPath));

app.use("/api/translation", translationRouter);

app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
