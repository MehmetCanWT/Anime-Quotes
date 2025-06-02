const quote = document.getElementById("quote");
const character = document.getElementById("character");
const anime = document.getElementById("anime");

async function fetchRandomQuote() {
  const res = await fetch("https://animechan.xyz/api/random");
  const data = await res.json();
  quote.textContent = `"${data.quote}"`;
  character.textContent = `— ${data.character}`;
  anime.textContent = `Anime: ${data.anime}`;
}

fetchRandomQuote();

document.getElementById("search-button").addEventListener("click", async () => {
  const query = document.getElementById("search-input").value.trim();
  if (!query) return;

  const res = await fetch(`https://api.jikan.moe/v4/anime?q=${query}`);
  const data = await res.json();

  const resultsGrid = document.querySelector(".results-grid");
  resultsGrid.innerHTML = data.data
    .map(
      (anime) => `
    <div class="anime-card">
      <img src="${anime.images.jpg.image_url}" alt="${anime.title}" />
      <div class="title">${anime.title}</div>
    </div>`
    )
    .join("");
});

async function loadTopList(type, selector) {
  const res = await fetch(`https://api.jikan.moe/v4/top/anime?filter=${type}&limit=10`);
  const data = await res.json();
  const container = document.querySelector(`#${selector} .list-content`);
  container.innerHTML = data.data
    .map(
      (anime) => `
    <div class="anime-box">
      <img src="${anime.images.jpg.image_url}" alt="${anime.title}" />
      <div class="anime-info">
        <div class="anime-title"><a href="${anime.url}" target="_blank" rel="noopener noreferrer">${anime.title}</a></div>
        <div class="anime-score">Score: ${anime.score ?? "N/A"}</div>
      </div>
    </div>`
    )
    .join("");
}

loadTopList("airing", "top-airing");
loadTopList("upcoming", "top-upcoming");
loadTopList("bypopularity", "most-popular");
loadTopList("favorite", "highest-rated");
