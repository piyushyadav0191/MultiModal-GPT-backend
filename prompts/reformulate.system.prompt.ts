import { getGroqCompletion } from "../config/groq-completion";

export const reformulateSystemPrompt = async (
  input: string,
  chatHistory: any[]
) => {
  const contextusalize_q_system_prompt = `
    Given a chat history and latest user question:
    1. If the question refers to previous context in the chat history, formulate a standalone question.
    2. If the question is a general programming or technical question, preserve it as is.
    3. If the question is seeking factual information from documents, preserve it as is.
    4. If this is a modification request, focus on the specific changes requested while maintaining context.
    
    DO NOT answer the question, just reformulate if needed based on chat history context.
    Ensure programming questions and modifications remain clear and specific.
  `;

  const messages = [
    { role: "system", content: contextusalize_q_system_prompt },
    ...chatHistory,
    { role: "user", content: input },
  ];

  return await getGroqCompletion(messages);
};
