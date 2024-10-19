import { getGroqCompletion } from "../config/groq-completion"

export const reformulateSystemPrompt = async (input: string, chatHistory: any[]) => {
    const contextusalize_q_system_prompt = `
    Given a chat history and latest user question 
    which might reference context in the chat history,
    formulate a standalone question which can be understood 
    without the chat history. DO NOT answer the question,
    just reformuate it if needed and otherwise return it as is.
    `

    const messages = [
        {role: "system", content: contextusalize_q_system_prompt},
        ...chatHistory,
        {role: "user", content: input}
    ]

    return await getGroqCompletion(messages)
}