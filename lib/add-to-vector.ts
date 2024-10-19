import { embeddings } from "../config/hugging-face-embeddings"
import { vectorStore } from "./vector-store-initialzation"

export const addToVectorStore = async (content: string, metadata: any) => {
    const embeddingResult = await embeddings.embedQuery(content)
    const docsWithMetaData = {
        pageContent: content,
        metadata,
        embedding: embeddingResult
    }
    await vectorStore.addDocuments([docsWithMetaData])
}