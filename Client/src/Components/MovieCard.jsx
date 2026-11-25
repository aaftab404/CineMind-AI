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
      className="group flex-none w-[135px] sm:w-[160px] md:w-[180px] lg:w-[200px] xl:w-[220px] 2xl:w-[240px] cursor-pointer"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl bg-gray-800 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:shadow-violet-950/30">
        {!imageError && movie.poster ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster}`}
            alt={movie.title}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-violet-900 via-gray-800 to-gray-950 flex items-center justify-center p-3 sm:p-4">
            <Film
              className="text-violet-300"
              size={28}
            />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition duration-300" />

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 p-1.5 sm:p-2 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 transition"
        >
          <Heart
            size={15}
            className={`sm:w-[18px] sm:h-[18px] transition ${
              isFavorite
                ? "fill-red-500 text-red-500"
                : "text-white hover:text-red-400"
            }`}
          />
        </button>

        {/* Rating */}
        {movie.rating > 0 && (
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-black/75 backdrop-blur-sm rounded-md px-1.5 sm:px-2 py-1 flex items-center gap-1 text-[10px] sm:text-xs text-white">
            <Star
              size={10}
              className="sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400"
            />
            {movie.rating}
          </div>
        )}
      </div>

      {/* Movie Information */}
      <div className="pt-2 sm:pt-2.5 min-w-0">
        <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-white truncate group-hover:text-violet-400 transition">
          {movie.title}
        </h3>

        <p className="text-[10px] sm:text-xs lg:text-sm text-gray-400 mt-1 truncate">
          {movie.year} · {movie.genre}
        </p>
      </div>
    </div>
  );
}

export default MovieCard;