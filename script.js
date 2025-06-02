function applyFadeEffect(elements, action = 'add') {
  elements.forEach(el => {
    if (el) {
      if (action === 'add') {
        el.classList.add('fade');
      } else {
        el.classList.remove('fade');
      }
    }
  });
}

async function getQuote() {
  const quoteElem = document.getElementById('quote');
  const authorElem = document.getElementById('author');
  const showElem = document.getElementById('show'); 
  const animeImage = document.getElementById('anime-image');
  const animeTitle = document.getElementById('anime-title');
  const animeDetails = document.getElementById('anime-details');
  const animeRating = document.getElementById('anime-rating');
  const animeStatus = document.getElementById('anime-status');
  const animeRank = document.getElementById('anime-rank');
  const animeTags = document.getElementById('anime-tags');

  const allElements = [
    quoteElem, authorElem, showElem, animeImage, animeTitle, 
    animeDetails, animeRating, animeStatus, animeRank, animeTags
  ];

  applyFadeEffect(allElements, 'add');
  await new Promise(resolve => setTimeout(resolve, 300));

  let item;
  try {
    const response = await fetch('https://yurippe.vercel.app/api/quotes?random=1');
    if (!response.ok) throw new Error(`Yurippe API error: ${response.status}`);
    const data = await response.json();
    item = data[0];
  } catch (error) {
    console.error("Yurippe API error:", error);
    item = null;
  }

  if (!item) {
    if (quoteElem) quoteElem.innerText = "Could not load quote.";
    if (authorElem) authorElem.innerText = "";
    if (showElem) showElem.textContent = "";
    if (animeImage) { animeImage.src = ""; animeImage.alt = "No image"; }
    if (animeTitle) animeTitle.textContent = "No information available";
    if (animeDetails) animeDetails.textContent = "";
    if (animeRating) animeRating.textContent = "";
    if (animeStatus) animeStatus.textContent = "";
    if (animeRank) animeRank.textContent = "";
    if (animeTags) animeTags.textContent = "";
    applyFadeEffect(allElements, 'remove');
    return;
  }

  const quoteText = item.quote || "Quote not found.";
  const character = item.character || "Unknown";
  const showNameFromQuoteApi = item.show || "Unknown";

  let animeInfo = null;
  try {
    const jikanResponse = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(showNameFromQuoteApi)}&limit=1&sfw=true`);
    if (!jikanResponse.ok) throw new Error(`Jikan API error: ${jikanResponse.status}`);
    const jikanData = await jikanResponse.json();
    if (jikanData.data && jikanData.data.length > 0) {
      animeInfo = jikanData.data[0];
    }
  } catch (error) {
    console.error("Jikan API error:", error);
    animeInfo = null;
  }

  if (quoteElem) quoteElem.innerText = quoteText;
  if (authorElem) authorElem.innerText = `– ${character}`;
  if (showElem) showElem.textContent = ""; 

  if (animeInfo) {
    if (animeImage) {
      animeImage.src = animeInfo.images?.jpg?.large_image_url 
                    || animeInfo.images?.jpg?.image_url 
                    || "";
      animeImage.alt = (animeInfo.title_english || animeInfo.title || showNameFromQuoteApi) + " poster";
    }
    if (animeTitle) {
      animeTitle.innerHTML = `<a href="${animeInfo.url}" target="_blank" rel="noopener noreferrer">${animeInfo.title_english || animeInfo.title}</a>`;
    }
    
    const aired = animeInfo.aired?.string || "Unknown";
    const episodes = animeInfo.episodes || "Unknown";
    const type = animeInfo.type || "Unknown";
    const rating = animeInfo.rating || "Unknown"; 
    const status = animeInfo.status || "Unknown";
    const rank = animeInfo.rank ? `Rank: #${animeInfo.rank}` : "Not ranked";

    const genres = animeInfo.genres?.map(g => g.name) || [];
    const themes = animeInfo.themes?.map(t => t.name) || [];
    const demographics = animeInfo.demographics?.map(d => d.name) || [];
    const allTags = [...new Set([...genres, ...themes, ...demographics])];

    if (animeDetails) animeDetails.textContent = `${type} | ${episodes || '?'} Episodes | ${aired}`;
    if (animeRating) animeRating.textContent = `Content Rating: ${rating}`; 
    if (animeStatus) animeStatus.textContent = `Status: ${status}`;
    if (animeRank) animeRank.textContent = rank;
    if (animeTags) animeTags.textContent = allTags.length > 0 ? `Tags: ${allTags.join(', ')}` : "No tags";

  } else { 
    if (animeImage) { animeImage.src = ""; animeImage.alt = "Image not available"; }
    if (animeTitle) animeTitle.textContent = showNameFromQuoteApi;
    if (animeDetails) animeDetails.textContent = "Detailed anime information could not be loaded.";
    if (animeRating) animeRating.textContent = "";
    if (animeStatus) animeStatus.textContent = "";
    if (animeRank) animeRank.textContent = "";
    if (animeTags) animeTags.textContent = "";
  }

  applyFadeEffect(allElements, 'remove');
}

function createAnimeCard(anime) {
  const card = document.createElement('div');
  card.className = 'anime-card';

  const img = document.createElement('img');
  img.src = anime.images?.jpg?.image_url || ''; 
  img.alt = anime.title_english || anime.title;
  img.loading = 'lazy';

  const titleElem = document.createElement('h3');
  const link = document.createElement('a');
  link.href = anime.url || '#';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = anime.title_english || anime.title;
  titleElem.appendChild(link);

  const scoreElem = document.createElement('p');
  scoreElem.textContent = `Score: ${anime.score ? anime.score.toFixed(2) : 'N/A'}`;

  card.appendChild(img);
  card.appendChild(titleElem);
  card.appendChild(scoreElem);
  return card;
}

async function fetchJikanTopAnime(filter = null, limit = 10) {
  let url = `https://api.jikan.moe/v4/top/anime?limit=${limit}&sfw=true`;
  if (filter) {
    url += `&filter=${filter}`;
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Jikan API error: ${response.status} for URL: ${url}`);
      return [];
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Error fetching from Jikan (${url}):`, error);
    return [];
  }
}

async function displayTopAnime(gridId, filter = null, errorText) { 
  const gridElement = document.getElementById(gridId);
  if (!gridElement) return;
  
  gridElement.innerHTML = '<p style="color:#ccc; text-align:center;">Loading...</p>';

  const animeList = await fetchJikanTopAnime(filter, 10); 

  if (animeList.length === 0) {
    gridElement.innerHTML = `<p style="color:#ccc; text-align:center;">${errorText}</p>`;
    return;
  }
  gridElement.innerHTML = ''; 
  animeList.forEach(anime => {
    gridElement.appendChild(createAnimeCard(anime));
  });
}

window.addEventListener('DOMContentLoaded', () => {
  getQuote();
  displayTopAnime('top-anime-grid', null, 'Most popular anime could not be loaded.');
  displayTopAnime('top-airing-grid', 'airing', 'Top airing anime could not be loaded.');
  displayTopAnime('top-upcoming-grid', 'upcoming', 'Top upcoming anime could not be loaded.'); // Yeni bölüm için çağrı
});
