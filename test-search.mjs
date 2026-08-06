import { search } from 'duck-duck-scrape';

async function test() {
  const q = "What is the price of the newest superleggera?";
  const searchResults = await search(q, {
    time: "m",
  });
  console.log(searchResults.results.slice(0, 3));
}
test();
