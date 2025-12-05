import { GoogleGenAI, Type } from "@google/genai";
import { MathQuestion } from "../types";

// Note: In a real production app, this key should be proxied through a backend.
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const generateMathChallenge = async (difficulty: 'easy' | 'medium' | 'hard'): Promise<MathQuestion> => {
  if (!apiKey) {
    console.warn("No API Key provided. Returning fallback question.");
    return getFallbackQuestion(difficulty);
  }

  const prompt = `Generate a single arithmetic ${difficulty} question suitable for a quick mental math challenge to unlock a phone screen.
  Easy: Basic addition/subtraction (e.g. 12 + 15).
  Medium: Multiplication/Division (e.g. 12 * 4).
  Hard: Mixed operations or larger numbers (e.g. 15 * 3 - 10).
  Return JSON with the question string, the numeric answer, and an array of 4 options (including the correct one).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.NUMBER },
            options: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER }
            },
            difficulty: { type: Type.STRING } // Just to confirm the model's intent
          },
          required: ['question', 'answer', 'options']
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as MathQuestion;
      // Ensure options are unique and contain the answer
      const uniqueOptions = Array.from(new Set([...data.options, data.answer])).slice(0, 4);
      // Shuffle options simply
      data.options = uniqueOptions.sort(() => Math.random() - 0.5);
      return data;
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return getFallbackQuestion(difficulty);
  }
};

const getFallbackQuestion = (difficulty: string): MathQuestion => {
  // Simple fallback logic if API fails or no key
  const num1 = Math.floor(Math.random() * 20) + 5;
  const num2 = Math.floor(Math.random() * 10) + 2;
  let q = `${num1} + ${num2}`;
  let a = num1 + num2;

  if (difficulty === 'medium') {
    q = `${num1} × ${num2}`;
    a = num1 * num2;
  } else if (difficulty === 'hard') {
    const num3 = Math.floor(Math.random() * 10);
    q = `${num1} × ${num2} - ${num3}`;
    a = (num1 * num2) - num3;
  }

  const options = [
    a,
    a + Math.floor(Math.random() * 5) + 1,
    a - Math.floor(Math.random() * 5) - 1,
    a + 10
  ].sort(() => Math.random() - 0.5);

  return {
    question: q,
    answer: a,
    options: options,
    difficulty: difficulty as any
  };
};

export const generateMotivation = async (): Promise<string> => {
  if (!apiKey) return "Stay focused! You are doing great.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Give me a very short (max 15 words) motivational quote about focus and digital minimalism.",
    });
    return response.text || "Focus is the key to productivity.";
  } catch (e) {
    return "Reclaim your time.";
  }
};