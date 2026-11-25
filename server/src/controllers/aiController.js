import { ai, MODEL } from "../config/gemini.js";
import { TMDB_TOKEN } from "../utils/tmdb.js";

import { searchMoviesFromPrompt } from "../services/movieSearchService.js";
import { getMovieRecommendations } from "../services/recommendationService.js";

// -------------------- ERROR HANDLER --------------------

const handleAIError = (error, res, defaultMessage) => {
  console.error("AI Error:", error.message);

  const errorMessage = error.message || String(error);

  const isUnavailable =
    error.status === 503 ||
    error.code === 503 ||
    errorMessage.includes("503") ||
    errorMessage.includes("UNAVAILABLE");

  if (isUnavailable) {
    return res.status(503).json({
      message: "Our AI is temporarily busy. Please try again in a moment. 🎬",
      retryable: true,
    });
  }

  return res.status(500).json({
    message: defaultMessage,
    error: errorMessage,
  });
};

// -------------------- GEMINI TEST --------------------

export const testGemini = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        message: "Please enter a prompt",
      });
    }

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    return res.status(200).json({
      message: response.text,
    });
  } catch (error) {
    return handleAIError(error, res, "Gemini test failed");
  }
};

// -------------------- ANALYZE PROMPT --------------------

export const analyzeMoviePrompt = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        message: "Please enter a prompt",
      });
    }

    const data = await searchMoviesFromPrompt(prompt);

    return res.status(200).json(data);
  } catch (error) {
    return handleAIError(error, res, "Prompt analysis failed");
  }
};

// -------------------- RECOMMEND MOVIES --------------------

export const recommendMovies = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        message: "Please enter a movie recommendation prompt",
      });
    }

    if (!TMDB_TOKEN) {
      return res.status(500).json({
        message: "TMDB Bearer token is missing in environment variables",
      });
    }

    const data = await getMovieRecommendations(prompt);

    return res.status(200).json(data);
  } catch (error) {
    return handleAIError(error, res, "Failed to get movie recommendations");
  }
};