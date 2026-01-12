
import { GoogleGenAI } from "@google/genai";
import { Message, UserProgress, Skill } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  }

  async generateResponse(
    messages: Message[],
    progress: UserProgress,
    skill: Skill | undefined
  ) {
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const systemInstruction = `
      You are Skill Bridge AI, an advanced, world-class intelligent assistant powered by Google Gemini.
      You behave like ChatGPT: conversational, insightful, and highly capable of answering any question.
      
      Your specialization is technical education and programming.
      
      CURRENT CONTEXT:
      - Active Track: ${skill?.name || 'General Chat (No track active)'}
      - Completed Topics: ${progress.completedTopicIds.length}
      
      RULES:
      1. Provide comprehensive, accurate, and helpful answers to ANY prompt.
      2. If asked about programming, provide clean, modern code examples in Markdown blocks.
      3. Use Markdown (bold, lists, headers) to make responses readable.
      4. Be encouraging and proactive. If a user asks something related to ${skill?.name || 'programming'}, mention how it fits into their learning journey.
      5. If the user mentions they finished a task, congratulate them warmly.
      6. If they ask a non-technical question, answer it gracefully while pivoting slightly back to how it might relate to their skills if possible.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: history,
        config: {
          systemInstruction,
          temperature: 0.8,
          topP: 0.95,
        },
      });

      return response.text || "I'm sorry, I encountered an issue generating a response.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "I'm currently experiencing high traffic or a connection issue. Please try again in a moment.";
    }
  }
}

export const gemini = new GeminiService();
