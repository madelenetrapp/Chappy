import express from "express"

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });                           //skapar endpoint för att bekräfta att API:et fungerar
})

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);

});