import express from "express"

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);

});