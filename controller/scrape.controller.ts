/**
 *
 * @param req url -> https://www.example.com
 * @param res message, documentAdded
 *
 * Data Ingestion
 * Text splitter
 * Save to Vectore Store
 *
 **/

import type { Request, Response } from "express";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { vectorStore } from "../lib/vector-store-initialzation";
import type { DocumentInterface } from "@langchain/core/documents";

export const ScrapeController = async (req: Request, res: Response) => {
  const { url } = req.body;
  console.log("Scraping the URL: ", url);
  try {
    const loader = new CheerioWebBaseLoader(url);
    const docs = (await loader.load()).map((doc): DocumentInterface => {
      const contentTags = [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "p",
        "li",
        "div",
        "span",
        "a",
        "strong",
        "em",
        "blockquote",
        "pre",
        "code",
        "ol",
        "ul",
      ];
      const contentTagsRegex = contentTags.join("|");

      // Remove script tags and their content
      let cleanedContent = doc.pageContent.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        ""
      );

      // Remove inline JavaScript
      cleanedContent = cleanedContent.replace(/ on\w+="[^"]*"/g, "");
      cleanedContent = cleanedContent.replace(/ on\w+='[^']*'/g, "");
      cleanedContent = cleanedContent.replace(/ on\w+=\w+/g, "");

      // Remove javascript: URLs
      cleanedContent = cleanedContent.replace(
        /javascript:\s*[\S\s]*?["']/gi,
        ""
      );

      // Keep only content-bearing tags and their content, remove all attributes
      cleanedContent = cleanedContent.replace(
        new RegExp(`<(${contentTagsRegex})(?:\\s+[^>]*)?>(.*?)<\\/\\1>`, "gis"),
        (match, tag, content) => {
          // Recursively clean nested tags
          const cleanedInnerContent = content.replace(
            new RegExp(
              `<(${contentTagsRegex})(?:\\s+[^>]*)?>(.*?)<\\/\\1>`,
              "gis"
            ),
            "<$1>$2</$1>"
          );
          return `<${tag}>${cleanedInnerContent}</${tag}>`;
        }
      );

      // Remove any remaining HTML tags
      cleanedContent = cleanedContent.replace(/<[^>]+>/g, "");

      // Remove empty lines and extra whitespace
      const trimmedContent = cleanedContent
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join("\n");

      return {
        ...doc,
        pageContent: trimmedContent,
      };
    });

    const textsplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await textsplitter.splitDocuments(docs);
    console.log(`split into ${splitDocs.length} documents`);
    const docsWithMetaData = splitDocs.map((doc) => ({
      ...doc,
      metadata: { ...doc.metadata, source: url },
    }));
    await vectorStore.addDocuments(docsWithMetaData);
    console.log("Document added to vector store");
    res
      .status(200)
      .json({ message: "Document added", documentsAdded: splitDocs.length });
  } catch (error) {
    console.log("Error during scraping: ", error);
    res.status(500).json({ message: "Error during scraping" });
  }
};
