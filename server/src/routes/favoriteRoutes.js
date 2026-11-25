
import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "../controllers/favoriteController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getFavorites);
router.post("/", addFavorite);
router.delete("/:tmdb_id", removeFavorite);

export default router;
