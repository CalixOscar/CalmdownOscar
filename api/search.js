import { search } from 'duck-duck-scrape';

export default async function handler(req, res) {
  const { q, type } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  try {
    if (type === 'image') {
      // Unsplash Image Search
      const unsplashKey = process.env.UNSPLASH_API_KEY;
      if (!unsplashKey) {
        return res.status(500).json({ error: 'UNSPLASH_API_KEY is not configured in Vercel.' });
      }

      const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=1`, {
        headers: {
          'Authorization': `Client-ID ${unsplashKey}`
        }
      });
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return res.status(200).json({
          url: data.results[0].urls.regular,
          alt: data.results[0].alt_description
        });
      }
      return res.status(404).json({ error: 'No image found' });

    } else {
      // Live Web Search using DuckDuckGo to get up-to-date news and facts
      const searchResults = await search(q, {
        safeSearch: "moderate",
        time: "m", // Search past month for up-to-date news
      });

      if (searchResults.noResults) {
        return res.status(200).json({ text: "No relevant information found." });
      }

      // Grab the top 3 results
      const context = searchResults.results.slice(0, 3).map(item => {
        return `${item.title}: ${item.description}`;
      }).join('\n\n');
      
      return res.status(200).json({ text: context });
    }
  } catch (error) {
    console.error('Search API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
