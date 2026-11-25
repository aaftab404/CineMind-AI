
import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import { Send } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  createChat,
  getChatById,
  saveChatMessage,
} from "../services/chatService";

import { apiFetch } from "../services/api.js";

const welcomeMessage = {
  role: "assistant",
  text: "Hello! 👋 I'm CineMind. Tell me what kind of movies or TV shows you enjoy, and I'll find something you'll love.",
};

const NEW_CHAT_KEY = "__new__";

// Wait before retrying
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Automatically retry temporary failures
const getRecommendations = async (prompt) => {
  const delays = [1000];

  for (let attempt = 0; attempt < 2; attempt++) {
    let response;

    try {
      response = await apiFetch("/ai/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
    } catch (error) {
      if (attempt < 1) {
        await wait(delays[attempt]);
        continue;
      }

      throw new Error(
        "We're having trouble connecting. Please try again."
      );
    }

    const data = await response.json();

    if (response.status === 503 && attempt < 1) {
      await wait(delays[attempt]);
      continue;
    }

    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Something went wrong."
      );
    }

    return data;
  }

  throw new Error("Something went wrong. Please try again.");
};

// Create assistant message
const createAssistantMessage = (data) => {
  const hasMovies = data.movies?.length > 0;

  return {
    role: "assistant",
    text:
      data.responseText ||
      data.message ||
      (hasMovies
        ? "Here are some movies I found for you:"
        : "I couldn't find matching movies. Try another description!"),
    movies: data.movies || [],
  };
};

