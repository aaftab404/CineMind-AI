import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  createChat,
  getChats,
  getChatById,
  saveChatMessage,
  renameChat,
  deleteChat,
} from "../controllers/chatController.js";

const router = express.Router();

// Protect all chat routes
router.use(authMiddleware);

// Create a new chat
router.post("/", createChat);

// Get all chats
router.get("/", getChats);

// Get a specific chat with messages
router.get("/:id", getChatById);

// Save a message in a chat
router.post("/:id/messages", saveChatMessage);

// Rename a chat
router.put("/:id", renameChat);

// Delete a chat
router.delete("/:id", deleteChat);

export default router;