
import { tmdbRequest } from "../utils/tmdb.js";

// Get requested page
const getPage = (req) => {
  const page = parseInt(req.query.page, 10) || 1;
  return Math.min(Math.max(page, 1), 500);
};

// Trending movies
export const getTrendingMovies = async (req, res) => {
  try {
    const page = getPage(req);
    const data = await tmdbRequest(`/trending/movie/week?page=${page}`);
    return res.json(data);
  } catch (error) {
    console.error("Trending Movies Error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch trending movies",
    });
  }
};

// Popular movies
export const getPopularMovies = async (req, res) => {
  try {
    const page = getPage(req);
    const data = await tmdbRequest(`/movie/popular?page=${page}`);
    return res.json(data);
  } catch (error) {
    console.error("Popular Movies Error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch popular movies",
    });
  }
};

// Top rated movies
export const getTopRatedMovies = async (req, res) => {
  try {
    const page = getPage(req);
    const data = await tmdbRequest(`/movie/top_rated?page=${page}`);
    return res.json(data);
  } catch (error) {
    console.error("Top Rated Movies Error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch top rated movies",
    });
  }
};

// Upcoming movies
export const getUpcomingMovies = async (req, res) => {
  try {
    const page = getPage(req);
    const data = await tmdbRequest(`/movie/upcoming?page=${page}`);
    return res.json(data);
  } catch (error) {
    console.error("Upcoming Movies Error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch upcoming movies",
    });
  }
};

// Popular TV shows
export const getPopularTV = async (req, res) => {
  try {
    const page = getPage(req);
    const data = await tmdbRequest(`/tv/popular?page=${page}`);
    return res.json(data);
  } catch (error) {
    console.error("Popular TV Error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch popular TV shows",
    });
  }
};

// Search movies and TV shows
export const searchMoviesAndTV = async (req, res) => {
  try {
    const { query } = req.query;
    const page = getPage(req);

    if (!query || !query.trim()) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const data = await tmdbRequest(
      `/search/multi?query=${encodeURIComponent(query)}&page=${page}`
    );

    return res.json(data);
  } catch (error) {
    console.error("Search Error:", error.message);
    return res.status(500).json({
      message: "Failed to search movies and TV shows",
    });
  }
};

// Movie genres
export const getMovieGenres = async (req, res) => {
  try {
    const data = await tmdbRequest("/genre/movie/list");
    return res.json(data);
  } catch (error) {
    console.error("Movie Genres Error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch movie genres",
    });
  }
};

// TV genres
export const getTVGenres = async (req, res) => {
  try {
    const data = await tmdbRequest("/genre/tv/list");
    return res.json(data);
  } catch (error) {
    console.error("TV Genres Error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch TV genres",
    });
  }
};

// Get movies or TV shows by genre and Discover section
export const getGenreMovies = async (req, res) => {
  try {
    const { section } = req.params;
    const { genreId } = req.query;
    const page = getPage(req);

    if (!genreId || !/^\d+$/.test(genreId)) {
      return res.status(400).json({
        message: "A valid genre ID is required",
      });
    }

    const genre = Number(genreId);
    let data;

    switch (section) {
      case "trending": {
        // Fetch multiple trending pages and filter by genre
        const startPage = (page - 1) * 5 + 1;

        const pages = await Promise.all(
          Array.from({ length: 5 }, (_, index) =>
            tmdbRequest(
              `/trending/movie/week?page=${startPage + index}`
            )
          )
        );

        const results = pages
          .flatMap((item) => item.results || [])
          .filter((movie) =>
            movie.genre_ids?.includes(genre)
          )
          .slice(0, 20);

        data = {
          page,
          total_pages: 100,
          results,
        };

        break;
      }

      case "popular":
        data = await tmdbRequest(
          `/discover/movie?with_genres=${genre}&sort_by=popularity.desc&page=${page}`
        );
        break;

      case "topRated":
        data = await tmdbRequest(
          `/discover/movie?with_genres=${genre}&sort_by=vote_average.desc&vote_count.gte=200&page=${page}`
        );
        break;

      case "upcoming": {
        const today = new Date().toISOString().split("T")[0];

        data = await tmdbRequest(
          `/discover/movie?with_genres=${genre}&sort_by=release_date.asc&release_date.gte=${today}&page=${page}`
        );
        break;
      }

      case "tv":
        data = await tmdbRequest(
          `/discover/tv?with_genres=${genre}&sort_by=popularity.desc&page=${page}`
        );
        break;

      default:
        return res.status(400).json({
          message: "Invalid Discover section",
        });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Genre Discover Error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch genre titles",
    });
  }
};
