import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is available.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateProjectDescription = async (
  title: string,
  tags: string[],
  keyFeatures: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const model = "gemini-3-flash-preview";
    
    const prompt = `
      Write a compelling, professional portfolio description (approx 80-120 words) for a software project.
      Project Title: ${title}
      Technologies: ${tags.join(", ")}
      Key Features/Notes: ${keyFeatures}
      
      Tone: Professional, enthusiastic, technical but accessible.
      Focus on the value and the technical challenge.
      Do not include markdown headers (like ## Description). Just the text.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster simple text gen
      }
    });

    return response.text?.trim() || "Could not generate description.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate content. Please check your API key.");
  }
};