function ChatWindow({
  activeChatId,
  setActiveChatId,
  messages,
  setMessages,
  onChatUpdated,
}) {
  const [message, setMessage] = useState("");
  const [loadingChatIds, setLoadingChatIds] = useState([]);

  const { user } = useAuth();
  const navigate = useNavigate();

  const messagesEndRef = useRef(null);
  const isCreatingChatRef = useRef(false);
  const skipNextLoadRef = useRef(null);
  const activeChatIdRef = useRef(activeChatId);

  // Keep active chat ID updated
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // Loading state belongs to each chat
  const currentLoadingKey = activeChatId
    ? String(activeChatId)
    : NEW_CHAT_KEY;

  const isLoading = loadingChatIds.includes(currentLoadingKey);

  // Add loading state
  const startLoading = (chatId) => {
    const key = String(chatId);

    setLoadingChatIds((prev) =>
      prev.includes(key) ? prev : [...prev, key]
    );
  };

  // Remove loading state
  const stopLoading = (chatId) => {
    const key = String(chatId);

    setLoadingChatIds((prev) =>
      prev.filter((id) => id !== key)
    );
  };

  // Move loading state from temporary new chat to actual chat
  const moveLoading = (oldId, newId) => {
    const oldKey = String(oldId);
    const newKey = String(newId);

    setLoadingChatIds((prev) => {
      const withoutOld = prev.filter((id) => id !== oldKey);

      return withoutOld.includes(newKey)
        ? withoutOld
        : [...withoutOld, newKey];
    });
  };

  // Load selected chat
  useEffect(() => {
    let cancelled = false;

    const loadChat = async () => {
      // New chat
      if (!activeChatId) {
        if (isCreatingChatRef.current) return;

        setMessages([]);
        return;
      }

      // Skip reloading a chat we just created
      if (
        skipNextLoadRef.current !== null &&
        String(skipNextLoadRef.current) === String(activeChatId)
      ) {
        skipNextLoadRef.current = null;
        return;
      }

      if (!user) {
        setMessages([]);
        return;
      }

      try {
        const data = await getChatById(activeChatId);

        if (cancelled) return;

        const loadedMessages = (data.messages || []).map(
          (msg, index, allMessages) => {
            const isError =
              msg.content ===
              "Our AI is temporarily busy. Your message is safe — let's try again! 🎬";

            const previousUserMessage = allMessages
              .slice(0, index)
              .reverse()
              .find((previous) => previous.role === "user");

            return {
              role: msg.role,
              text: msg.content,
              movies: msg.movies || [],
              isError,
              retryPrompt: isError
                ? previousUserMessage?.content
                : undefined,
            };
          }
        );

        setMessages(loadedMessages);
      } catch (error) {
        if (!cancelled) {
          console.error("Load Chat Error:", error);
        }
      }
    };

    loadChat();

    return () => {
      cancelled = true;
    };
  }, [activeChatId, setMessages, user]);

  // Get AI response
  const handleAIResponse = async (prompt, chatId) => {
    try {
      const data = await getRecommendations(prompt);

      const assistantMessage = createAssistantMessage(data);

      // Display response immediately in the correct chat
      if (
        String(activeChatIdRef.current) === String(chatId)
      ) {
        setMessages((prev) => [...prev, assistantMessage]);
      }

      // Save response in background
      saveChatMessage(chatId, {
        role: "assistant",
        content: assistantMessage.text,
        movies: assistantMessage.movies,
      })
        .then(() => {
          onChatUpdated?.();
        })
        .catch((error) => {
          console.error("Failed to save assistant message:", error);
        });
    } catch (error) {
      console.error("Recommendation Error:", error);

      const errorMessage = {
        role: "assistant",
        text: "Our AI is temporarily busy. Your message is safe — let's try again! 🎬",
        movies: [],
        isError: true,
        retryPrompt: prompt,
      };

      if (
        String(activeChatIdRef.current) === String(chatId)
      ) {
        setMessages((prev) => [...prev, errorMessage]);
      }

      // Save error in background
      saveChatMessage(chatId, {
        role: "assistant",
        content: errorMessage.text,
        movies: [],
      }).catch((saveError) => {
        console.error("Failed to save error message:", saveError);
      });
    }
  };

  // Manual Retry
  const handleRetry = async (failedIndex, originalPrompt) => {
    if (isLoading || !activeChatId) return;

    const chatId = activeChatId;

    setMessages((prev) =>
      prev.filter((_, index) => index !== failedIndex)
    );

    startLoading(chatId);

    try {
      await handleAIResponse(originalPrompt, chatId);
    } finally {
      stopLoading(chatId);
    }
  };

  // Send Message
  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    // Guest restriction
    if (!user) {
      navigate("/login");
      return;
    }

    const userPrompt = message.trim();

    const newMessage = {
      role: "user",
      text: userPrompt,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");

    let chatId = activeChatId;
    let isNewChat = false;

    // Start loading immediately
    const initialLoadingKey = chatId
      ? String(chatId)
      : NEW_CHAT_KEY;

    startLoading(initialLoadingKey);

    try {
      // Create new chat
      if (!chatId) {
        isCreatingChatRef.current = true;

        const newChat = await createChat();

        chatId = newChat.id;
        isNewChat = true;

        // Move loading to the actual chat ID
        moveLoading(NEW_CHAT_KEY, chatId);

        // Activate new chat immediately
        skipNextLoadRef.current = chatId;
        activeChatIdRef.current = chatId;
        setActiveChatId(chatId);

        onChatUpdated?.();
      }

      // Save user message
      await saveChatMessage(chatId, {
        role: "user",
        content: userPrompt,
        movies: [],
      });

      onChatUpdated?.();

      // Get AI response
      await handleAIResponse(userPrompt, chatId);
    } catch (error) {
      console.error("Chat Error:", error);

      const errorMessage = {
        role: "assistant",
        text: "Something went wrong. Please try again. 🎬",
        movies: [],
        isError: true,
        retryPrompt: userPrompt,
      };

      if (
        String(activeChatIdRef.current) === String(chatId)
      ) {
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      isCreatingChatRef.current = false;

      // Remove loading only for this chat
      stopLoading(chatId || initialLoadingKey);

      // Refresh sidebar
      onChatUpdated?.();
    }
  };

  // Enter Key to Send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Chat Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 md:px-10 py-4 sm:py-6 md:py-8">
        <div className="max-w-3xl mx-auto">
          {/* Permanent Welcome Message */}
          <MessageBubble message={welcomeMessage} />

          {/* Conversation Messages */}
          {messages
            .filter((msg) => msg.text !== welcomeMessage.text)
            .map((msg, index) => (
              <MessageBubble
                key={index}
                message={msg}
                onRetry={() =>
                  handleRetry(index, msg.retryPrompt)
                }
              />
            ))}

          {/* Loading Indicator */}
              {isLoading && (
            <div className="flex items-center gap-3 mb-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
              CineMind is finding movies for you...
            </div>
          )}

          <div ref={messagesEndRef}></div>
        </div>
      </div>

      {/* Input Section */}
      <div className="shrink-0 px-3 sm:px-4 md:px-10 pb-2 pt-2 sm:pt-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl px-3 sm:px-5 py-2 shadow-sm focus-within:border-violet-500 transition-colors">
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(
                  e.target.scrollHeight,
                  112
                )}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                window.innerWidth < 640
                  ? "Describe the movie or show"
                  : "Describe the movie or show you're looking for..."
              }
              rows={1}
              className="flex-1 min-w-0 w-full resize-none overflow-y-auto overflow-x-hidden outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 text-sm max-h-28 py-2"
            />

            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className="p-2.5 sm:p-3 shrink-0 rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Send message"
            >
              <Send size={19} />
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-1">
            CineMind can make mistakes. Discover movies and shows you might love.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
