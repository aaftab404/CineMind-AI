
import { tmdbRequest } from "../utils/tmdb.js";
import { analyzePromptLocally } from "./promptAnalyzer.js";
import { rankMovies } from "./movieRanking.js";
import { generateRecommendationText } from "./responseTextService.js";

export const getMovieRecommendations = async (prompt) => {
  const criteria = analyzePromptLocally(prompt);
  const type = criteria.type;
  const similarIds = [];
  let candidates = [];
  let referenceFound = false;

  if (criteria.referenceTitle) {
    const searchData = await tmdbRequest(
      `/search/${type}?query=${encodeURIComponent(
        criteria.referenceTitle
      )}&include_adult=false`
    );

    const results = searchData.results || [];

    const reference =
      results.find((item) => {
        const title = (item.title || item.name || "").toLowerCase();
        return title === criteria.referenceTitle.toLowerCase();
      }) || results[0];

    if (reference) {
      referenceFound = true;

      const similarData = await tmdbRequest(
        `/${type}/${reference.id}/similar?language=en-US&page=1`
      );

      const similarMovies = similarData.results || [];

      similarIds.push(...similarMovies.map((item) => item.id));
      candidates.push(...similarMovies);
    }
  }

  const discoverParams = new URLSearchParams({
    language: "en-US",
    sort_by: "popularity.desc",
    include_adult: "false",
    page: "1",
  });

  if (criteria.genreId) {
    discoverParams.set("with_genres", criteria.genreId);
  }

  if (criteria.yearFrom) {
    discoverParams.set(
      type === "tv" ? "first_air_date.gte" : "primary_release_date.gte",
      `${criteria.yearFrom}-01-01`
    );
  }

  if (criteria.yearTo) {
    discoverParams.set(
      type === "tv" ? "first_air_date.lte" : "primary_release_date.lte",
      `${criteria.yearTo}-12-31`
    );
  }

  const discoverData = await tmdbRequest(
    `/discover/${type}?${discoverParams.toString()}`
  );

  candidates.push(...(discoverData.results || []));

  if (criteria.genreId && candidates.length < 5) {
    const fallbackParams = new URLSearchParams({
      language: "en-US",
      sort_by: "popularity.desc",
      include_adult: "false",
      page: "1",
    });

    if (criteria.yearFrom) {
      fallbackParams.set(
        type === "tv" ? "first_air_date.gte" : "primary_release_date.gte",
        `${criteria.yearFrom}-01-01`
      );
    }

    if (criteria.yearTo) {
      fallbackParams.set(
        type === "tv" ? "first_air_date.lte" : "primary_release_date.lte",
        `${criteria.yearTo}-12-31`
      );
    }

    const fallbackData = await tmdbRequest(
      `/discover/${type}?${fallbackParams.toString()}`
    );

    candidates.push(...(fallbackData.results || []));
  }

  let movies = rankMovies(candidates, criteria, type, similarIds);

  if (movies.length === 0 && criteria.genreId && referenceFound) {
    const relaxedCriteria = {
      ...criteria,
      genreId: null,
    };

    movies = rankMovies(candidates, relaxedCriteria, type, similarIds);
  }

  // Generate a personalized introduction using Gemini
  const responseText = movies.length
    ? await generateRecommendationText(prompt, movies)
    : "I couldn't find matching titles. Try changing your prompt!";

  return {
    message: movies.length
      ? "Recommendations found successfully"
      : "No matching titles found. Try changing your prompt.",

    responseText,

    criteria: {
      genre: criteria.genre,
      type,
      yearFrom: criteria.yearFrom,
      yearTo: criteria.yearTo,
      themes: criteria.themes,
      referenceTitle: criteria.referenceTitle,
    },

    referenceFound,
    totalResults: movies.length,
    movies,
  };
};
