import { groq } from "../lib/groq-initialization"
import dotenv from "dotenv";
dotenv.config();

export const getGroqCompletion = async (messages: any[], model="gemma2-9b-it") => {
    const completion = await groq.chat.completions.create({
        messages,
        model,
        temperature: 1,
        max_tokens: 1024,
        top_p:1,
        stream: false
    })
    return completion?.choices[0]?.message?.content || ""
}