
import { Router } from "express";
import { translateText } from "../ai.js";

const translationRouter = Router();

translationRouter.post("/", async (req, res) => {

  const { text, targetLanguage } = req.body;

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

  const translatedText: string | null = await translateText(
    text,
    targetLanguage
  );

  if (!translatedText) {
    res.sendStatus(500);
    return;
  }

  res.status(200).json({ translatedText });

});

export { translationRouter }
