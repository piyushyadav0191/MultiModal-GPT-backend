import { groq } from "../lib/groq-initialization"
import dotenv from "dotenv";
dotenv.config();

export const getGroqCompletion = async (messages: any[], model="gemma2-9b-it") => {
    let starttime = Date.now();
    const completion = await groq.chat.completions.create({
        messages,
        model,
        temperature: 1,
        max_tokens: 1024,
        top_p:1,
        stream: true
    })
   let fullMessage = "";

   for await (const chunk of completion) {
     const chunkTime = (Date.now() - starttime) / 1000;
     fullMessage += chunk.choices[0].delta.content || "";
         process.stdout.write(JSON.stringify(chunk.choices[0]?.delta || ""));
         console.log(" chunk time:", chunkTime);
   }

   return fullMessage;
}