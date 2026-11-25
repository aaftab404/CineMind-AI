import { ai, MODEL } from "../config/gemini.js";

export const generateChatTitle = async (userMessage) => {
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: `
          Generate a short, meaningful title for this conversation.

          User's message: "${userMessage}"

          Rules:
          - Understand the main intent.
          - Create a natural, relevant title.
          - Use 3 to 6 words.
          - Return only the title.
          - No quotation marks or explanation.
        `,
      });

      const title = response.text
        ?.trim()
        .replace(/^["']|["']$/g, "");

      if (!title) {
        throw new Error("Gemini returned an empty title");
      }

      return title.slice(0, 60);
    } catch (error) {
      lastError = error;

      const is503 =
        error.status === 503 ||
        error.message?.includes("503") ||
        error.message?.includes("UNAVAILABLE");

      if (!is503 || attempt === 3) {
        break;
      }

      console.log(`Title generation retry ${attempt}/3`);

      await new Promise((resolve) =>
        setTimeout(resolve, 2000 * attempt)
      );
    }
  }

  throw lastError;
};