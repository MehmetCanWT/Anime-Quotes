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

  const jikanPlaceholderContent = document.getElementById('jikan-placeholder-content');
  const animeApiContent = document.getElementById('anime-api-content');

  const animeImage = document.getElementById('anime-image');
  const animeTitle = document.getElementById('anime-title');
  const animeDetails = document.getElementById('anime-details');
  const animeRating = document.getElementById('anime-rating');
  const animeStatus = document.getElementById('anime-status');
  const animeRank = document.getElementById('anime-rank');
  const animeTags = document.getElementById('anime-tags');

  const placeholderPosterUrl = 'assest/placeholder-poster.png';

  const elementsToFade = [
    quoteElem, authorElem, animeApiContent
  ];

  applyFadeEffect(elementsToFade, 'add');
  if (jikanPlaceholderContent) {
    jikanPlaceholderContent.style.display = 'none';
  }
  if (animeApiContent) {
    animeApiContent.style.display = 'flex';
  }
   if (animeImage) {
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
    if (animeTitle) animeTitle.innerHTML = "No information available";
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
    if (animeTitle) animeTitle.innerHTML = showNameFromQuoteApi;
    if (animeDetails) animeDetails.textContent = "Detailed anime information could not be loaded.";
    if (animeRating) animeRating.textContent = "";
    if (animeStatus) animeStatus.textContent = "";
    if (animeRank) animeRank.textContent = "";
    if (animeTags) animeTags.textContent = "";
  }

  applyFadeEffect(elementsToFade, 'remove');
}

