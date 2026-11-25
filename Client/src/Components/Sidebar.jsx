import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  MessageSquare,
  Heart,
  Film,
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";

import { getChats, renameChat, deleteChat } from "../services/chatService";

function Sidebar({
  onNewChat,
  onSelectChat,
  activeChatId,
  refreshTrigger,
  isMobileOpen = false,
  onClose,
}) {
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [deletingChatId, setDeletingChatId] = useState(null);

  // Reference for the currently open chat menu
  const chatMenuRef = useRef(null);

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    if (openMenuId === null) return;

    const handleClickOutside = (event) => {
      if (
        chatMenuRef.current &&
        !chatMenuRef.current.contains(event.target)
      ) {
        setOpenMenuId(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openMenuId]);

  // Fetch chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const chats = await getChats();
        setChatHistory(chats);
      } catch (error) {
        console.error("Fetch Chat History Error:", error);
      } finally {
        setLoadingChats(false);
      }
    };

    fetchChatHistory();
  }, [refreshTrigger]);

  // Start renaming
  const handleRename = (chat) => {
    setRenamingChatId(chat.id);
    setNewTitle(chat.title);
    setOpenMenuId(null);
    setDeletingChatId(null);
  };

  // Save renamed title to database
  const handleSaveRename = async (chatId) => {
    if (!newTitle.trim()) return;

    try {
      const updatedChat = await renameChat(chatId, newTitle.trim());

      setChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? { ...chat, title: updatedChat.title }
            : chat
        )
      );

      setRenamingChatId(null);
      setNewTitle("");
    } catch (error) {
      console.error("Rename Chat Error:", error);
      alert(error.message || "Failed to rename chat");
    }
  };

  // Cancel rename
  const handleCancelRename = () => {
    setRenamingChatId(null);
    setNewTitle("");
  };

  // Delete chat from database
  const handleDelete = async (chatId) => {
    try {
      await deleteChat(chatId);

      setChatHistory((prev) =>
        prev.filter((chat) => chat.id !== chatId)
      );

      setDeletingChatId(null);
      setOpenMenuId(null);

      // If the deleted chat is currently open, return to a new chat
      if (String(activeChatId) === String(chatId)) {
        onNewChat();
      }
    } catch (error) {
      console.error("Delete Chat Error:", error);
      alert(error.message || "Failed to delete chat");
    }
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40
        w-64 h-dvh shrink-0 overflow-hidden
        bg-gray-100 dark:bg-gray-950
        text-gray-900 dark:text-white
        border-r border-gray-200 dark:border-gray-800
        p-4 flex flex-col
        transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:z-auto
        ${
          isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }
      `}
    >
      {/* New Chat */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNewChat}
          className="
            flex items-center justify-center gap-2
            flex-1 bg-violet-600 hover:bg-violet-700
            text-white rounded-lg p-3
            font-medium transition-colors
          "
        >
          <Plus size={19} />
          New Chat
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="
            p-2 rounded-lg
            hover:bg-gray-200 dark:hover:bg-gray-800
            md:hidden
          "
          title="Close sidebar"
        >
          <X size={21} />
        </button>
      </div>

      {/* Navigation */}
      <div className="mt-7 space-y-2">
        <Link
          to="/discover"
          onClick={onClose}
          className="
            flex items-center gap-3 p-3 rounded-lg
            hover:bg-gray-200 dark:hover:bg-gray-800
            transition-colors
          "
        >
          <Film size={19} />
          <span className="text-sm font-medium">
            Discover Movies
          </span>
        </Link>

        <Link
          to="/favorites"
          onClick={onClose}
          className="
            flex items-center gap-3 p-3 rounded-lg
            hover:bg-gray-200 dark:hover:bg-gray-800
            transition-colors
          "
        >
          <Heart size={19} />
          <span className="text-sm font-medium">
            My Favorites
          </span>
        </Link>
      </div>

      {/* Chat History */}
      <div className="mt-4 flex-1 min-h-0 flex flex-col">
        <h3
          className="
            text-xs font-semibold uppercase tracking-wider
            text-gray-500 dark:text-gray-400
            mb-4 px-2 shrink-0
          "
        >
          Recent Chats
        </h3>

        <div
          className="
            space-y-1 overflow-y-auto flex-1 min-h-0
            pr-2 hide-scrollbar
          "
        >
          {loadingChats ? (
            <p className="text-sm text-gray-500 px-2">
              Loading chats...
            </p>
          ) : chatHistory.length === 0 ? (
            <p className="text-sm text-gray-500 px-2">
              No chats yet
            </p>
          ) : (
            chatHistory.map((chat) => (
              <div
                key={chat.id}
                className="relative"
                ref={
                  openMenuId === chat.id
                    ? chatMenuRef
                    : null
                }
              >
                {/* Rename Input */}
                {renamingChatId === chat.id ? (
                  <div className="flex items-center gap-1 p-2 rounded-lg bg-white dark:bg-gray-800">
                    <input
                      autoFocus
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveRename(chat.id);
                        }

                        if (e.key === "Escape") {
                          handleCancelRename();
                        }
                      }}
                      className="
                        min-w-0 flex-1 text-sm
                        bg-transparent outline-none
                      "
                    />

                    <button
                      onClick={() => handleSaveRename(chat.id)}
                      className="p-1 text-green-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      title="Save"
                    >
                      <Check size={16} />
                    </button>

                    <button
                      onClick={handleCancelRename}
                      className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      title="Cancel"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : deletingChatId === chat.id ? (
                  /* Delete Confirmation */
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
                    <p className="text-xs mb-2 text-red-600 dark:text-red-400">
                      Delete this chat?
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(chat.id)}
                        className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>

                      <button
                        onClick={() => setDeletingChatId(null)}
                        className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Chat Item */
                 <div
                  className={`
                    flex items-center gap-3 w-full min-w-0 rounded-lg
                    transition-colors
                    ${
                      String(activeChatId) === String(chat.id)
                        ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                    }
                  `}
>
                    {/* Select Chat */}
                    <button
                      onClick={() => onSelectChat(chat.id)}
                      className="
                        flex items-center gap-3
                        min-w-0 flex-1 text-left p-3
                        text-sm
                      "
                    >
                      <MessageSquare size={17} className="shrink-0 mt-0.5" />

                      <span className="block truncate min-w-0">
                          {chat.title}
                        </span>
                    </button>

                    {/* Three-dot Menu */}
                    <button
                      onClick={() =>
                        setOpenMenuId((prev) =>
                          prev === chat.id ? null : chat.id
                        )
                      }
                      className="
                        shrink-0 p-2 mr-1 rounded-md
                        hover:bg-black/5 dark:hover:bg-white/10
                      "
                      title="Chat options"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {/* Dropdown */}
                    {openMenuId === chat.id && (
                      <div
                        className="
                          absolute right-1 top-10 z-20
                          w-36 rounded-lg shadow-lg
                          border border-gray-200 dark:border-gray-700
                          bg-white dark:bg-gray-900
                          py-1
                        "
                      >
                        <button
                          onClick={() => handleRename(chat)}
                          className="
                            flex items-center gap-2 w-full
                            px-3 py-2 text-sm
                            hover:bg-gray-100 dark:hover:bg-gray-800
                          "
                        >
                          <Pencil size={15} />
                          Rename
                        </button>

                        <button
                          onClick={() => {
                            setDeletingChatId(chat.id);
                            setOpenMenuId(null);
                          }}
                          className="
                            flex items-center gap-2 w-full
                            px-3 py-2 text-sm text-red-600
                            hover:bg-gray-100 dark:hover:bg-gray-800
                          "
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;