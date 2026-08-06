
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

      // Clean conversational prefixes for precise Google search results
      let cleanQuery = q.replace(/^(i want|i need|tell me about|give me|show me|can i see|what is|how about|looking for|info on|details on)\s+/gi, '').trim();

      // Augment the query to ensure we get motorcycle images
      let augmentedQuery = cleanQuery;
      if (!/motorcycle|moto|bike|wsbk|motogp|supercross|supermoto|isle of man tt/i.test(cleanQuery)) {
        augmentedQuery = `${cleanQuery} motorcycle`;
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
    } else if (type === 'video') {
      // Live Video Search using Serper.dev
      const serperKey = process.env.SERPER_API_KEY;
      if (!serperKey) return res.status(500).json({ error: 'SERPER_API_KEY missing' });

      let augmentedQuery = q;
      if (!/motorcycle|moto|bike|wsbk|motogp|supercross|supermoto|isle of man tt/i.test(q)) {
        augmentedQuery = `${q} motorcycle`;
      }

      const response = await fetch('https://google.serper.dev/videos', {
        method: 'POST',
        headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: augmentedQuery, num: 1 })
      });
      
      const data = await response.json();
      
      if (data.videos && data.videos.length > 0) {
        // Extract YouTube ID from link (e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ)
        const link = data.videos[0].link;
        let videoId = null;
        if (link.includes('youtube.com/watch?v=')) {
          videoId = link.split('v=')[1].split('&')[0];
        } else if (link.includes('youtu.be/')) {
          videoId = link.split('youtu.be/')[1].split('?')[0];
        }
        
        if (videoId) {
          return res.status(200).json({
            embedUrl: `https://www.youtube.com/embed/${videoId}`,
            title: data.videos[0].title
          });
        }
      }
      return res.status(404).json({ error: 'No video found' });

    } else {
      // Live Web Search using Serper.dev (Google Search)
      const serperKey = process.env.SERPER_API_KEY;
      
      if (!serperKey) {
        return res.status(500).json({ error: 'SERPER_API_KEY is not configured in Vercel.' });
      }
      
      // Augment the query to ensure we get motorcycle results
      let augmentedQuery = q;
      if (!/motorcycle|moto|bike|wsbk|motogp|supercross|supermoto|isle of man tt/i.test(q)) {
        augmentedQuery = `${q} motorcycle`;
      }

      const searchRes = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": serperKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          q: augmentedQuery,
          num: 4
        })
      });

      const searchData = await searchRes.json();

      if (!searchData.organic || searchData.organic.length === 0) {
        return res.status(200).json({ text: "No relevant information found." });
      }

      // Grab the top 4 snippets
      const context = searchData.organic.slice(0, 4).map(item => {
        return `${item.title}: ${item.snippet}`;
      }).join('\n\n');
      
      return res.status(200).json({ text: context });
    }
  } catch (error) {
    console.error('Search API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
