
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

import {
  TrendingUp,
  Film,
  Star,
  CalendarDays,
  Tv,
} from "lucide-react";

import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "../services/favoritesService.js";

import DiscoverHero from "../Components/discover/DiscoverHero";
import DiscoverSearch from "../Components/discover/DiscoverSearch";
import GenreFilter from "../Components/discover/GenreFilter";
import MovieSection from "../Components/discover/MovieSection";

import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getPopularTV,
  searchMoviesAndTV,
  getMovieGenres,
  getTVGenres,
  getGenreMovies,
} from "../services/discoverService";

const genres = [
  "All",
  "Action",
  "Adventure",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
];

const sections = ["trending", "popular", "topRated", "upcoming", "tv"];

const emptyPagination = () => ({
  page: 1,
  hasMore: true,
  loading: false,
  error: "",
});

const normalizeMovie = (movie, genreMap = {}) => {
  const date = movie.release_date || movie.first_air_date;

  return {
    id: movie.id,
    title: movie.title || movie.name,
    year: date ? new Date(date).getFullYear() : null,
    rating: movie.vote_average || 0,
    poster: movie.poster_path || "",
    genre:
      movie.genre_ids?.map((id) => genreMap[id]).filter(Boolean)[0] ||
      "Unknown",
    genreIds: movie.genre_ids || [],
    mediaType: movie.media_type || (movie.name ? "tv" : "movie"),
  };
};

