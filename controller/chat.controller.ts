import type { Request, Response } from "express";
import { reformulateSystemPrompt } from "../prompts/reformulate.system.prompt";
import { vectorStore } from "../lib/vector-store-initialzation";
import { getGroqCompletion } from "../config/groq-completion";

interface ChatMessage {
  role: string;
  content: string;
  reference?: string;
  modifiedFrom?: string;
}

export const ChatController = async (req: Request, res: Response) => {
  const { message, history, referenceId } = req.body;

  try {
    // Handle modification requests
    if (referenceId) {
      const previousMessage = history.find(
        (msg: ChatMessage) => msg.reference === referenceId
      );

      if (previousMessage) {
        const modificationPrompt = `
          Original content: "${previousMessage.content}"
          Modification request: "${message}"
          Apply the requested modification to the original content while maintaining context.
          If this is a code modification, ensure the modified code is complete and functional.
        `;

        const modifiedResponse = await getGroqCompletion([
          {
            role: "system",
            content:
              "You are tasked with modifying the previous response based on the user's request. Maintain context and apply the requested changes. For code modifications, ensure the code remains complete and functional.",
          },
          { role: "user", content: modificationPrompt },
        ]);

        return res.status(200).json({
          response: modifiedResponse,
          history: [
            ...history,
            {
              role: "assistant",
              content: modifiedResponse,
              reference: `mod_${Date.now()}`,
              modifiedFrom: referenceId,
            },
          ],
        });
      }
    }

    // Handle new questions
    const reformulatedQuestion = await reformulateSystemPrompt(
      message,
      history
    );

    // Get vector store results
    const results = await vectorStore.similaritySearch(reformulatedQuestion, 3);
    const context = results
      .map(
        (doc) =>
          `[Source: ${doc.metadata.source || "Unknown"}]\n${doc.pageContent}`
      )
      .join("\n\n");

    // Check context relevance
    const relevanceCheckPrompt = `
      Question: "${reformulatedQuestion}"
      Context: "${context}"
      
      Is the provided context directly relevant to answering the question? 
      Respond with either "RELEVANT" or "NOT_RELEVANT".
      If the context doesn't provide specific information about the exact topic being asked, respond with "NOT_RELEVANT".
    `;

    const relevanceCheck = await getGroqCompletion([
      {
        role: "system",
        content:
          "You are a relevance checking assistant. Be strict in determining relevance.",
      },
      { role: "user", content: relevanceCheckPrompt },
    ]); // REVELANT OR NOT_RELEVANT

    let systemPrompt;
    if (relevanceCheck.includes("RELEVANT")) {
      // Use vector store context for domain-specific questions
      systemPrompt = `
        You are an AI assistant tasked with answering questions based on the content of websites, documents, and image classification.
        Use the following pieces of retrieved context to answer the user's question.
        Always mention the source of the information in your answer.
        Keep your answer concise, using no more than three sentences.
        
        Context:
        ${context}
      `;
    } else {
      // Use general knowledge for common programming/technical questions
      systemPrompt = `
        You are a helpful AI assistant with expertise in programming, technology, and general knowledge.
        Provide clear, accurate, and practical answers to questions.
        If the question is about programming, include relevant code examples.
        Keep your answers concise but informative.
        When providing code examples, ensure they are complete and functional.
      `;
    }

    const chatHistory = history.map((mes: ChatMessage) => ({
      role: mes.role,
      content: mes.content,
    }));

    const response = await getGroqCompletion([
      { role: "system", content: systemPrompt },
      ...chatHistory,
      { role: "user", content: reformulatedQuestion },
    ]);

    // Generate a unique reference ID for this response
    const responseId = `resp_${Date.now()}`;

    // Create new message history
    const newHistory = [
      ...history,
      { role: "user", content: message },
      {
        role: "assistant",
        content: response,
        reference: responseId,
        timestamp: Date.now(),
      },
    ];

    res.status(200).json({
      response,
      reformulatedQuestion,
      history: newHistory,
      responseId,
      isVectorStoreResponse: relevanceCheck.includes("RELEVANT"),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
