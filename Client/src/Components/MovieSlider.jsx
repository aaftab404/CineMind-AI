import { useRef, useState, useEffect } from "react";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";

import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "../services/favoritesService";

function MovieSlider({ movies }) {
  const sliderRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [favorites, setFavorites] = useState(new Set());
  const [pendingFavorites, setPendingFavorites] = useState(new Set());

  // Load saved favorites from the backend
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const savedFavorites = await getFavorites();

        const favoriteIds = new Set(
          savedFavorites.map(
            (favorite) =>
              `${favorite.media_type}:${favorite.tmdb_id}`
          )
        );

        setFavorites(favoriteIds);
      } catch (error) {
        console.error("Failed to load favorites:", error);
      }
    };

    loadFavorites();
  }, []);

  // Add or remove a favorite
  const toggleFavorite = async (movie) => {
    const mediaType = movie.media_type || "movie";
    const favoriteKey = `${mediaType}:${movie.id}`;

    // Prevent multiple clicks while request is processing
    if (pendingFavorites.has(favoriteKey)) return;

    const wasFavorite = favorites.has(favoriteKey);

    // Optimistic UI update
    setFavorites((previous) => {
      const updated = new Set(previous);

      if (wasFavorite) {
        updated.delete(favoriteKey);
      } else {
        updated.add(favoriteKey);
      }

      return updated;
    });

    setPendingFavorites((previous) => {
      const updated = new Set(previous);
      updated.add(favoriteKey);
      return updated;
    });

    try {
      if (wasFavorite) {
        await removeFavorite(movie.id, mediaType);
      } else {
        const title = movie.title || movie.name;

        await addFavorite({
          id: movie.id,
          tmdb_id: movie.id,
          media_type: mediaType,
          title: title,
          name: title,
          poster_path: movie.poster_path || null,
          release_date:
            movie.release_date || movie.first_air_date || null,
          vote_average: movie.vote_average ?? 0,
          genre_ids: movie.genre_ids || movie.genreIds || [],
        });
      }
    } catch (error) {
      console.error("Favorite update failed:", error);

      // Revert UI if backend request fails
      setFavorites((previous) => {
        const updated = new Set(previous);

        if (wasFavorite) {
          updated.add(favoriteKey);
        } else {
          updated.delete(favoriteKey);
        }

        return updated;
      });

      alert("Failed to update favorites. Please try again.");
    } finally {
      setPendingFavorites((previous) => {
        const updated = new Set(previous);
        updated.delete(favoriteKey);
        return updated;
      });
    }
  };

  // Slider scrolling
  const scroll = (direction) => {
    if (!sliderRef.current) return;

    const card = sliderRef.current.querySelector("[data-slide]");
    const step = card ? card.offsetWidth + 16 : 200;

    sliderRef.current.scrollBy({
      left: direction * step,
      behavior: "smooth",
    });
  };

  // Update active slide
  const handleScroll = () => {
    const slider = sliderRef.current;
    const card = slider?.querySelector("[data-slide]");

    if (!slider || !card || movies.length === 0) return;

    const step = card.offsetWidth + 16;

    setActiveIndex(
      Math.min(
        Math.round(slider.scrollLeft / step),
        movies.length - 1
      )
    );
  };

  return (
    <div className="relative min-w-0">
      {/* Slider Navigation */}
      <button
        onClick={() => scroll(-1)}
        disabled={activeIndex === 0}
        className="absolute left-0 top-1/3 -translate-y-1/2 z-20
        p-1.5 sm:p-2 rounded-full bg-violet-600 text-white shadow-lg
        hover:bg-violet-700 disabled:opacity-30 transition"
        aria-label="Previous movies"
      >
        <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
      </button>

      <button
        onClick={() => scroll(1)}
        disabled={activeIndex >= movies.length - 1}
        className="absolute right-0 top-1/3 -translate-y-1/2 z-20
        p-1.5 sm:p-2 rounded-full bg-violet-600 text-white shadow-lg
        hover:bg-violet-700 disabled:opacity-30 transition"
        aria-label="Next movies"
      >
        <ChevronRight size={18} className="sm:w-5 sm:h-5" />
      </button>

      {/* Movie Cards */}
      <div
        ref={sliderRef}
        onScroll={handleScroll}
        className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory
        scroll-smooth scrollbar-hide px-1 pb-3 min-w-0"
      >
        {movies.map((movie, index) => {
          const title = movie.title || movie.name;

          const mediaType = movie.media_type || "movie";
          const favoriteKey = `${mediaType}:${movie.id}`;

          const date =
            movie.release_date || movie.first_air_date;

          const year = date ? date.substring(0, 4) : "N/A";

          const poster = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : null;

          const isFavorite = favorites.has(favoriteKey);
          const isPending = pendingFavorites.has(favoriteKey);

          return (
            <div
              key={favoriteKey}
              data-slide
              className={`flex-none w-[135px] sm:w-[165px] md:w-[185px] snap-start
              transition-all duration-300 ${
                index === activeIndex
                  ? "opacity-100"
                  : "opacity-75"
              }`}
            >
              {/* Poster */}
              <div
                className="relative overflow-hidden rounded-xl
                bg-gray-200 dark:bg-gray-700 shadow-md
                hover:scale-[1.03] transition-transform duration-300"
              >
                <a
                  href={`https://www.themoviedb.org/${mediaType}/${movie.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {poster ? (
                    <img
                      src={poster}
                      alt={title}
                      loading="lazy"
                      className="w-full aspect-[2/3] object-cover"
                    />
                  ) : (
                    <div
                      className="w-full aspect-[2/3] flex items-center
                      justify-center text-sm text-gray-500"
                    >
                      No Poster
                    </div>
                  )}
                </a>

                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(movie)}
                  disabled={isPending}
                  aria-label={
                    isFavorite
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                  title={
                    isFavorite
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                  className="absolute top-2 right-2 z-10
                  p-1.5 sm:p-2 rounded-full bg-black/70 backdrop-blur-sm
                  hover:bg-black/90 transition disabled:opacity-50"
                >
                  <Heart
                    size={16}
                    className={
                      isFavorite
                        ? "fill-red-500 text-red-500"
                        : "text-white hover:text-red-400"
                    }
                  />
                </button>
              </div>

              {/* Movie Information */}
              <div className="pt-3 px-1">
                <h4
                  className="font-semibold text-sm text-gray-900
                  dark:text-white line-clamp-2 min-h-10"
                >
                  {title}
                </h4>

                <div
                  className="flex items-center gap-2 mt-1
                  text-xs text-gray-500 dark:text-gray-400"
                >
                  <span>{year}</span>

                  <span className="flex items-center gap-1">
                    <Star
                      size={12}
                      className="fill-yellow-500 text-yellow-500"
                    />
                    {movie.vote_average
                      ? movie.vote_average.toFixed(1)
                      : "N/A"}
                  </span>
                </div>

                <a
                  href={`https://www.themoviedb.org/${mediaType}/${movie.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs font-medium
                  text-violet-600 dark:text-violet-400 hover:underline"
                >
                  View Details →
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MovieSlider;