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
  const showElem = document.getElementById('show'); // This element is in HTML but not actively used for display

  const jikanPlaceholderContent = document.getElementById('jikan-placeholder-content');
  const animeApiContent = document.getElementById('anime-api-content');

  const animeImage = document.getElementById('anime-image');
  const animeTitle = document.getElementById('anime-title');
  const animeDetails = document.getElementById('anime-details');
  const animeRating = document.getElementById('anime-rating');
  const animeStatus = document.getElementById('anime-status');
  const animeRank = document.getElementById('anime-rank');
  const animeTags = document.getElementById('anime-tags');

  const placeholderPosterUrl = 'placeholder-poster.png';

  const elementsToFade = [
    quoteElem, authorElem, animeApiContent
  ];

  applyFadeEffect(elementsToFade, 'add');
  if (jikanPlaceholderContent) {
    jikanPlaceholderContent.style.display = 'none';
  }
  if (animeApiContent) {
    animeApiContent.style.display = 'flex'; // Make sure API content container is visible
  }
   if (animeImage) { // Set placeholder for the image within API content div
      animeImage.src = placeholderPosterUrl;
      animeImage.alt = "Loading anime poster...";
  }


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

    if (animeImage) {
        animeImage.src = placeholderPosterUrl;
        animeImage.alt = "Anime poster not available";
    }
    if (animeTitle) animeTitle.innerHTML = "No information available"; // Use innerHTML to clear potential links
    if (animeDetails) animeDetails.textContent = "";
    if (animeRating) animeRating.textContent = "";
    if (animeStatus) animeStatus.textContent = "";
    if (animeRank) animeRank.textContent = "";
    if (animeTags) animeTags.textContent = "";

    applyFadeEffect(elementsToFade, 'remove');
    return;
  }

  const quoteText = item.quote || "Quote not found.";
  const character = item.character || "Unknown";
  const showNameFromQuoteApi = item.show || "Unknown";

  let currentAnimeInfo = null;
  try {
    const cleanedShowName = showNameFromQuoteApi.replace(/\//g, ' ');
    const jikanResponse = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(cleanedShowName)}&limit=1&sfw=true`);
    if (!jikanResponse.ok) throw new Error(`Jikan API error: ${jikanResponse.status}`);
    const jikanData = await jikanResponse.json();
    if (jikanData.data && jikanData.data.length > 0) {
      currentAnimeInfo = jikanData.data[0];
    }
  } catch (error) {
    console.error("Jikan API error:", error);
    currentAnimeInfo = null;
  }

  if (quoteElem) quoteElem.innerText = quoteText;
  if (authorElem) authorElem.innerText = `– ${character}`;
  if (showElem) showElem.textContent = "";

  if (currentAnimeInfo) {
    if (animeImage) {
      animeImage.src = currentAnimeInfo.images?.jpg?.large_image_url
                    || currentAnimeInfo.images?.jpg?.image_url
                    || placeholderPosterUrl;
      animeImage.alt = (currentAnimeInfo.title_english || currentAnimeInfo.title || showNameFromQuoteApi) + " poster";
    }
    if (animeTitle) {
      animeTitle.innerHTML = `<a href="${currentAnimeInfo.url}" target="_blank" rel="noopener noreferrer">${currentAnimeInfo.title_english || currentAnimeInfo.title}</a>`;
    }
    const aired = currentAnimeInfo.aired?.string || "Unknown";
    const episodes = currentAnimeInfo.episodes || "Unknown";
    const type = currentAnimeInfo.type || "Unknown";
    const rating = currentAnimeInfo.rating || "Unknown";
    const status = currentAnimeInfo.status || "Unknown";
    const rank = currentAnimeInfo.rank ? `Rank: #${currentAnimeInfo.rank}` : "Not ranked";

    const genres = currentAnimeInfo.genres?.map(g => g.name) || [];
    const themes = currentAnimeInfo.themes?.map(t => t.name) || [];
    const demographics = currentAnimeInfo.demographics?.map(d => d.name) || [];
    const allTags = [...new Set([...genres, ...themes, ...demographics])];

    if (animeDetails) animeDetails.textContent = `${type} | ${episodes || '?'} Episodes | ${aired}`;
    if (animeRating) animeRating.textContent = `Content Rating: ${rating}`;
    if (animeStatus) animeStatus.textContent = `Status: ${status}`;
    if (animeRank) animeRank.textContent = rank;
    if (animeTags) animeTags.textContent = allTags.length > 0 ? `Tags: ${allTags.join(', ')}` : "No tags";

  } else {
    if (animeImage) {
        animeImage.src = placeholderPosterUrl;
        animeImage.alt = "Anime poster not available";
    }
    if (animeTitle) animeTitle.innerHTML = showNameFromQuoteApi; // Use innerHTML to clear potential links
    if (animeDetails) animeDetails.textContent = "Detailed anime information could not be loaded.";
    if (animeRating) animeRating.textContent = "";
    if (animeStatus) animeStatus.textContent = "";
    if (animeRank) animeRank.textContent = "";
    if (animeTags) animeTags.textContent = "";
  }

  applyFadeEffect(elementsToFade, 'remove');
}

function createAnimeCard(anime) {
  const card = document.createElement('div');
  card.className = 'anime-card';

  const img = document.createElement('img');
  img.src = anime.images?.jpg?.image_url || 'placeholder-poster.png';
  img.alt = anime.title_english || anime.title || 'Anime Poster';
  img.loading = 'lazy';

  const cardInfo = document.createElement('div');
  cardInfo.className = 'anime-card-info';

  const titleElem = document.createElement('h3');
  const link = document.createElement('a');
  link.href = anime.url || '#';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = anime.title_english || anime.title || 'Untitled Anime';
  titleElem.appendChild(link);

  const scoreElem = document.createElement('p');
  scoreElem.textContent = `Score: ${anime.score ? anime.score.toFixed(2) : 'N/A'}`;

  cardInfo.appendChild(titleElem);
  cardInfo.appendChild(scoreElem);

  card.appendChild(img);
  card.appendChild(cardInfo);
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

  gridElement.innerHTML = '<p style="color:#e0d8cc; text-align:center;">Loading...</p>';

  const animeList = await fetchJikanTopAnime(filter, 15);

  if (animeList.length === 0) {
    gridElement.innerHTML = `<p style="color:#e0d8cc; text-align:center;">${errorText}</p>`;
    return;
  }
  gridElement.innerHTML = '';
  const displayedMalIds = new Set();

  animeList.forEach(anime => {
    if (anime.mal_id && !displayedMalIds.has(anime.mal_id)) {
      gridElement.appendChild(createAnimeCard(anime));
      displayedMalIds.add(anime.mal_id);
    }
  });

  if (gridElement.children.length === 0 && animeList.length > 0) {
     gridElement.innerHTML = `<p style="color:#e0d8cc; text-align:center;">${errorText} (No unique items to display after filtering)</p>`;
  } else if (gridElement.children.length === 0 && animeList.length === 0) {
     gridElement.innerHTML = `<p style="color:#e0d8cc; text-align:center;">${errorText}</p>`;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // Do not call getQuote() here for initial load
  // Placeholder will be shown by default via HTML and CSS
  displayTopAnime('top-anime-grid', null, 'Most popular anime could not be loaded.');
  displayTopAnime('top-airing-grid', 'airing', 'Top airing anime could not be loaded.');
  displayTopAnime('top-upcoming-grid', 'upcoming', 'Top upcoming anime could not be loaded.');
});
