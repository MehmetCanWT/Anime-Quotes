async function getQuote() {
  const quoteElem = document.getElementById('quote');
  const authorElem = document.getElementById('author');
  const animeImage = document.getElementById('anime-image');
  const animeTitle = document.getElementById('anime-title');
  const animeDetails = document.getElementById('anime-details');
  const animeRating = document.getElementById('anime-rating');
  const animeStatus = document.getElementById('anime-status');
  const animeRank = document.getElementById('anime-rank');
  const animeTags = document.getElementById('anime-tags');

  // Başlangıçta loading göster
  quoteElem.textContent = "Loading quote...";
  authorElem.textContent = "";
  animeImage.src = "";
  animeTitle.textContent = "";
  animeDetails.textContent = "";
  animeRating.textContent = "";
  animeStatus.textContent = "";
  animeRank.textContent = "";
  animeTags.textContent = "";

  // Yurippe API'den rastgele alıntı çek
  let quoteData;
  try {
    const res = await fetch('https://yurippe.vercel.app/api/quotes?random=1');
    const json = await res.json();
    quoteData = json[0];
  } catch {
    quoteElem.textContent = "Quote could not be loaded.";
    return;
  }

  if (!quoteData) {
    quoteElem.textContent = "Quote not found.";
    return;
  }

  quoteElem.textContent = `"${quoteData.quote}"`;
  authorElem.textContent = `- ${quoteData.character}`;

  // Anime adına göre Jikan'dan bilgi al
  const animeName = quoteData.show;
  let animeInfo = null;

  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeName)}&limit=1`);
    const json = await res.json();
    if (json.data && json.data.length > 0) {
      animeInfo = json.data[0];
    }
  } catch (e) {
    console.error("Jikan API error:", e);
  }

  if (animeInfo) {
    animeImage.src = animeInfo.images.jpg.image_url;
    animeImage.alt = animeInfo.title + " poster";
    animeTitle.innerHTML = `<a href="${animeInfo.url}" target="_blank" rel="noopener noreferrer">${animeInfo.title}</a>`;
    animeDetails.textContent = `Type: ${animeInfo.type} | Episodes: ${animeInfo.episodes || "?"} | Aired: ${animeInfo.aired.string || "?"}`;
    animeRating.textContent = `Rating: ${animeInfo.rating || "?"}`;
    animeStatus.textContent = `Status: ${animeInfo.status || "?"}`;
    animeRank.textContent = animeInfo.rank ? `Rank: #${animeInfo.rank}` : "";
    animeTags.textContent = animeInfo.genres.length > 0 ? `Genres: ${animeInfo.genres.map(g => g.name).join(', ')}` : "";
  } else {
    animeImage.src = "";
    animeImage.alt = "No image available";
    animeTitle.textContent = animeName;
    animeDetails.textContent = "";
    animeRating.textContent = "";
    animeStatus.textContent = "";
    animeRank.textContent = "";
    animeTags.textContent = "";
  }
}

// Top animeleri çek ve render et
async function fetchAndRenderTopAnime() {
  const categories = [
    { id: 'top-airing', filter: 'airing', title: 'Top Airing' },
    { id: 'top-upcoming', filter: 'upcoming', title: 'Top Upcoming' },
    { id: 'most-popular', filter: 'bypopularity', title: 'Most Popular' },
    { id: 'highest-rated', filter: 'favorite', title: 'Highest Rated' }
  ];

  for (const cat of categories) {
    const container = document.querySelector(`#${cat.id} .list-content`);
    container.textContent = 'Loading...';

    try {
      const res = await fetch(`https://api.jikan.moe/v4/top/anime?type=tv&filter=${cat.filter}&limit=5`);
      const json = await res.json();

      if (!json.data || json.data.length === 0) {
        container.textContent = "No anime found.";
        continue;
      }

      container.innerHTML = json.data.map(anime => {
        const malUrl = `https://myanimelist.net/anime/${anime.mal_id}`;
        const imageUrl = anime.images.jpg.image_url;
        const score = anime.score ? anime.score.toFixed(2) : "N/A";

        return `
          <div class="top-anime-box" role="listitem" tabindex="0" aria-label="${anime.title}, rating ${score}">
            <a href="${malUrl}" target="_blank" rel="noopener noreferrer" class="top-anime-link">
              <img src="${imageUrl}" alt="${anime.title} poster" class="top-anime-img" />
              <div class="top-anime-info">
                <div class="top-anime-title">${anime.title}</div>
                <div class="top-anime-rating">Rating: ${score}</div>
              </div>
            </a>
          </div>
        `;
      }).join('');
    } catch (e) {
      container.textContent = "Failed to load.";
      console.error(e);
    }
  }
}

// Sayfa yüklenince çalıştır
window.addEventListener('DOMContentLoaded', () => {
  getQuote();
  fetchAndRenderTopAnime();
});
