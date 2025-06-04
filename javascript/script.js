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
  const animeTitleElem = document.getElementById('anime-title');
  const animeDetailsElem = document.getElementById('anime-details');
  const animeRatingElem = document.getElementById('anime-rating');
  const animeStatusElem = document.getElementById('anime-status');
  const animeRankElem = document.getElementById('anime-rank');
  const animeTagsElem = document.getElementById('anime-tags');

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
  let currentAnimeForQuote = null; // Store anime info for the quote section

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
    if (animeTitleElem) animeTitleElem.innerHTML = "No information available";
    if (animeDetailsElem) animeDetailsElem.textContent = "";
    if (animeRatingElem) animeRatingElem.textContent = "";
    if (animeStatusElem) animeStatusElem.textContent = "";
    if (animeRankElem) animeRankElem.textContent = "";
    if (animeTagsElem) animeTagsElem.textContent = "";

    applyFadeEffect(elementsToFade, 'remove');
    return;
  }

  const quoteText = item.quote || "Quote not found.";
  const character = item.character || "Unknown";
  const showNameFromQuoteApi = item.show || "Unknown";

  try {
    const cleanedShowName = showNameFromQuoteApi.replace(/\//g, ' ');
    const jikanResponse = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(cleanedShowName)}&limit=1&sfw=true`);
    if (!jikanResponse.ok) throw new Error(`Jikan API error: ${jikanResponse.status}`);
    const jikanData = await jikanResponse.json();
    if (jikanData.data && jikanData.data.length > 0) {
      currentAnimeForQuote = jikanData.data[0]; // Store for linking title
    }
  } catch (error) {
    console.error("Jikan API error for quote section:", error);
    currentAnimeForQuote = null;
  }

  if (quoteElem) quoteElem.innerText = quoteText;
  if (authorElem) authorElem.innerText = `– ${character}`;
  if (showElem) showElem.textContent = "";

  if (currentAnimeForQuote) {
    if (animeImage) {
      animeImage.src = currentAnimeForQuote.images?.jpg?.large_image_url
                    || currentAnimeForQuote.images?.jpg?.image_url
                    || placeholderPosterUrl;
      animeImage.alt = (currentAnimeForQuote.title_english || currentAnimeForQuote.title || showNameFromQuoteApi) + " poster";
    }
    if (animeTitleElem) {
      // Make the anime title in the quote section a link to its detail page
      animeTitleElem.innerHTML = `<a href="#/anime/${currentAnimeForQuote.mal_id}">${currentAnimeForQuote.title_english || currentAnimeForQuote.title}</a>`;
    }
    const aired = currentAnimeForQuote.aired?.string || "Unknown";
    const episodes = currentAnimeForQuote.episodes || "Unknown";
    const type = currentAnimeForQuote.type || "Unknown";
    const rating = currentAnimeForQuote.rating || "Unknown";
    const status = currentAnimeForQuote.status || "Unknown";
    const rank = currentAnimeForQuote.rank ? `Rank: #${currentAnimeForQuote.rank}` : "Not ranked";

    const genres = currentAnimeForQuote.genres?.map(g => g.name) || [];
    const themes = currentAnimeForQuote.themes?.map(t => t.name) || [];
    const demographics = currentAnimeForQuote.demographics?.map(d => d.name) || [];
    const allTags = [...new Set([...genres, ...themes, ...demographics])];

    if (animeDetailsElem) animeDetailsElem.textContent = `${type} | ${episodes || '?'} Episodes | ${aired}`;
    if (animeRatingElem) animeRatingElem.textContent = `Content Rating: ${rating}`;
    if (animeStatusElem) animeStatusElem.textContent = `Status: ${status}`;
    if (animeRankElem) animeRankElem.textContent = rank;
    if (animeTagsElem) animeTagsElem.textContent = allTags.length > 0 ? `Tags: ${allTags.join(', ')}` : "No tags";

  } else {
    if (animeImage) {
        animeImage.src = placeholderPosterUrl;
        animeImage.alt = "Anime poster not available";
    }
    if (animeTitleElem) animeTitleElem.innerHTML = showNameFromQuoteApi;
    if (animeDetailsElem) animeDetailsElem.textContent = "Detailed anime information could not be loaded.";
    if (animeRatingElem) animeRatingElem.textContent = "";
    if (animeStatusElem) animeStatusElem.textContent = "";
    if (animeRankElem) animeRankElem.textContent = "";
    if (animeTagsElem) animeTagsElem.textContent = "";
  }

  applyFadeEffect(elementsToFade, 'remove');
}