function createAnimeCard(anime) {
  const cardLink = document.createElement('a');
  cardLink.href = anime.url || '#';
  cardLink.className = 'anime-card';
  cardLink.target = '_blank';
  cardLink.rel = 'noopener noreferrer';
  // cardLink.style = "will-change: transform; transition: all; transform: perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1);"; // Example style, can be in CSS

  const coverDiv = document.createElement('div');
  coverDiv.className = 'anime-card-cover';

  const img = document.createElement('img');
  img.src = anime.images?.jpg?.image_url || 'placeholder-poster.png';
  img.title = anime.title_english || anime.title || 'Anime Poster'; // Using title attribute as in example
  img.alt = anime.title_english || anime.title || 'Anime Poster';
  img.loading = 'lazy';
  coverDiv.appendChild(img);

  const overlayDiv = document.createElement('div');
  overlayDiv.className = 'anime-card-overlay';

  if (anime.rating) {
    const ratedDiv = document.createElement('div');
    ratedDiv.className = 'anime-card-rated';
    const ratedSmall = document.createElement('small');
    ratedSmall.textContent = anime.rating.replace(' - Teens 13 or older', '').replace(' - Violence & Profanity', '');
    ratedDiv.appendChild(ratedSmall);
    // overlayDiv.appendChild(ratedDiv); // Overlay can contain this, or it can be directly on cover
    coverDiv.appendChild(ratedDiv); // As per example, rated is on cover, not overlay text part
  }
  // coverDiv.appendChild(overlayDiv); // The overlay for text seems to be part of cover in example for gradient
  cardLink.appendChild(coverDiv);


  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'anime-card-body';

  if (anime.status) {
    const statusChip = document.createElement('div');
    statusChip.className = 'chip';
    let statusText = anime.status;
    if (statusText === 'Finished Airing') {
        statusChip.classList.add('status-finished-airing');
        statusText = 'Finished Airing';
    } else if (statusText === 'Currently Airing') {
        statusChip.classList.add('status-currently-airing');
        statusText = 'Airing';
    } else if (statusText === 'Not yet aired') {
        statusChip.classList.add('status-not-yet-aired');
        statusText = 'Not Yet Aired';
    }
    const statusSpan = document.createElement('span');
    statusSpan.textContent = statusText;
    statusChip.appendChild(statusSpan);
    bodyDiv.appendChild(statusChip);
  }

  const metaDiv = document.createElement('div');
  metaDiv.className = 'anime-card-meta';
  const seasonSmall = document.createElement('small');
  seasonSmall.textContent = anime.season ? `${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${anime.year || ''}` : (anime.aired?.prop?.from?.year || 'N/A');
  metaDiv.appendChild(seasonSmall);

  if (anime.episodes) {
    const divider = document.createElement('div');
    divider.className = 'divider'; // Assuming a CSS class for this
    metaDiv.appendChild(divider);
    const episodesSmall = document.createElement('small');
    episodesSmall.textContent = `${anime.episodes} episodes`;
    metaDiv.appendChild(episodesSmall);
  }
  bodyDiv.appendChild(metaDiv);

  const titleP = document.createElement('h4'); // Using h4 for better semantics than p for title
  titleP.className = 'anime-card-title';
  titleP.textContent = anime.title_english || anime.title || 'Untitled Anime';
  bodyDiv.appendChild(titleP);

  const ratingDiv = document.createElement('div');
  ratingDiv.className = 'anime-card-rating';

  const scoreDiv = document.createElement('div');
  scoreDiv.className = 'anime-card-score';
  const scoreValDiv = document.createElement('div');
  const scoreSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  scoreSvg.setAttribute('width', '16');
  scoreSvg.setAttribute('height', '16');
  scoreSvg.setAttribute('viewBox', '0 0 24 24');
  scoreSvg.setAttribute('fill', 'none');
  scoreSvg.setAttribute('stroke', 'currentColor');
  scoreSvg.setAttribute('stroke-width', '1.5');
  scoreSvg.setAttribute('stroke-linecap', 'round');
  scoreSvg.setAttribute('stroke-linejoin', 'round');
  scoreSvg.innerHTML = '<path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"></path>';
  scoreValDiv.appendChild(scoreSvg);
  scoreValDiv.append(` ${anime.score ? anime.score.toFixed(1) : 'N/A'}`); // Example shows 1 decimal for score
  scoreDiv.appendChild(scoreValDiv);
  const usersSmall = document.createElement('small');
  usersSmall.textContent = `${anime.members ? (anime.members / 1000).toFixed(0) + 'k users' : 'N/A users'}`;
  scoreDiv.appendChild(usersSmall);
  ratingDiv.appendChild(scoreDiv);

  const rankDiv = document.createElement('div');
  rankDiv.className = 'anime-card-rank';
  const rankValDiv = document.createElement('div');
  const rankSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  rankSvg.setAttribute('width', '16');
  rankSvg.setAttribute('height', '16');
  rankSvg.setAttribute('viewBox', '0 0 24 24');
  rankSvg.setAttribute('fill', 'none');
  rankSvg.setAttribute('stroke', 'currentColor');
  rankSvg.setAttribute('stroke-width', '1.5');
  rankSvg.setAttribute('stroke-linecap', 'round');
  rankSvg.setAttribute('stroke-linejoin', 'round');
  rankSvg.innerHTML = '<path d="M5 9l14 0"></path><path d="M5 15l14 0"></path><path d="M11 4l-4 16"></path><path d="M17 4l-4 16"></path>';
  rankValDiv.appendChild(rankSvg);
  rankValDiv.append(` ${anime.rank || 'N/A'}`);
  rankDiv.appendChild(rankValDiv);
  const rankTextSmall = document.createElement('small');
  rankTextSmall.textContent = 'Ranking';
  rankDiv.appendChild(rankTextSmall);
  ratingDiv.appendChild(rankDiv);
  bodyDiv.appendChild(ratingDiv);

  const genresDiv = document.createElement('div');
  genresDiv.className = 'anime-card-genres';
  const genresToShow = (anime.genres || []).slice(0, 2); // Show max 2 genres
  genresToShow.forEach(genre => {
    const genreChip = document.createElement('div');
    genreChip.className = 'chip genre-tag'; // Added genre-tag for specific styling
    const genreSpan = document.createElement('span');
    genreSpan.textContent = genre.name;
    genreChip.appendChild(genreSpan);
    genresDiv.appendChild(genreChip);
  });
  if (anime.genres && anime.genres.length > 2) {
    const moreChip = document.createElement('div');
    moreChip.className = 'chip genre-tag genre-more'; // Added genre-more for specific styling
    const moreSpan = document.createElement('span');
    moreSpan.textContent = `+${anime.genres.length - 2}`;
    moreChip.appendChild(moreSpan);
    genresDiv.appendChild(moreChip);
  }
  bodyDiv.appendChild(genresDiv);

  cardLink.appendChild(bodyDiv);
  return cardLink;
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
  displayTopAnime('top-anime-grid', null, 'Most popular anime could not be loaded.');
  displayTopAnime('top-airing-grid', 'airing', 'Top airing anime could not be loaded.');
  displayTopAnime('top-upcoming-grid', 'upcoming', 'Top upcoming anime could not be loaded.');
});
