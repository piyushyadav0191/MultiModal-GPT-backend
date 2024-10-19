import type { Request, Response } from "express"
import { reformulateSystemPrompt } from "../prompts/reformulate.system.prompt"
import { vectorStore } from "../lib/vector-store-initialzation"
import { getGroqCompletion } from "../config/groq-completion"

export const ChatController = async (req: Request, res: Response) => {

    const {message, history} = req.body
    try {
        const reformulatedQuestion = await reformulateSystemPrompt(message, history)

        const results = await vectorStore.similaritySearch(reformulatedQuestion, 3)

        const context = results.map((doc) => `[Source: ${doc.metadata.source ||"Unknown"}]\n${doc.pageContent}`).join("\n\n")

        const systemPrompt = `
        You are an AI assistant tasked with answering questions based on the content of websites, documents,and image classification
        Use the following pieces of retreived context to answer the user's question
        If the information is not in the context , say that you dont have that information.
        Always mention the source  of the information in your answer.
        Keep your answer concise, using no more than three sentences.

        Context:
        ${context}
        `

        const chatHistory = history.map((mes: any) => ({
            role: mes.role,
            content: mes.content
        }))

        const response = await getGroqCompletion([
          { role: "system", content: systemPrompt },
          ...chatHistory,
          {role: "user", content: reformulatedQuestion}
        ]);

        res.status(200).json({response: response, reformulatedQuestion: reformulatedQuestion})

    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Internal Server Error"})
    }

}