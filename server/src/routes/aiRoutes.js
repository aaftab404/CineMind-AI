
import express from "express";

import {
  testGemini,
  analyzeMoviePrompt,
  recommendMovies,
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/test", testGemini);
router.post("/analyze", analyzeMoviePrompt);
router.post("/recommend", analyzeMoviePrompt);

export default router;