function createAnimeCard(anime) {
  const cardLink = document.createElement('a');
  cardLink.href = `#/anime/${anime.mal_id}`;
  cardLink.className = 'anime-card';

  const coverDiv = document.createElement('div');
  coverDiv.className = 'anime-card-cover';

  const img = document.createElement('img');
  img.src = anime.images?.jpg?.image_url || 'assest/placeholder-poster.png';
  img.title = anime.title_english || anime.title || 'Anime Poster';
  img.alt = anime.title_english || anime.title || 'Anime Poster';
  img.loading = 'lazy';
  coverDiv.appendChild(img);

  if (anime.rating) {
    const ratedDiv = document.createElement('div');
    ratedDiv.className = 'anime-card-rated';
    const ratedSmall = document.createElement('small');
    let ratingText = anime.rating || '';
    if (ratingText.includes(' - ')) {
        ratingText = ratingText.substring(0, ratingText.indexOf(' - '));
    }
    ratedSmall.textContent = ratingText;
    ratedDiv.appendChild(ratedSmall);
    coverDiv.appendChild(ratedDiv);
  }
  cardLink.appendChild(coverDiv);

  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'anime-card-body';

  if (anime.status) {
    const statusChip = document.createElement('div');
    statusChip.className = 'chip';
    let statusText = anime.status;
    if (statusText === 'Finished Airing') {
        statusChip.classList.add('status-finished-airing');
    } else if (statusText === 'Currently Airing') {
        statusChip.classList.add('status-currently-airing');
    } else if (statusText === 'Not yet aired') {
        statusChip.classList.add('status-not-yet-aired');
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
    divider.className = 'divider';
    metaDiv.appendChild(divider);
    const episodesSmall = document.createElement('small');
    episodesSmall.textContent = `${anime.episodes} episodes`;
    metaDiv.appendChild(episodesSmall);
  }
  bodyDiv.appendChild(metaDiv);

  const titleH4 = document.createElement('h4'); // Changed from p to h4
  titleH4.className = 'anime-card-title';
  titleH4.textContent = anime.title_english || anime.title || 'Untitled Anime';
  bodyDiv.appendChild(titleH4);

  const ratingDiv = document.createElement('div');
  ratingDiv.className = 'anime-card-rating';

  const scoreDiv = document.createElement('div');
  scoreDiv.className = 'anime-card-score';
  const scoreValDiv = document.createElement('div');
  if(anime.score){
    const scoreSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    scoreSvg.setAttribute('width', '16'); scoreSvg.setAttribute('height', '16'); scoreSvg.setAttribute('viewBox', '0 0 24 24');
    scoreSvg.setAttribute('fill', 'none'); scoreSvg.setAttribute('stroke', 'currentColor'); scoreSvg.setAttribute('stroke-width', '1.5');
    scoreSvg.setAttribute('stroke-linecap', 'round'); scoreSvg.setAttribute('stroke-linejoin', 'round');
    scoreSvg.innerHTML = '<path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"></path>';
    scoreValDiv.appendChild(scoreSvg);
  }
  scoreValDiv.append(` ${anime.score ? anime.score.toFixed(1) : 'N/A'}`); // Example shows 1 decimal
  scoreDiv.appendChild(scoreValDiv);
  const usersSmall = document.createElement('small');
  usersSmall.textContent = `${anime.members ? (anime.members / 1000).toFixed(0) + 'k users' : ''}`;
  scoreDiv.appendChild(usersSmall);
  ratingDiv.appendChild(scoreDiv);

  const rankDiv = document.createElement('div');
  rankDiv.className = 'anime-card-rank';
  const rankValDiv = document.createElement('div');
   if(anime.rank){
    const rankSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    rankSvg.setAttribute('width', '16'); rankSvg.setAttribute('height', '16'); rankSvg.setAttribute('viewBox', '0 0 24 24');
    rankSvg.setAttribute('fill', 'none'); rankSvg.setAttribute('stroke', 'currentColor'); rankSvg.setAttribute('stroke-width', '1.5');
    rankSvg.setAttribute('stroke-linecap', 'round'); rankSvg.setAttribute('stroke-linejoin', 'round');
    rankSvg.innerHTML = '<path d="M5 9l14 0"></path><path d="M5 15l14 0"></path><path d="M11 4l-4 16"></path><path d="M17 4l-4 16"></path>';
    rankValDiv.appendChild(rankSvg);
  }
  rankValDiv.append(` ${anime.rank || 'N/A'}`);
  rankDiv.appendChild(rankValDiv);
  const rankTextSmall = document.createElement('small');
  rankTextSmall.textContent = 'Ranking';
  rankDiv.appendChild(rankTextSmall);
  ratingDiv.appendChild(rankDiv);
  bodyDiv.appendChild(ratingDiv);

  const genresDiv = document.createElement('div');
  genresDiv.className = 'anime-card-genres';
  const genresToShow = (anime.genres || []).slice(0, 2);
  genresToShow.forEach(genre => {
    const genreChip = document.createElement('div');
    genreChip.className = 'chip genre-tag';
    const genreSpan = document.createElement('span');
    genreSpan.textContent = genre.name;
    genreChip.appendChild(genreSpan);
    genresDiv.appendChild(genreChip);
  });
  if (anime.genres && anime.genres.length > 2) {
    const moreChip = document.createElement('div');
    moreChip.className = 'chip genre-tag genre-more';
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

const searchInput = document.getElementById('anime-search-input');
const suggestionsContainer = document.getElementById('search-suggestions');
let searchTimeout;

async function fetchSearchSuggestions(query) {
    if (query.length < 3) {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.style.display = 'none';
        return;
    }
    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5&sfw=true`);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        displaySearchSuggestions(data.data || []);
    } catch (error) {
        console.error("Error fetching search suggestions:", error);
        suggestionsContainer.innerHTML = '<div class="suggestion-item">Error loading suggestions.</div>';
        suggestionsContainer.style.display = 'block';
    }
}

function displaySearchSuggestions(suggestions) {
    suggestionsContainer.innerHTML = '';
    if (suggestions.length === 0) {
        suggestionsContainer.style.display = 'none';
        return;
    }
    suggestions.forEach(anime => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        const img = document.createElement('img');
        img.src = anime.images?.jpg?.small_image_url || 'assest/placeholder-poster.png';
        img.alt = anime.title;
        const titleSpan = document.createElement('span');
        titleSpan.textContent = anime.title_english || anime.title;
        item.appendChild(img);
        item.appendChild(titleSpan);
        item.addEventListener('click', () => {
            window.location.hash = `#/anime/${anime.mal_id}`;
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = 'none';
            searchInput.value = '';
        });
        suggestionsContainer.appendChild(item);
    });
    suggestionsContainer.style.display = 'block';
}

searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value;
    if (query.length === 0) {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.style.display = 'none';
        return;
    }
    searchTimeout = setTimeout(() => {
        fetchSearchSuggestions(query);
    }, 300);
});

document.addEventListener('click', (e) => {
    if (suggestionsContainer && !suggestionsContainer.contains(e.target) && e.target !== searchInput) {
        suggestionsContainer.style.display = 'none';
    }
});

const mainView = document.getElementById('main-view');
const detailView = document.getElementById('detail-view');
const homeIcon = document.getElementById('home-icon');

async function displayAnimeDetailPage(animeId) {
    mainView.style.display = 'none';
    detailView.innerHTML = '<p style="color:#e0d8cc; text-align:center; padding: 50px;">Loading anime details...</p>';
    detailView.style.display = 'block';
    window.scrollTo(0, 0);

    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/full`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const { data: anime } = await response.json();

        if (!anime) {
            detailView.innerHTML = '<p style="color:#e0d8cc; text-align:center; padding: 50px;">Could not load anime details.</p>';
            return;
        }

        let genresHTML = (anime.genres || []).map(g => `<span class="detail-tag">${g.name}</span>`).join('');
        let themesHTML = (anime.themes || []).map(t => `<span class="detail-tag">${t.name}</span>`).join('');
        let demographicsHTML = (anime.demographics || []).map(d => `<span class="detail-tag">${d.name}</span>`).join('');
        
        let trailerHTML = '';
        if (anime.trailer?.embed_url) {
            const embedUrl = anime.trailer.embed_url.includes('?') ? 
                             anime.trailer.embed_url.replace('autoplay=1', 'autoplay=0') + '&enablejsapi=1' : 
                             anime.trailer.embed_url + '?autoplay=0&enablejsapi=1';
            trailerHTML = `
                <div class="detail-trailer-container">
                    <h3>Trailer</h3>
                    <div class="video-responsive">
                        <iframe 
                            src="${embedUrl}" 
                            title="Anime Trailer" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            allowfullscreen>
                        </iframe>
                    </div>
                </div>`;
        }

        const malLinkHTML = anime.url ? `
            <div class="mal-link-container">
                <a href="${anime.url}" target="_blank" rel="noopener noreferrer" class="mal-link">View on MyAnimeList</a>
            </div>` : '';


        detailView.innerHTML = `
            <div class="detail-container">
                <div class="detail-poster-area">
                    <img src="${anime.images?.jpg?.large_image_url || 'assest/placeholder-poster.png'}" alt="${anime.title || 'Anime Poster'}">
                    ${trailerHTML} 
                </div>
                <div class="detail-info-area">
                    <div class="detail-header">
                        <div class="detail-title-group">
                            <h1 class="detail-title">${anime.title_english || anime.title}</h1>
                            ${anime.title_japanese ? `<h2 class="detail-title-japanese">${anime.title_japanese}</h2>` : ''}
                        </div>
                        ${malLinkHTML}
                    </div>
                    
                    <div class="detail-score-rank">
                        ${anime.score ? `<div class="score"><span class="score-value">${anime.score.toFixed(2)}</span><span class="score-label">Score</span></div>` : ''}
                        ${anime.rank ? `<div class="rank"><span class="rank-value">#${anime.rank}</span><span class="rank-label">Ranked</span></div>` : ''}
                        ${anime.popularity ? `<div class="popularity"><span class="popularity-value">#${anime.popularity}</span><span class="popularity-label">Popularity</span></div>` : ''}
                    </div>

                    ${anime.synopsis ? `<div class="detail-synopsis"><h3>Synopsis</h3><p>${anime.synopsis.replace(/\n\n\[Written by MAL Rewrite\]/g, '').replace(/\(Source: .*\)/g, '').trim()}</p></div>` : ''}
                    
                    <div class="detail-meta-grid">
                        ${anime.type ? `<div class="detail-meta-item"><strong>Type:</strong> ${anime.type}</div>` : ''}
                        ${anime.episodes ? `<div class="detail-meta-item"><strong>Episodes:</strong> ${anime.episodes}</div>` : ''}
                        ${anime.status ? `<div class="detail-meta-item"><strong>Status:</strong> ${anime.status}</div>` : ''}
                        ${anime.aired?.string ? `<div class="detail-meta-item"><strong>Aired:</strong> ${anime.aired.string}</div>` : ''}
                        ${anime.duration ? `<div class="detail-meta-item"><strong>Duration:</strong> ${anime.duration}</div>` : ''}
                        ${anime.rating ? `<div class="detail-meta-item"><strong>Rating:</strong> ${anime.rating}</div>` : ''}
                        ${anime.source ? `<div class="detail-meta-item"><strong>Source:</strong> ${anime.source}</div>` : ''}
                        ${(anime.studios || []).length > 0 ? `<div class="detail-meta-item"><strong>Studios:</strong> ${anime.studios.map(s => s.name).join(', ')}</div>` : ''}
                        ${(anime.producers || []).length > 0 ? `<div class="detail-meta-item"><strong>Producers:</strong> ${anime.producers.map(p => p.name).join(', ')}</div>` : ''}
                        ${(anime.licensors || []).length > 0 ? `<div class="detail-meta-item"><strong>Licensors:</strong> ${anime.licensors.map(l => l.name).join(', ')}</div>` : ''}
                    </div>

                    ${genresHTML ? `<div class="detail-tags-container"><h3>Genres</h3><div class="detail-tags">${genresHTML}</div></div>` : ''}
                    ${themesHTML ? `<div class="detail-tags-container"><h3>Themes</h3><div class="detail-tags">${themesHTML}</div></div>` : ''}
                    ${demographicsHTML ? `<div class="detail-tags-container"><h3>Demographics</h3><div class="detail-tags">${demographicsHTML}</div></div>` : ''}
                    
                    <!-- Back to Main button removed as per request -->
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Error fetching anime details:", error);
        detailView.innerHTML = '<p style="color:#e0d8cc; text-align:center; padding: 50px;">Error loading details. Please try again.</p>';
    }
}

