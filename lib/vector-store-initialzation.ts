import { AstraDBVectorStore } from "@langchain/community/vectorstores/astradb";
import { embeddings } from "../config/hugging-face-embeddings";
import { astraConfig } from "../config/astra-db";
import dotenv from "dotenv";
dotenv.config();

export let vectorStore: AstraDBVectorStore;

export const initVectorStore = async () => {
  vectorStore = await AstraDBVectorStore.fromExistingIndex(
    embeddings,
    astraConfig
  );
};
