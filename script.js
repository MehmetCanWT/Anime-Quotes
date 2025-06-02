// Anime Quote API
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

  quoteElem.textContent = 'Loading quote...';
  authorElem.textContent = '';
  animeImage.src = '';
  animeImage.alt = 'Loading...';
  animeTitle.textContent = '';
  animeDetails.textContent = '';
  animeRating.textContent = '';
  animeStatus.textContent = '';
  animeRank.textContent = '';
  animeTags.textContent = '';

  try {
    // Animechan API - rastgele anime alıntısı
    const response = await fetch('https://animechan.vercel.app/api/random');
    if (!response.ok) throw new Error('Quote API error');
    const data = await response.json();

    quoteElem.textContent = `"${data.quote}"`;
    authorElem.textContent = `- ${data.character}, ${data.anime}`;

    // Anime bilgisi için Jikan API çağrısı
    // Jikan API docs: https://docs.api.jikan.moe/
    const searchUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(data.anime)}&limit=1`;
    const animeResp = await fetch(searchUrl);
    if (!animeResp.ok) throw new Error('Anime info API error');
    const animeData = await animeResp.json();

    if (animeData.data && animeData.data.length > 0) {
      const anime = animeData.data[0];
      animeImage.src = anime.images.jpg.image_url || '';
      animeImage.alt = anime.title + ' poster';
      animeTitle.textContent = anime.title;
      animeDetails.textContent = `Episodes: ${anime.episodes || 'N/A'} | Type: ${anime.type || 'N/A'}`;
      animeRating.textContent = `Score: ${anime.score || 'N/A'}`;
      animeStatus.textContent = `Status: ${anime.status || 'N/A'}`;
      animeRank.textContent = `Rank: #${anime.rank || 'N/A'}`;
      animeTags.textContent = `Genres: ${anime.genres.map(g => g.name).join(', ') || 'N/A'}`;
    }
  } catch (error) {
    console.error('Quote or anime fetch error:', error);
    quoteElem.textContent = 'Failed to load quote or anime info.';
  }
}

// Top anime listesi için fonksiyon
async function fetchTopAnime(filter) {
  try {
    // Jikan API v4 Top Anime endpoint - filtreleri bu şekilde kullandım:
    // filter değerleri: airing, upcoming, bypopularity, favorite
    const url = `https://api.jikan.moe/v4/top/anime?filter=${filter}&limit=10`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Top anime fetch error for filter: ${filter}`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

function renderAnimeList(containerId, animeList) {
  const container = document.querySelector(`#${containerId} .list-content`);
  if (!container) return;

  if (animeList.length === 0) {
    container.innerHTML = '<p>No data available.</p>';
    return;
  }

  const html = animeList.map(anime =>
    `<li><a href="${anime.url}" target="_blank" rel="noopener noreferrer">${anime.title}</a></li>`
  ).join('');

  container.innerHTML = `<ol>${html}</ol>`;
}

async function loadAllTopAnimeLists() {
  const airing = await fetchTopAnime('airing');
  renderAnimeList('top-airing', airing);

  const upcoming = await fetchTopAnime('upcoming');
  renderAnimeList('top-upcoming', upcoming);

  const popular = await fetchTopAnime('bypopularity');
  renderAnimeList('most-popular', popular);

  const favorite = await fetchTopAnime('favorite');
  renderAnimeList('highest-rated', favorite);
}

window.onload = async () => {
  await getQuote();
  await loadAllTopAnimeLists();
};
