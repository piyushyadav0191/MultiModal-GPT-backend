import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import type { Request, Response } from "express";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { vectorStore } from "../lib/vector-store-initialzation";
import * as fs from "fs";

export const PdfUploadController = async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: "No PDF file uploaded" });
    return;
  }
  const pdfPath = req.file.path;
  try {
    const loader = new PDFLoader(pdfPath);
    const docs = await loader.load();
    const textsplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await textsplitter.splitDocuments(docs);

    console.log(`Split into ${splitDocs.length} documents`);

    const docsWithMetaData = splitDocs.map((doc) => ({
      ...doc,
      metadata: { ...doc.metadata, source: req.file?.originalname },
    }));

    await vectorStore.addDocuments(docsWithMetaData);
    console.log("Documents added to the vector store");

    fs.unlink(pdfPath, (err) => {
      if (err) {
        console.log("Error deleting the PDF file");
      } else {
        console.log("PDF file deleted successfully");
      }
    });

    res.status(200).json({ message: "PDF file uploaded successfully" });
  } catch (error) {
    console.log(error);
    fs.unlink(pdfPath, () => {});
    res
      .status(500)
      .json({ message: "An error occurred while uploading the PDF file" });
  }
};
