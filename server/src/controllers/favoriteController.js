
import pool from "../config/db.js";

// Get logged-in user's favorites
export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT *
       FROM favorites
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get Favorites Error:", error.message);
    res.status(500).json({ message: "Failed to fetch favorites" });
  }
};

// Add favorite
export const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      id,
      tmdb_id,
      media_type,
      title,
      name,
      poster_path,
      poster,
      release_date,
      first_air_date,
      year,
      vote_average,
      rating,
      genre_ids,
      genreIds,
    } = req.body;

    const movieId = tmdb_id || id;
    const movieTitle = title || name;

    if (!movieId || !movieTitle) {
      return res.status(400).json({
        message: "Movie ID and title are required",
      });
    }

    const mediaType = media_type || "movie";

    const result = await pool.query(
      `INSERT INTO favorites (
        user_id,
        tmdb_id,
        media_type,
        title,
        poster_path,
        release_date,
        vote_average,
        genre_ids
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (user_id, tmdb_id, media_type)
      DO NOTHING
      RETURNING *`,
      [
        userId,
        movieId,
        mediaType,
        movieTitle,
        poster_path || poster || null,
        release_date || first_air_date || year?.toString() || null,
        vote_average ?? rating ?? 0,
        genre_ids || genreIds || [],
      ]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        message: "Already in favorites",
      });
    }

    res.status(201).json({
      message: "Added to favorites",
      favorite: result.rows[0],
    });
  } catch (error) {
    console.error("Add Favorite Error:", error.message);
    res.status(500).json({ message: "Failed to add favorite" });
  }
};

// Remove favorite
export const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tmdb_id } = req.params;
    const { media_type = "movie" } = req.query;

    const result = await pool.query(
      `DELETE FROM favorites
       WHERE user_id = $1
       AND tmdb_id = $2
       AND media_type = $3
       RETURNING id`,
      [userId, tmdb_id, media_type]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Favorite not found",
      });
    }

    res.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Remove Favorite Error:", error.message);
    res.status(500).json({ message: "Failed to remove favorite" });
  }
};
