import { MessageCircle } from "lucide-react";
import Navbar from "../Components/Navbar";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Star,
  Trash2,
  Clapperboard,
  ArrowLeft,
  Film,
} from "lucide-react";

import {
  getFavorites,
  removeFavorite,
} from "../services/favoritesService.js";

const genreMap = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  18: "Drama",
  14: "Fantasy",
  27: "Horror",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  53: "Thriller",
};

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch favorites from database
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await getFavorites();
        setFavorites(data);
      } catch (error) {
        console.error("Favorites Error:", error);
        setError("Failed to load favorites.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // Remove favorite from database
  const handleRemoveFavorite = async (movie) => {
    try {
      await removeFavorite(movie.tmdb_id, movie.media_type);

      setFavorites((previous) =>
        previous.filter(
          (item) =>
            !(
              item.tmdb_id === movie.tmdb_id &&
              item.media_type === movie.media_type
            )
        )
      );
    } catch (error) {
      console.error("Remove Favorite Error:", error);
      alert("Failed to remove favorite. Please try again.");
    }
  };

  const getPoster = (posterPath) => {
    if (!posterPath) return null;

    if (posterPath.startsWith("http")) {
      return posterPath;
    }

    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  };

  const getYear = (date) => {
    if (!date) return "N/A";

    return date.substring(0, 4);
  };

  const getGenres = (genreIds) => {
    if (!genreIds || genreIds.length === 0) {
      return "Unknown Genre";
    }

    return (
      genreIds
        .map((id) => genreMap[id])
        .filter(Boolean)
        .join(" / ") || "Unknown Genre"
    );
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">

      {/* Header */}
      <header>
        {/* Navbar */}
        <div className="w-full px- sm:px-6 md:px-8 dark:bg-gray-900">
          <Navbar className="w-full p-5" />
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 md:px-10 lg:px-16 py-4 sm:py-6">

        {/* Navigation */}
        <div className="flex items-center justify-start gap-2 mb-6 sm:mb-8 md:mb-9 w-full">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-white/80 dark:bg-gray-900/80 hover:bg-violet-600 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:text-white text-xs sm:text-sm font-medium transition"
            >
              <MessageCircle size={15} className="shrink-0" />
              Chat
            </Link>

            <Link
              to="/discover"
              className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-white/80 dark:bg-gray-900/80 hover:bg-violet-600 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:text-white text-xs sm:text-sm font-medium transition"
            >
              <Film size={19} className="shrink-0" />
              Discover Movies
            </Link>
          </div>

        {/* Page Heading */}
        <div className="mb-7 sm:mb-9">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-2 sm:p-2.5 rounded-xl bg-red-100 dark:bg-red-500/10">
              <Heart
                size={20}
                className="text-red-500 sm:w-6 sm:h-6"
              />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold">
              My Favorites
            </h2>
          </div>

          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Your personal collection of movies and shows.
          </p>

          <p className="text-sm text-violet-600 font-medium mt-3">
            {favorites.length}{" "}
            {favorites.length === 1 ? "Title" : "Titles"} Saved
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-center py-16 sm:py-20 text-gray-500">
            Loading your favorites...
          </p>
        )}

        {/* Error */}
        {!loading && error && (
          <p className="text-center py-16 sm:py-20 text-red-500">
            {error}
          </p>
        )}

        {/* Favorites Grid */}
        {!loading && !error && favorites.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">

            {favorites.map((movie) => {
              const poster = getPoster(movie.poster_path);

              const tmdbUrl = `https://www.themoviedb.org/${movie.media_type}/${movie.tmdb_id}`;

              return (
                <div
                  key={`${movie.media_type}-${movie.tmdb_id}`}
                  className="group relative min-w-0"
                >
                  {/* Movie Poster */}
                  <div className="relative overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800 aspect-[2/3]">

                    {/* Clickable Poster */}
                    <a
                      href={tmdbUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`View ${movie.title} on TMDB`}
                      className="block w-full h-full"
                    >
                      {poster ? (
                        <img
                          src={poster}
                          alt={movie.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film
                            size={30}
                            className="text-gray-400 sm:w-10 sm:h-10"
                          />
                        </div>
                      )}
                    </a>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveFavorite(movie)}
                      title="Remove from favorites"
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full bg-black/60 text-white hover:bg-red-600 transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 size={15} className="sm:w-[17px] sm:h-[17px]" />
                    </button>

                    {/* Rating */}
                    <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex items-center gap-1 bg-black/70 text-white px-1.5 sm:px-2 py-1 rounded-lg text-[11px] sm:text-xs">
                      <Star
                        size={12}
                        className="text-yellow-400 fill-yellow-400"
                      />
                      {Number(movie.vote_average || 0).toFixed(1)}
                    </div>
                  </div>

                  {/* Clickable Movie Information */}
                  <a
                    href={tmdbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2 sm:mt-3 hover:text-violet-500 transition min-w-0"
                  >
                    <h3 className="font-semibold text-sm truncate">
                      {movie.title}
                    </h3>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {getYear(movie.release_date)} ·{" "}
                      {getGenres(movie.genre_ids)}
                    </p>
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && favorites.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-16 sm:py-24 px-4">

            <div className="bg-gray-200 dark:bg-gray-800 p-5 sm:p-6 rounded-full mb-5">
              <Film size={34} className="text-gray-400 sm:w-[42px] sm:h-[42px]" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold mb-2">
              No Favorites Yet
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
              You haven't saved any movies yet. Explore movies and add your favorites to build your collection.
            </p>

            <Link
              to="/discover"
              className="bg-violet-600 hover:bg-violet-700 text-white px-5 sm:px-6 py-3 rounded-xl font-medium transition"
            >
              Discover Movies
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}

export default Favorites;