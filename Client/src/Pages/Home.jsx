import { useState } from "react";
import { useNavigate, useParams, Outlet } from "react-router-dom";

import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import ChatWindow from "../Components/ChatWindow";

import { Menu, X } from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const { chatId } = useParams();

  const [messages, setMessages] = useState([]);
  const [chatRefresh, setChatRefresh] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeChatId = chatId || null;

  const handleChatUpdated = () => {
    setChatRefresh((prev) => prev + 1);
  };

  const handleNewChat = () => {
    setMessages([]);
    setIsSidebarOpen(false);
    navigate("/", { replace: true });
  };

  const handleSelectChat = (id) => {
    setMessages([]);
    setIsSidebarOpen(false);
    navigate(`/chat/${id}`);
  };

  return (
    <div className="flex fixed inset-0 h-dvh w-full overflow-hidden bg-gray-50 dark:bg-gray-900">

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        activeChatId={activeChatId}
        refreshTrigger={chatRefresh}
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 h-full">

          {/* Navbar */}
          <Navbar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            showSidebarToggle
          />

        {/* Chat */}
        <ChatWindow
          activeChatId={activeChatId}
          setActiveChatId={(id) => navigate(`/chat/${id}`)}
          messages={messages}
          setMessages={setMessages}
          onChatUpdated={handleChatUpdated}
        />

        {/* Outlet */}
        <Outlet />
      </div>
    </div>
  );
}

export default Home;