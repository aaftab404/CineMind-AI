
const GENRES = {
  "science fiction": 878,
  "sci-fi": 878,
  "sci fi": 878,
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  thriller: 53,
  war: 10752,
  western: 37,
};

const THEME_KEYWORDS = [
  "mind-bending",
  "mind bending",
  "psychological",
  "dream",
  "dreams",
  "reality",
  "subconscious",
  "time",
  "time travel",
  "time loop",
  "twist",
  "twists",
  "memory",
  "simulation",
  "parallel world",
  "parallel universe",
  "space",
  "alien",
  "superhero",
  "revenge",
  "survival",
  "mystery",
  "detective",
  "heist",
  "war",
  "love",
  "romance",
  "friendship",
  "comedy",
  "horror",
  "action",
  "crime",
];

export const analyzePromptLocally = (prompt) => {
  const text = prompt.toLowerCase();

  const isTV = /\b(tv|tv show|series|web series|show|shows)\b/.test(text);

  let genre = null;
  let genreId = null;

  for (const [name, id] of Object.entries(GENRES)) {
    if (text.includes(name)) {
      genre = name;
      genreId = id;
      break;
    }
  }

  let yearFrom = null;
  let yearTo = null;

  const afterMatch = text.match(
    /(?:after|since|from|later than)\s+(19\d{2}|20\d{2})/
  );

  const beforeMatch = text.match(
    /(?:before|earlier than|prior to)\s+(19\d{2}|20\d{2})/
  );

  const betweenMatch = text.match(
    /between\s+(19\d{2}|20\d{2})\s+and\s+(19\d{2}|20\d{2})/
  );

  const inMatch = text.match(
    /(?:released|release|made|from)\s+(?:in\s+)?(19\d{2}|20\d{2})/
  );

  if (betweenMatch) {
    yearFrom = Number(betweenMatch[1]);
    yearTo = Number(betweenMatch[2]);
  } else if (afterMatch) {
    yearFrom = Number(afterMatch[1]) + 1;
  } else if (beforeMatch) {
    yearTo = Number(beforeMatch[1]) - 1;
  } else if (inMatch) {
    yearFrom = Number(inMatch[1]);
    yearTo = Number(inMatch[1]);
  }

  let referenceTitle = null;

  const referenceMatch = prompt.match(
    /(?:similar to|like|similar with)\s+(.+?)(?=\s+(?:released|from|after|before|between|in|with|that|which)\b|[?.!,]|$)/i
  );

  if (referenceMatch) {
    referenceTitle = referenceMatch[1].trim();
  }

  const themes = THEME_KEYWORDS.filter((keyword) =>
    text.includes(keyword)
  );

  return {
    genre,
    genreId,
    type: isTV ? "tv" : "movie",
    yearFrom,
    yearTo,
    themes,
    referenceTitle,
  };
};
