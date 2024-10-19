import type { AstraLibArgs } from "@langchain/community/vectorstores/astradb";
import dotenv from "dotenv"
dotenv.config()

export const astraConfig: AstraLibArgs = {
    token: process.env.ASTRA_DB_TOKEN ?? "",
    endpoint: process.env.ASTRA_DB_ENDPOINT ?? "",
    collection: process.env.ASTRA_DB_COLLECTION ?? "test",
    collectionOptions: {
        vector: {
            dimension: 768,
            metric: "cosine",
        }
    }
}