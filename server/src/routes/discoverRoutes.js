import express from "express";

import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getPopularTV,
  searchMoviesAndTV,
  getMovieGenres,
  getTVGenres,
  getGenreMovies,
} from "../controllers/discoverController.js";
const router = express.Router();

router.get("/trending", getTrendingMovies);
router.get("/popular", getPopularMovies);
router.get("/top-rated", getTopRatedMovies);
router.get("/upcoming", getUpcomingMovies);
router.get("/tv", getPopularTV);

router.get("/search", searchMoviesAndTV);
router.get("/genre/:section", getGenreMovies);
router.get("/genres/movies", getMovieGenres);
router.get("/genres/tv", getTVGenres);

export default router;