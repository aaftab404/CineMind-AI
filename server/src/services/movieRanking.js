
const getReleaseYear = (item, type) => {
  const date = type === "tv" ? item.first_air_date : item.release_date;

  return date ? Number(date.substring(0, 4)) : null;
};

export const rankMovies = (movies, criteria, type, similarIds = []) => {
  const uniqueMovies = new Map();

  for (const movie of movies) {
    if (!movie.id || uniqueMovies.has(movie.id)) continue;

    const year = getReleaseYear(movie, type);

    if (!year) continue;

    if (criteria.yearFrom && year < criteria.yearFrom) continue;
    if (criteria.yearTo && year > criteria.yearTo) continue;

    if (criteria.genreId && !movie.genre_ids?.includes(criteria.genreId)) {
      continue;
    }

    const overview = (movie.overview || "").toLowerCase();
    const title = (movie.title || movie.name || "").toLowerCase();

    let score = 0;

    if (similarIds.includes(movie.id)) {
      score += 40;
    }

    for (const theme of criteria.themes) {
      const words = theme.split(" ");

      if (
        overview.includes(theme) ||
        title.includes(theme) ||
        words.some((word) => word.length > 3 && overview.includes(word))
      ) {
        score += 10;
      }
    }

    score += Math.min(movie.vote_average || 0, 10);
    score += Math.min((movie.popularity || 0) / 100, 5);

    uniqueMovies.set(movie.id, {
      ...movie,
      matchScore: score,
    });
  }

  return [...uniqueMovies.values()]
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
};
