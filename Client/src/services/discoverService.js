import { API_BASE_URL } from "./api.js";

const API_URL = `${API_BASE_URL}/discover`;

export const getTrendingMovies = async (page = 1) => {
  const response = await fetch(`${API_URL}/trending?page=${page}`);
  if (!response.ok) throw new Error("Failed to fetch trending movies");
  return response.json();
};

export const getPopularMovies = async (page = 1) => {
  const response = await fetch(`${API_URL}/popular?page=${page}`);
  if (!response.ok) throw new Error("Failed to fetch popular movies");
  return response.json();
};

export const getTopRatedMovies = async (page = 1) => {
  const response = await fetch(`${API_URL}/top-rated?page=${page}`);
  if (!response.ok) throw new Error("Failed to fetch top rated movies");
  return response.json();
};

export const getUpcomingMovies = async (page = 1) => {
  const response = await fetch(`${API_URL}/upcoming?page=${page}`);
  if (!response.ok) throw new Error("Failed to fetch upcoming movies");
  return response.json();
};

export const getPopularTV = async (page = 1) => {
  const response = await fetch(`${API_URL}/tv?page=${page}`);
  if (!response.ok) throw new Error("Failed to fetch popular TV shows");
  return response.json();
};

export const searchMoviesAndTV = async (query, page = 1) => {
  const response = await fetch(
    `${API_URL}/search?query=${encodeURIComponent(query)}&page=${page}`
  );

  if (!response.ok) throw new Error("Search failed");
  return response.json();
};

export const getMovieGenres = async () => {
  const response = await fetch(`${API_URL}/genres/movies`);
  if (!response.ok) throw new Error("Failed to fetch movie genres");
  return response.json();
};

export const getTVGenres = async () => {
  const response = await fetch(`${API_URL}/genres/tv`);
  if (!response.ok) throw new Error("Failed to fetch TV genres");
  return response.json();
};


// Get titles for a selected genre and Discover section
export const getGenreMovies = async (section, genreId, page = 1) => {
  const response = await fetch(
    `${API_URL}/genre/${section}?genreId=${genreId}&page=${page}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch genre titles");
  }

  return response.json();
};