function Discover() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAuthenticated = !!user;

  const [activeGenre, setActiveGenre] = useState("All");
  const [search, setSearch] = useState("");

  const [favorites, setFavorites] = useState(new Set());

  const [movies, setMovies] = useState({
    trending: [],
    popular: [],
    topRated: [],
    upcoming: [],
    tv: [],
  });

  const [pagination, setPagination] = useState({
    trending: emptyPagination(),
    popular: emptyPagination(),
    topRated: emptyPagination(),
    upcoming: emptyPagination(),
    tv: emptyPagination(),
  });

  const [genreMap, setGenreMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");

  // Store genre IDs separately for movies and TV shows
  const movieGenreIdsRef = useRef({});
  const tvGenreIdsRef = useRef({});

  // Prevent old requests from updating newly selected genres
  const requestSequence = useRef(0);
  const skipFirstGenreEffect = useRef(true);

  // Load favorites only for logged-in users
  useEffect(() => {
    const loadFavorites = async () => {
      if (!isAuthenticated) {
        setFavorites(new Set());
        return;
      }

      try {
        const data = await getFavorites();

        setFavorites(
          new Set(data.map((movie) => movie.tmdb_id))
        );
      } catch (error) {
        console.error("Load Favorites Error:", error);
      }
    };

    loadFavorites();
  }, [isAuthenticated]);

  // Fetch initial Discover data and genre lists
  useEffect(() => {
    const fetchDiscoverData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          trendingData,
          popularData,
          topRatedData,
          upcomingData,
          tvData,
          movieGenresData,
          tvGenresData,
        ] = await Promise.all([
          getTrendingMovies(1),
          getPopularMovies(1),
          getTopRatedMovies(1),
          getUpcomingMovies(1),
          getPopularTV(1),
          getMovieGenres(),
          getTVGenres(),
        ]);

        const movieGenres = movieGenresData.genres || [];
        const tvGenres = tvGenresData.genres || [];

        const combinedGenres = [...movieGenres, ...tvGenres];
        const newGenreMap = {};

        combinedGenres.forEach((genre) => {
          newGenreMap[genre.id] = genre.name;
        });

        movieGenreIdsRef.current = Object.fromEntries(
          movieGenres.map((genre) => [genre.name, genre.id])
        );

        tvGenreIdsRef.current = Object.fromEntries(
          tvGenres.map((genre) => [genre.name, genre.id])
        );

        setGenreMap(newGenreMap);

        const normalizeList = (data) =>
          (data.results || []).map((movie) =>
            normalizeMovie(movie, newGenreMap)
          );

        setMovies({
          trending: normalizeList(trendingData),
          popular: normalizeList(popularData),
          topRated: normalizeList(topRatedData),
          upcoming: normalizeList(upcomingData),
          tv: normalizeList(tvData),
        });

        const createPageState = (data) => ({
          page: data.page || 1,
          hasMore: (data.page || 1) < (data.total_pages || 1),
          loading: false,
          error: "",
        });

        setPagination({
          trending: createPageState(trendingData),
          popular: createPageState(popularData),
          topRated: createPageState(topRatedData),
          upcoming: createPageState(upcomingData),
          tv: createPageState(tvData),
        });
      } catch (error) {
        console.error("Discover Error:", error);
        setError("Failed to load movies. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDiscoverData();
  }, []);

  // Fetch data for the selected genre
  useEffect(() => {
    if (skipFirstGenreEffect.current) {
      skipFirstGenreEffect.current = false;
      return;
    }

    const fetchGenreData = async () => {
      const requestId = ++requestSequence.current;

      try {
        setLoading(true);
        setError("");

        const genreName =
          activeGenre === "Sci-Fi"
            ? "Science Fiction"
            : activeGenre;

        const movieGenreId =
          movieGenreIdsRef.current[genreName];

        const tvGenreId =
          tvGenreIdsRef.current[genreName];

        const getSectionData = (section) => {
          if (activeGenre === "All") {
            const normalFetchers = {
              trending: getTrendingMovies,
              popular: getPopularMovies,
              topRated: getTopRatedMovies,
              upcoming: getUpcomingMovies,
              tv: getPopularTV,
            };

            return normalFetchers[section](1);
          }

          const genreId =
            section === "tv" ? tvGenreId : movieGenreId;

          if (!genreId) {
            return Promise.resolve({
              page: 1,
              total_pages: 1,
              results: [],
            });
          }

          return getGenreMovies(section, genreId, 1);
        };

        const [
          trendingData,
          popularData,
          topRatedData,
          upcomingData,
          tvData,
        ] = await Promise.all(
          sections.map((section) => getSectionData(section))
        );

        if (requestId !== requestSequence.current) return;

        const normalizeList = (data) =>
          (data.results || []).map((movie) =>
            normalizeMovie(movie, genreMap)
          );

        setMovies({
          trending: normalizeList(trendingData),
          popular: normalizeList(popularData),
          topRated: normalizeList(topRatedData),
          upcoming: normalizeList(upcomingData),
          tv: normalizeList(tvData),
        });

        const createPageState = (data) => ({
          page: data.page || 1,
          hasMore: (data.page || 1) < (data.total_pages || 1),
          loading: false,
          error: "",
        });

        setPagination({
          trending: createPageState(trendingData),
          popular: createPageState(popularData),
          topRated: createPageState(topRatedData),
          upcoming: createPageState(upcomingData),
          tv: createPageState(tvData),
        });
      } catch (error) {
        if (requestId !== requestSequence.current) return;

        console.error("Genre Discover Error:", error);
        setError("Failed to load genre movies. Please try again.");
      } finally {
        if (requestId === requestSequence.current) {
          setLoading(false);
        }
      }
    };

    fetchGenreData();
  }, [activeGenre]);

  // Load more movies or TV shows
  const loadMore = async (section) => {
    const currentPagination = pagination[section];

    if (
      !currentPagination ||
      currentPagination.loading ||
      !currentPagination.hasMore
    ) {
      return;
    }

    const requestId = requestSequence.current;
    const nextPage = currentPagination.page + 1;

    setPagination((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        loading: true,
        error: "",
      },
    }));

    try {
      let data;

      if (activeGenre === "All") {
        const normalFetchers = {
          trending: getTrendingMovies,
          popular: getPopularMovies,
          topRated: getTopRatedMovies,
          upcoming: getUpcomingMovies,
          tv: getPopularTV,
        };

        data = await normalFetchers[section](nextPage);
      } else {
        const genreName =
          activeGenre === "Sci-Fi"
            ? "Science Fiction"
            : activeGenre;

        const genreId =
          section === "tv"
            ? tvGenreIdsRef.current[genreName]
            : movieGenreIdsRef.current[genreName];

        if (!genreId) {
          return;
        }

        data = await getGenreMovies(
          section,
          genreId,
          nextPage
        );
      }

      if (requestId !== requestSequence.current) return;

      const newMovies = (data.results || []).map((movie) =>
        normalizeMovie(movie, genreMap)
      );

      setMovies((previous) => {
        const existingIds = new Set(
          previous[section].map((movie) => movie.id)
        );

        const uniqueMovies = newMovies.filter(
          (movie) => !existingIds.has(movie.id)
        );

        return {
          ...previous,
          [section]: [...previous[section], ...uniqueMovies],
        };
      });

      setPagination((previous) => ({
        ...previous,
        [section]: {
          page: data.page || nextPage,
          hasMore:
            (data.page || nextPage) < (data.total_pages || nextPage),
          loading: false,
          error: "",
        },
      }));
    } catch (error) {
      if (requestId !== requestSequence.current) return;

      console.error(`Load More ${section} Error:`, error);

      setPagination((previous) => ({
        ...previous,
        [section]: {
          ...previous[section],
          loading: false,
          error: "Failed to load more. Please try again.",
        },
      }));
    }
  };

  // Search movies and TV shows
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setSearchLoading(true);

        const data = await searchMoviesAndTV(search);

        const results = (data.results || [])
          .filter(
            (item) =>
              item.media_type === "movie" || item.media_type === "tv"
          )
          .map((item) => normalizeMovie(item, genreMap));

        setSearchResults(results);
      } catch (error) {
        console.error("Search Error:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [search, genreMap]);

  // Toggle favorite
  const toggleFavorite = async (movie) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      const mediaType = movie.mediaType || "movie";

      if (favorites.has(movie.id)) {
        await removeFavorite(movie.id, mediaType);

        setFavorites((previous) => {
          const updated = new Set(previous);
          updated.delete(movie.id);
          return updated;
        });
      } else {
        await addFavorite({
          id: movie.id,
          media_type: mediaType,
          title: movie.title,
          poster_path: movie.poster,
          release_date: movie.year?.toString(),
          vote_average: movie.rating,
          genre_ids: movie.genreIds || [],
        });

        setFavorites((previous) => {
          const updated = new Set(previous);
          updated.add(movie.id);
          return updated;
        });
      }
    } catch (error) {
      console.error("Favorite Error:", error);
      alert("Failed to update favorite.");
    }
  };

  // Filter search results by selected genre
  const filterByGenre = (list) => {
    if (activeGenre === "All") return list;

    const selectedGenre =
      activeGenre === "Sci-Fi"
        ? "Science Fiction"
        : activeGenre;

    return list.filter((movie) =>
      movie.genreIds.some(
        (id) => genreMap[id] === selectedGenre
      )
    );
  };

  const filteredSearchResults = filterByGenre(searchResults);

  return (
    <div className="min-h-full w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white overflow-x-hidden transition-colors duration-300">
      {/* Discover Hero */}
      <DiscoverHero />

      {/* Main Content - Same Width Layout as Favorites */}
      <main className="w-full px-4 sm:px-6 md:px-10 lg:px-16 py-4 sm:py-6">

        {/* Search & Genre Filter */}
        <div className="flex flex-col xl:flex-row xl:items-center gap-3 sm:gap-4 lg:gap-5 mb-6 sm:mb-8 lg:mb-10">

          {/* Search */}
          <div className="w-full xl:w-[420px] xl:shrink-0">
            <DiscoverSearch
              search={search}
              setSearch={setSearch}
            />
          </div>

          {/* Genres */}
          <div className="w-full min-w-0 xl:flex-1">
            <GenreFilter
              genres={genres}
              activeGenre={activeGenre}
              setActiveGenre={setActiveGenre}
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-center py-16 sm:py-20 text-gray-400">
            Loading movies and TV shows...
          </p>
        )}

        {/* Error */}
        {!loading && error && (
          <p className="text-center py-16 sm:py-20 text-red-400">
            {error}
          </p>
        )}

        {/* Search Results */}
        {!loading && search.trim() && (
          <MovieSection
            title={`Search Results for "${search}"`}
            subtitle={
              activeGenre === "All"
                ? "What everyone is watching right now"
                : `Popular ${activeGenre} movies and shows right now`
               }
            icon={Film}
            movies={filteredSearchResults}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            isAuthenticated={isAuthenticated}
          />
        )}

        {/* Search Loading */}
        {searchLoading && (
          <p className="text-center py-5 text-gray-400">
            Searching...
          </p>
        )}

        {/* No Search Results */}
        {!loading &&
          search.trim() &&
          !searchLoading &&
          filteredSearchResults.length === 0 && (
            <p className="text-center py-16 text-gray-400">
              No results found.
            </p>
          )}

        {/* Normal Sections */}
        {!loading && !search.trim() && (
          <>
            {/* Trending */}
            <div id="trending-section">
              <MovieSection
                title="Trending This Week"
                subtitle="What everyone is watching right now"
                icon={TrendingUp}
                movies={movies.trending}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                isAuthenticated={isAuthenticated}
                onLoadMore={() => loadMore("trending")}
                hasMore={pagination.trending.hasMore}
                isLoadingMore={pagination.trending.loading}
                loadMoreError={pagination.trending.error}
              />
            </div>

            {/* Popular */}
            <MovieSection
              title="Popular Movies"
              subtitle="Fan favorites"
              icon={Film}
              movies={movies.popular}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              isAuthenticated={isAuthenticated}
              onLoadMore={() => loadMore("popular")}
              hasMore={pagination.popular.hasMore}
              isLoadingMore={pagination.popular.loading}
              loadMoreError={pagination.popular.error}
            />

            {/* Top Rated */}
            <MovieSection
              title="Top Rated Movies"
              subtitle="The highest-rated movies of all time"
              icon={Star}
              movies={movies.topRated}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              isAuthenticated={isAuthenticated}
              onLoadMore={() => loadMore("topRated")}
              hasMore={pagination.topRated.hasMore}
              isLoadingMore={pagination.topRated.loading}
              loadMoreError={pagination.topRated.error}
            />

            {/* Upcoming */}
            <MovieSection
              title="Coming Soon"
              subtitle="Movies to look forward to"
              icon={CalendarDays}
              movies={movies.upcoming}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              isAuthenticated={isAuthenticated}
              onLoadMore={() => loadMore("upcoming")}
              hasMore={pagination.upcoming.hasMore}
              isLoadingMore={pagination.upcoming.loading}
              loadMoreError={pagination.upcoming.error}
            />

            {/* TV Shows */}
            <MovieSection
              title="Popular TV Shows"
              subtitle="Binge-worthy series"
              icon={Tv}
              movies={movies.tv}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              isAuthenticated={isAuthenticated}
              onLoadMore={() => loadMore("tv")}
              hasMore={pagination.tv.hasMore}
              isLoadingMore={pagination.tv.loading}
              loadMoreError={pagination.tv.error}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default Discover;
