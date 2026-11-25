
import { ai, MODEL } from "../config/gemini.js";
import searchTavily from "../utils/tavily.js";
import { tmdbRequest } from "../utils/tmdb.js";

export const searchMoviesFromPrompt = async (prompt) => {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `You are a movie recommendation assistant. Your job is to find provide the best search query to perform the web search to get the results for users expected request.

    User's Prompt:
    "${prompt}"

    Return only valid search query nothing else.
    `,
  });

  let result = response.text.trim();
  result = result.replace(/```json|```/g, "").trim();

  console.log("Gemini Analyze Result:", result);

  const tavilyResult = await searchTavily(result);

  const second = await ai.models.generateContent({
    model: MODEL,
    contents: `You are a movie recommendation assistant. Your job is to take the answer of the web search agent and provide the best search query to perform on the the movie database to get the results for users expected request. The query has to be a list of queries.

    User's Prompt:
    "${prompt}"

    Web Search Result:
    "${tavilyResult["answer"] || tavilyResult.answer}"

    Return only valid JSON with:
    {
      "query": "[<list of search query strings>]"
    }`,
  });

  result = second.text.trim();
  result = result.replace(/```json|```/g, "").trim();

  console.log("Gemini Analyze Result 2:", JSON.parse(result));

  const queries = JSON.parse(result).query;

  const allResults = [];

  for (const query of queries) {
    const searchData = await tmdbRequest(
      `/search/multi?query=${encodeURIComponent(query)}&include_adult=false`
    );

    const results = searchData.results || [];

    allResults.push(...results);
  }

  // Remove duplicate movies/shows using their TMDB ID
  const uniqueResults = [
    ...new Map(allResults.map((item) => [item.id, item])).values(),
  ];

  return {
    totalResults: uniqueResults.length,
    movies: uniqueResults,
  };
};
