import express from "express";
import ScrapeRouter from "./routes/scrape.route";
import dotenv from "dotenv";
import { initVectorStore } from "./lib/vector-store-initialzation";
import PdfRouter from "./routes/pdf-upload.route";
import ImageClassifyRouter from "./routes/image-classify.route";
import ChatRouter from "./routes/chat.route";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/v1", ScrapeRouter);
app.use("/api/v1", PdfRouter);
app.use("/api/v1", ImageClassifyRouter);
app.use("/api/v1", ChatRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  initVectorStore();
});
