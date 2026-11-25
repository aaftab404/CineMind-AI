import { Search } from "lucide-react";

function DiscoverSearch({ search, setSearch }) {
  return (
    <div className="relative w-full lg:max-w-sm min-w-0">
      <Search
        size={17}
        className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search movies and shows..."
        className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:border-violet-500 outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 transition-colors"
      />
    </div>
  );
}

export default DiscoverSearch;