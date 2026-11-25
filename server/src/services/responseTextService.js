
import { ai, MODEL } from "../config/gemini.js";

export const generateRecommendationText = async (prompt, movies) => {
  try {
    const movieTitles = movies
      .map((movie) => movie.title || movie.name)
      .join(", ");

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `
        You are CineMind, a friendly movie recommendation assistant.

        User request: "${prompt}"

        Recommended movies: ${movieTitles}

        Write a short, engaging introduction (2-3 sentences)
        explaining why these movies match the user's request.

        Rules:
        - Sound natural and conversational.
        - Mention the user's interests.
        - Do not list all movie titles.
        - Do not use headings or markdown.
        - Return only the introduction.
      `,
    });

    return response.text?.trim() ||
      "Here are some movies you might enjoy based on your request!";
  } catch (error) {
    console.error("Gemini Response Text Error:", error.message);

    return "I found some movies that match your interests. Take a look at these recommendations!";
  }
};
