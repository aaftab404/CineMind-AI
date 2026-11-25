
import { User, Copy, Sparkles, RotateCcw } from "lucide-react";
import MovieSlider from "./MovieSlider";
import { useAuth } from "../Context/AuthContext";
import cinemindAvatar from "../assets/cinemind-avatar.png";

function MessageBubble({ message, onRetry }) {
  const { user } = useAuth();

  const isUser = message.role === "user";
  const hasMovies = message.movies?.length > 0;

  const handleCopy = async () => {
    if (!message.text) return;

    try {
      await navigator.clipboard.writeText(message.text);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  return (
    <div
      className={`flex items-start gap-2 sm:gap-3 mb-4 sm:mb-6 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* AI Avatar */}
      {!isUser && (
        <img
          src={cinemindAvatar}
          alt="CineMind AI"
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover shrink-0 shadow-lg"
        />
      )}

      {/* Message Content */}
      <div
        className={
          isUser
            ? "max-w-[85%] sm:max-w-[80%] min-w-0"
            : "flex-1 min-w-0"
        }
      >
        {/* User Message */}
        {isUser ? (
          <div
            className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl rounded-br-sm
            bg-violet-600 text-white shadow-md"
          >
            {message.text && (
              <p className="text-sm leading-6 whitespace-pre-wrap break-words">
                {message.text}
              </p>
            )}
          </div>
        ) : (
          /* AI Recommendation Container */
          <div
            className="overflow-hidden rounded-2xl border
            border-violet-500/20 bg-white dark:bg-gradient-to-br
            dark:from-gray-800 dark:via-[#211a35] dark:to-gray-900
            shadow-lg shadow-violet-950/5"
          >
            {/* AI Introduction */}
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-xl bg-violet-100
                  dark:bg-violet-500/20 flex items-center justify-center"
                >
                  <Sparkles
                    size={19}
                    className="text-violet-600 dark:text-violet-400"
                  />
                </div>

                <div>
                  <p
                    className="text-xs font-bold tracking-widest
                    text-violet-600 dark:text-violet-400"
                  >
                    CINEMIND AI
                  </p>

                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {message.isError
                      ? "TEMPORARY INTERRUPTION"
                      : hasMovies
                      ? "PERSONALIZED RECOMMENDATIONS"
                      : "YOUR MOVIE ASSISTANT"}
                  </p>
                </div>
              </div>

              <h3
                className="text-lg font-bold text-gray-900
                dark:text-white mb-2"
              >
                {message.isError
                  ? "Let's try again! 🎬"
                  : hasMovies
                  ? "I found something for you!"
                  : "Hey there! 👋"}
              </h3>

              <p
                className="text-sm leading-6 text-gray-600
                dark:text-gray-300 whitespace-pre-wrap break-words"
              >
                {message.text}
              </p>

              {/* Retry Button */}
              {message.isError && message.retryPrompt && (
                <button
                  onClick={() => onRetry?.()}
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2.5
                  rounded-xl bg-violet-600 text-white text-sm font-medium
                  hover:bg-violet-700 transition-colors"
                >
                  <RotateCcw size={16} />
                  Try Again
                </button>
              )}

              <div className="flex items-center justify-between mt-4">
                <div
                  className="flex items-center gap-2 text-xs
                  text-gray-500 dark:text-gray-400"
                >
                  <Sparkles size={13} className="text-violet-500" />
                  Made for your movie taste
                </div>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs
                  text-gray-500 hover:text-violet-600
                  dark:text-gray-400 dark:hover:text-violet-400 transition"
                  title="Copy message"
                >
                  <Copy size={14} />
                  Copy
                </button>
              </div>
            </div>

            {/* Movie Recommendations */}
            {hasMovies && (
              <div
                className="border-t border-violet-200/70
                dark:border-violet-500/20"
              >
                <div className="px-4 sm:px-6 pt-5 pb-2">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Movies picked for you
                  </h3>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Explore your personalized movie collection
                  </p>
                </div>

                <div className="px-3 sm:px-6 pb-4 sm:pb-5 pt-3">
                  <MovieSlider movies={message.movies} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden shrink-0">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full bg-gray-300
              dark:bg-gray-700 flex items-center justify-center"
            >
              <User size={19} className="text-gray-700 dark:text-white" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MessageBubble;
