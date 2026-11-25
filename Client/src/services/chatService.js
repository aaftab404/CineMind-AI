
import { apiFetch } from "./api.js";

const API_URL = "/chats";

// Create a new chat
export const createChat = async () => {
  const response = await apiFetch(API_URL, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to create chat");
  }

  return response.json();
};

// Get all chats
export const getChats = async () => {
  const response = await apiFetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch chats");
  }

  return response.json();
};

// Get a specific chat with messages
export const getChatById = async (chatId) => {
  const response = await apiFetch(`${API_URL}/${chatId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch chat");
  }

  return response.json();
};

// Save a message
export const saveChatMessage = async (chatId, message) => {
  const response = await apiFetch(`${API_URL}/${chatId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Save Message API Error:", errorData);

    throw new Error(errorData.message || "Failed to save message");
  }

  return response.json();
};

// Rename a chat
export const renameChat = async (chatId, title) => {
  const response = await apiFetch(`${API_URL}/${chatId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to rename chat");
  }

  return response.json();
};

// Delete a chat
export const deleteChat = async (chatId) => {
  const response = await apiFetch(`${API_URL}/${chatId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete chat");
  }

  return response.json();
};
