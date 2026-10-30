import express from "express"
import cors from "cors";
// import { error } from "node:console";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(
cors({
  origin: "http://localhost:5173",
})
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });                           //skapar endpoint för att bekräfta att API:et fungerar
})

app.post("/api/messages", (req, res) => {
  const { text } = req.body;

  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Ogiltigt meddelande" });
  }

  const message = {
    id: crypto.randomUUID(),
    text: text.trim(),
    sender: "user",
  };

  return res.status(201).json(message);
})

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);

});