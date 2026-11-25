
import "dotenv/config";

export const searchTMDB = async (req, res) => {
  try {
    const { searchQuery, type = "movie", year } = req.body;

    if (!searchQuery || !searchQuery.trim()) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    if (!["movie", "tv"].includes(type)) {
      return res.status(400).json({
        message: "Type must be movie or tv",
      });
    }

    const endpoint = type === "tv" ? "search/tv" : "search/movie";

    const params = new URLSearchParams({
      query: searchQuery.trim(),
      language: "en-US",
      page: "1",
    });

    if (year) {
      params.set(
        type === "tv" ? "first_air_date_year" : "year",
        String(year)
      );
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/${endpoint}?${params}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: data.status_message || "TMDB search failed",
      });
    }

    const results = data.results.slice(0, 5).map((item) => ({
      id: item.id,
      title: item.title || item.name,
      overview: item.overview,
      poster: item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : null,
      releaseDate: item.release_date || item.first_air_date || null,
      rating: item.vote_average,
    }));

    res.status(200).json({
      message: "TMDB search successful",
      totalResults: data.total_results,
      movies: results,
    });
  } catch (error) {
    console.error("TMDB Search Error:", error.message);

    res.status(500).json({
      message: "Failed to search TMDB",
    });
  }
};
