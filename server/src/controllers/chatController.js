import pool from "../config/db.js";
import { generateChatTitle } from "../services/chatTitleService.js";

// Create a new chat
export const createChat = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `INSERT INTO chats (user_id, title)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, "New Chat"]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create Chat Error:", error);
    res.status(500).json({ message: "Failed to create chat" });
  }
};

// Get all chats
export const getChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT *
       FROM chats
       WHERE user_id = $1
       ORDER BY updated_at DESC`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get Chats Error:", error);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};

// Get a specific chat with messages
export const getChatById = async (req, res) => {
  try {
    const userId = req.user.id;
    const chatId = req.params.id;

    const chatResult = await pool.query(
      `SELECT *
       FROM chats
       WHERE id = $1 AND user_id = $2`,
      [chatId, userId]
    );

    if (chatResult.rows.length === 0) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const messagesResult = await pool.query(
      `SELECT *
       FROM chat_messages
       WHERE chat_id = $1
       ORDER BY created_at ASC`,
      [chatId]
    );

    res.status(200).json({
      chat: chatResult.rows[0],
      messages: messagesResult.rows,
    });
  } catch (error) {
    console.error("Get Chat Error:", error);
    res.status(500).json({ message: "Failed to fetch chat" });
  }
};

// Save a chat message
export const saveChatMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const chatId = req.params.id;

    const { role, content, movies = [] } = req.body;

    if (!role || !content || !content.trim()) {
      return res.status(400).json({
        message: "Role and content are required",
      });
    }

    if (!["user", "assistant"].includes(role)) {
      return res.status(400).json({
        message: "Invalid message role",
      });
    }

    // Check chat ownership
    const chatResult = await pool.query(
      `SELECT id, title
       FROM chats
       WHERE id = $1 AND user_id = $2`,
      [chatId, userId]
    );

    if (chatResult.rows.length === 0) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    // Save message
    const messageResult = await pool.query(
      `INSERT INTO chat_messages (chat_id, role, content, movies)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [chatId, role, content, JSON.stringify(movies)]
    );

    const isFirstUserMessage =
      role === "user" && chatResult.rows[0].title === "New Chat";

    if (isFirstUserMessage) {
      try {
        // Generate a meaningful title using Gemini
        const generatedTitle = await generateChatTitle(content);

        if (generatedTitle && generatedTitle !== "New Chat") {
          await pool.query(
            `UPDATE chats
             SET title = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 AND user_id = $3 AND title = 'New Chat'`,
            [generatedTitle, chatId, userId]
          );
        } else {
          throw new Error("Gemini returned an empty title");
        }
      } catch (titleError) {
        // Message is already saved; title generation failure
        // should not cause the message request to fail.
        console.error("Chat Title Generation Error:", titleError);

        await pool.query(
          `UPDATE chats
           SET updated_at = CURRENT_TIMESTAMP
           WHERE id = $1 AND user_id = $2`,
          [chatId, userId]
        );
      }
    } else {
      // Update activity timestamp
      await pool.query(
        `UPDATE chats
         SET updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND user_id = $2`,
        [chatId, userId]
      );
    }

    return res.status(201).json(messageResult.rows[0]);
  } catch (error) {
    console.error("Save Chat Message Error:", error);

    return res.status(500).json({
      message: "Failed to save message",
    });
  }
};


// Rename a chat
export const renameChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const chatId = req.params.id;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Chat title is required",
      });
    }

    const result = await pool.query(
      `UPDATE chats
       SET title = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [title.trim(), chatId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Rename Chat Error:", error);
    res.status(500).json({
      message: "Failed to rename chat",
    });
  }
};

// Delete a chat
export const deleteChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const chatId = req.params.id;

    const result = await pool.query(
      `DELETE FROM chats
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [chatId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    res.status(200).json({
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.error("Delete Chat Error:", error);
    res.status(500).json({
      message: "Failed to delete chat",
    });
  }
};