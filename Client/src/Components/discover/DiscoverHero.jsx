
import { Link } from "react-router-dom";
import { Play, TrendingUp, MessageCircle, Heart } from "lucide-react";
import Navbar from "../Navbar";

function DiscoverHero() {
  return (
    <section className="relative min-h-[340px] sm:min-h-[380px] md:min-h-[420px] lg:min-h-[440px] overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Background overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent dark:from-gray-950 dark:via-gray-950/80 dark:to-transparent z-10" />

      <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-gray-50/20 dark:from-gray-950 dark:via-transparent dark:to-gray-950/20 z-10" />

      <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-gray-100 to-gray-50 dark:from-violet-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300" />

      {/* Background Image */}
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-[75%] opacity-25 dark:opacity-50 transition-opacity duration-300">
        <img
          src="https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
          alt=""
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Navbar */}
        <div className="relative z-30 w-full mb-3 sm:mb-4">
          <Navbar className="w-full p-5" />
        </div>

      {/* Hero Content */}
      <div className="relative z-20 pb-6 sm:pb-8 w-full">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-16">

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
              to="/favorites"
              className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-white/80 dark:bg-gray-900/80 hover:bg-violet-600 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:text-white text-xs sm:text-sm font-medium transition"
            >
              <Heart size={15} className="shrink-0" />
              Favorites
            </Link>
          </div>

          {/* Discover Heading */}
          <div className="flex items-center gap-2 text-violet-500 dark:text-violet-400 mb-3 sm:mb-4">
            <TrendingUp size={15} />

            <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em]">
              DISCOVER
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight max-w-xl text-gray-900 dark:text-white">
            Explore the
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-purple-400 dark:from-violet-400 dark:to-purple-200">
              world of cinema.
            </span>
          </h1>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 mt-3 sm:mt-4 max-w-md text-sm sm:text-base leading-6">
            Discover trending movies, hidden gems, unforgettable stories, and your
            next favorite show.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-2 mt-4 sm:mt-5">
            <button
              onClick={() =>
                document
                  .getElementById("trending-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-sm font-semibold transition"
            >
              <Play size={15} fill="white" />
              Explore Trending
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DiscoverHero;
