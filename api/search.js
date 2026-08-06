
export default async function handler(req, res) {
  const { q, type } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  try {
    if (type === 'image') {
      // Serper.dev (Google Image Search Alternative)
      const serperKey = process.env.SERPER_API_KEY;
      
      if (!serperKey) {
        return res.status(500).json({ error: 'SERPER_API_KEY is not configured in Vercel.' });
      }

      // Augment the query to ensure we get motorcycle images
      let augmentedQuery = q;
      if (!/motorcycle|moto|bike|wsbk|motogp|supercross|supermoto|isle of man tt/i.test(q)) {
        augmentedQuery = `${q} motorcycle`;
      }

      const response = await fetch('https://google.serper.dev/images', {
        method: 'POST',
        headers: {
          'X-API-KEY': serperKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: augmentedQuery,
          num: 1
        })
      });
      
      const data = await response.json();
      
      if (data.images && data.images.length > 0) {
        return res.status(200).json({
          url: data.images[0].imageUrl,
          alt: data.images[0].title,
          sourceDomain: data.images[0].source,
          sourceUrl: data.images[0].link,
          fallback: false
        });
      }
      
      return res.status(404).json({ error: 'No image found' });

    } else {
      // Live Web Search using Tavily API (specifically built for AI agents)
      const tavilyKey = process.env.TAVILY_API_KEY || "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";
      
      // Augment the query to ensure Tavily focuses strictly on the motorcycle niche
      let augmentedQuery = q;
      if (!/motorcycle|moto|bike|wsbk|motogp|supercross|supermoto|isle of man tt/i.test(q)) {
        augmentedQuery = `${q} (motorcycles OR MotoGP OR WSBK OR Supercross OR Isle of Man TT OR new bikes)`;
      }

      const searchRes = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tavilyKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: augmentedQuery,
          search_depth: "basic",
          include_answer: false,
          max_results: 3
        })
      });

      const searchData = await searchRes.json();

      if (!searchData.results || searchData.results.length === 0) {
        return res.status(200).json({ text: "No relevant information found." });
      }

      // Grab the top 3 results
      const context = searchData.results.map(item => {
        return `${item.title}: ${item.content}`;
      }).join('\n\n');
      
      return res.status(200).json({ text: context });
    }
  } catch (error) {
    console.error('Search API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
