import type { Request, Response } from "express";
import * as fs from "fs";
import { getGroqCompletion } from "../config/groq-completion";
import { addToVectorStore } from "../lib/add-to-vector";

export const imageClassifyController = async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: "No Image file uploaded" });
    return;
  }

  const imagePath = req.file.path;

  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: "What's in this image?" },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${base64Image}` },
          },
        ],
      },
    ];

    const responseContent = await getGroqCompletion(
      messages,
      "llama-3.2-11b-vision-preview"
    );

    await addToVectorStore(responseContent, {
      source: req.file.originalname,
      type: "image_classification",
    });

    res.status(201).json({ response: responseContent });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error processing image" });
  }
};
