const q = "When will the new s1000rr be relased?";
const augmentedQuery = `${q} (motorcycles OR MotoGP OR WSBK OR Supercross OR Isle of Man TT OR new bikes)`;
const tavilyKey = "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";

fetch("https://api.tavily.com/search", {
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
}).then(res => res.json()).then(console.log).catch(console.error);
