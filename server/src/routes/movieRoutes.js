import { searchTMDB } from "../controllers/movieController.js";
import express from "express";

const router = express.Router();
router.post("/search", searchTMDB);

// Get popular movies from TMDB
router.get("/popular", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1",
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();

      return res.status(response.status).json({
        message: errorData.status_message || "TMDB request failed",
      });
    }

    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error("TMDB Error:", error.message);

    res.status(500).json({
      message: "Failed to fetch movies",
    });
  }
});

export default router;
