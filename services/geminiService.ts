import { GoogleGenAI } from "@google/genai";
import { Match } from '../types';

const getAi = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable not set.");
    }
    return new GoogleGenAI({ apiKey });
};

export const getStrategy = async (match: Match): Promise<string> => {
  try {
    const ai = getAi();
    const prompt = `
      You are an expert Free Fire tournament strategist.
      Provide a winning strategy for the following match configuration:
      - Match Type: ${match.gameMode} (${match.subMode})
      - Map: ${match.map}

      Your advice should be tactical and concise, suitable for a competitive player.
      Structure your advice into three sections:
      1.  **Early Game (Looting & Initial Position):** Recommend best landing spots for this map and match type.
      2.  **Mid-Game (Rotation & Engagements):** Suggest how to rotate towards the safe zone and when to take or avoid fights.
      3.  **Late Game (Endgame Positioning):** Advise on how to secure the best position in the final circles for a 'Booyah!'.

      Keep the response clear, direct, and under 200 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error fetching strategy from Gemini API:", error);
    if (error instanceof Error && error.message.includes("API_KEY")) {
        return "Could not connect to the AI service. The API key is missing or invalid. Please ensure it is configured correctly by the application administrator.";
    }
    return "An unexpected error occurred while generating the AI strategy. The AI might be temporarily unavailable.";
  }
};