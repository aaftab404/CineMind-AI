
import "dotenv/config";

export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_TOKEN = process.env.TMDB_BEARER_TOKEN;

export const tmdbRequest = async (endpoint) => {
  const response = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${TMDB_TOKEN}`,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`TMDB Error: ${error}`);
  }

  return response.json();
};
