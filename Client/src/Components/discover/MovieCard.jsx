import { useState } from "react";
import { Film, Star, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

function MovieCard({ movie, isFavorite, onToggleFavorite, isAuthenticated }) {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const tmdbUrl = `https://www.themoviedb.org/search?query=${encodeURIComponent(
    movie.title
  )}`;

  const handleCardClick = () => {
    window.open(tmdbUrl, "_blank", "noopener,noreferrer");
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    onToggleFavorite(movie);
  };

  return (
    <div
      onClick={handleCardClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleCardClick();
      }}
       className="group flex-none w-[135px] sm:w-[160px] md:w-[175px] lg:w-[180px] xl:w-[200px] 2xl:w-[220px] cursor-pointer"
      >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl bg-gray-200 dark:bg-gray-800">
        {/* Poster */}
        {!imageError && movie.poster ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster}`}
            alt={movie.title}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-violet-200 via-gray-200 to-gray-100 dark:from-violet-900 dark:via-gray-800 dark:to-gray-950 flex items-center justify-center p-3 sm:p-4">
            <Film className="text-violet-500 dark:text-violet-300" size={28} />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition duration-300" />

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 lg:top-3 lg:right-3 z-10 p-1.5 sm:p-2 lg:p-2.5 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 transition"
        >
          <Heart
            size={15}
            className={`sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5 transition ${
              isFavorite
                ? "fill-red-500 text-red-500"
                : "text-white hover:text-red-400"
            }`}
          />
        </button>

        {/* Rating */}
        {movie.rating > 0 && (
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 lg:top-3 lg:left-3 bg-black/70 backdrop-blur-sm rounded-md px-1.5 sm:px-2 lg:px-2.5 py-1 flex items-center gap-1 text-[10px] sm:text-xs lg:text-sm text-white">
            <Star
              size={10}
              className="sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 fill-yellow-400 text-yellow-400"
            />
            {movie.rating}
          </div>
        )}
      </div>

      {/* Movie Information */}
      <div className="pt-1.5 sm:pt-2 lg:pt-2.5 min-w-0">
        <h3 className="text-[10px] sm:text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
          {movie.title}
        </h3>

        <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
          {movie.year} · {movie.genre}
        </p>
      </div>
    </div>
  );
}

export default MovieCard;