import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();
import ScrapeRouter from "./routes/scrape.route";
import PdfRouter from "./routes/pdf-upload.route";
import ImageClassifyRouter from "./routes/image-classify.route";
import ChatRouter from "./routes/chat.route";
import cors from "cors"

const app = express();

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(cors())

app.use(express.json());

app.use("/api/v1", ScrapeRouter, PdfRouter, ImageClassifyRouter, ChatRouter);

export default app;