function showMainView() {
    detailView.style.display = 'none';
    mainView.style.display = 'block';
    window.location.hash = '';
    window.scrollTo(0, 0);
    const jikanPlaceholderContent = document.getElementById('jikan-placeholder-content');
    const animeApiContent = document.getElementById('anime-api-content');
    if(jikanPlaceholderContent && animeApiContent && animeApiContent.style.display !== 'none') {
        jikanPlaceholderContent.style.display = 'flex'; // Show placeholder on main view
        animeApiContent.style.display = 'none';
    }
}

function handleRouteChange() {
    const hash = window.location.hash;
    if (hash.startsWith('#/anime/')) {
        const animeId = hash.substring('#/anime/'.length);
        if (animeId) {
            displayAnimeDetailPage(animeId);
        } else {
            showMainView();
        }
    } else {
        showMainView();
    }
}

window.addEventListener('hashchange', handleRouteChange);

if (homeIcon) {
    homeIcon.addEventListener('click', (e) => {
        e.preventDefault();
        showMainView();
    });
}

window.addEventListener('DOMContentLoaded', () => {
    handleRouteChange();

    displayTopAnime('top-anime-grid', null, 'Most popular anime could not be loaded.');
    displayTopAnime('top-airing-grid', 'airing', 'Top airing anime could not be loaded.');
    displayTopAnime('top-upcoming-grid', 'upcoming', 'Top upcoming anime could not be loaded.');
});
