
import { apiFetch } from "./api.js";

const API_URL = "/favorites";

// Get user's favorites
export const getFavorites = async () => {
  const response = await apiFetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch favorites");
  }

  return response.json();
};

// Add favorite
export const addFavorite = async (movie) => {
  const response = await apiFetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(movie),
  });

  if (!response.ok) {
    throw new Error("Failed to add favorite");
  }

  return response.json();
};

// Remove favorite
export const removeFavorite = async (movieId, mediaType = "movie") => {
  const response = await apiFetch(
    `${API_URL}/${movieId}?media_type=${mediaType}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to remove favorite");
  }

  return response.json();
};
