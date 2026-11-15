import { Router } from "express";
// Importerar funktionen som översätter text med Gemini
import { translateText } from "../ai.js";


// Skapar en separat router för AI-översättning
const  translationRouter = Router();

// tar emot text som ska översättas till ett valt språk
translationRouter.post("/", async (req, res) => {

  // hämtar meddelandet och språket från frontend
  const { text, targetLanguage } = req.body;

  // kontrollerar att både text och språk har skickats
  if (
    typeof text !== "string" ||
    !text.trim() ||
    typeof targetLanguage !== "string" ||
    !targetLanguage.trim()
  ) {
    res.status(400).json({
      error: "Text och språk måste anges",
    });

    return;
  }

// Skickar texten till Gemini och väntar på översättning
const translatedText: string | null = await translateText(
  text,
  targetLanguage
);

// kontrollerar om gemini misslyckas
if (!translatedText) {
  res.sendStatus(500);
  return;
}

res.status(200).json({ translatedText });

});

export { translationRouter }