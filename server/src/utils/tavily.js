const searchTavily = async (query) => {
    console.log("Searching Tavily for query:", query);
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer tvly-21DC6F-Jtuixw0PnDT6enICMzepLmV7z4v56YRg76dj9QXYXg`,
      },
      body: JSON.stringify({
        query,
        search_depth: "basic",
        max_results: 5,
        include_answer: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API Error: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Tavily Search Error:", error.message);
    throw error;
  }
};

export default searchTavily;

// searchTavily("Find me a movie about time travel and romance").then(data => {
//   console.log("Tavily Search Results:", data['answer']);
// }).catch(error => {
//   console.error("Error during Tavily search:", error);
// });