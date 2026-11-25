
import { useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import MovieCard from "./MovieCard";

function MovieSection({
  title,
  subtitle,
  movies,
  icon: Icon,
  favorites,
  onToggleFavorite,
  isAuthenticated,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  loadMoreError = "",
}) {
  const scrollRef = useRef(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!isLoadingMore) {
      loadingRef.current = false;
    }
  }, [isLoadingMore]);

  const scroll = (direction) => {
    const slider = scrollRef.current;

    if (!slider) return;

    slider.scrollBy({
      left: direction * slider.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    const slider = scrollRef.current;

    if (!slider || !onLoadMore || !hasMore || isLoadingMore) {
      return;
    }

    const nearEnd =
      slider.scrollLeft + slider.clientWidth >=
      slider.scrollWidth - 350;

    if (nearEnd && !loadingRef.current) {
      loadingRef.current = true;
      onLoadMore();
    }
  };

  return (
    <section className="mb-6 sm:mb-8 lg:mb-9 min-w-0">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {Icon && (
              <Icon
                size={16}
                className="text-violet-400 shrink-0 sm:w-[18px] sm:h-[18px]"
              />
            )}

            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">
              {title}
            </h2>
          </div>

          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Slider Buttons */}
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => scroll(-1)}
            className="p-1.5 sm:p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-violet-600 text-gray-900 dark:text-white transition"
            aria-label="Scroll left"
          >
            <ChevronLeft size={17} className="sm:w-[18px] sm:h-[18px]" />
          </button>

          <button
            onClick={() => scroll(1)}
            className="p-1.5 sm:p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-violet-600 text-gray-900 dark:text-white transition"
            aria-label="Scroll right"
          >
            <ChevronRight size={17} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>

      {/* Movie Slider */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2 min-w-0"
      >
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            isFavorite={favorites.has(movie.id)}
            onToggleFavorite={onToggleFavorite}
            isAuthenticated={isAuthenticated}
          />
        ))}

        {/* Loading indicator */}
        {isLoadingMore && (
          <div className="flex items-center justify-center min-w-[80px] shrink-0">
            <Loader2 className="animate-spin text-violet-400" size={24} />
          </div>
        )}
      </div>

      {/* Pagination Error */}
      {loadMoreError && (
        <p className="text-red-400 text-xs sm:text-sm mt-2">
          {loadMoreError}
        </p>
      )}
    </section>
  );
}

export default MovieSection;
