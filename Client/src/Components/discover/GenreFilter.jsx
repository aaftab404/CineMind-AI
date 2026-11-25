function GenreFilter({ genres, activeGenre, setActiveGenre }) {
  return (
    <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide min-w-0 pb-1">
      {genres.map((genre) => (
        <button
          key={genre}
          onClick={() => setActiveGenre(genre)}
          className={`whitespace-nowrap shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition ${
            activeGenre === genre
              ? "bg-violet-600 text-white"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-900 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          }`}
        >
          {genre}
        </button>
      ))}
    </div>
  );
}

export default GenreFilter;