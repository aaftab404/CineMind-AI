
import express from "express";

import {
    registerUser,
    loginUser,
    updateProfile,
    refreshToken,
    logoutUser,
    forgotPassword,
    resetPassword
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);


// Forgot Password Routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected routes
router.get("/profile", authMiddleware, (req, res) => {
    res.status(200).json({
        message: "You are authenticated!",
        user: req.user
    });
});

router.put("/profile", authMiddleware, updateProfile);

export default router;
