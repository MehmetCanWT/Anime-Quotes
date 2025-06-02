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

  [quoteElem, authorElem, showElem, animeImage, animeTitle, animeDetails, animeRating, animeStatus, animeRank, animeTags]
    .forEach(el => el.classList.add('fade'));

  await new Promise(resolve => setTimeout(resolve, 500));

  let item;
  try {
    const response = await fetch('https://yurippe.vercel.app/api/quotes?random=1');
    const data = await response.json();
    item = data[0];
  } catch {
    item = null;
  }

  if (!item) {
    quoteElem.innerText = "Quote could not be loaded.";
    authorElem.innerText = "";
    showElem.textContent = "";
    animeImage.src = "";
    animeImage.alt = "";
    animeTitle.textContent = "";
    animeDetails.textContent = "";
    animeRating.textContent = "";
    animeStatus.textContent = "";
    animeRank.textContent = "";
    animeTags.textContent = "";
    fadeIn();
    return;
  }

  const quoteText = item.quote || "Quote not found.";
  const character = item.character || "Unknown";
  const show = item.show || "Unknown";

  let animeInfo = null;
  try {
    const jikanResponse = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(show)}&limit=1`);
    const jikanData = await jikanResponse.json();
    if (jikanData.data && jikanData.data.length > 0) {
      animeInfo = jikanData.data[0];
    }
  } catch (error) {
    console.error("Jikan API error:", error);
    animeInfo = null;
  }

  quoteElem.innerText = quoteText;
  authorElem.innerText = `– ${character}`;

  if (animeInfo) {
    animeImage.src = animeInfo.images.jpg.maximum_image_url
      || animeInfo.images.jpg.large_image_url
      || animeInfo.images.jpg.image_url
      || "";
    animeImage.alt = animeInfo.title + " poster";

    animeTitle.innerHTML = `<a href="${animeInfo.url}" target="_blank" rel="noopener noreferrer">${animeInfo.title}</a>`;

    const aired = animeInfo.aired?.string || "Unknown air date";
    const episodes = animeInfo.episodes || "Unknown episodes";
    const type = animeInfo.type || "Unknown type";
    const rating = animeInfo.rating || "Unknown rating";
    const status = animeInfo.status || "Unknown status";
    const rank = animeInfo.rank || "No ranking";

    const tags = animeInfo.genres?.map(g => g.name) || [];
    if (animeInfo.themes) {
      const themeNames = animeInfo.themes.map(t => t.name);
      themeNames.forEach(t => {
        if (!tags.includes(t)) tags.push(t);
      });
    }

    animeDetails.textContent = `${type} | Episodes: ${episodes} | Aired: ${aired}`;
    animeRating.textContent = `Rating: ${rating}`;
    animeStatus.textContent = `Status: ${status}`;
    animeRank.textContent = `Ranking: ${rank}`;
    animeTags.textContent = `Tags: ${tags.join(', ')}`;

    showElem.textContent = "";
  } else {
    animeImage.src = "";
    animeImage.alt = "No image available";
    animeTitle.textContent = show;
    animeDetails.textContent = "";
    animeRating.textContent = "";
    animeStatus.textContent = "";
    animeRank.textContent = "";
    animeTags.textContent = "";
    showElem.textContent = show;
  }

  function fadeIn() {
    [quoteElem, authorElem, showElem, animeImage, animeTitle, animeDetails, animeRating, animeStatus, animeRank, animeTags]
      .forEach(el => el.classList.remove('fade'));
  }

  fadeIn();
}

async function fetchTopAnime(category) {
  // Jikan API'de filter parametresi tam desteklenmiyor ama top endpoint bazı filtreler kabul ediyor
  // Aşağıdaki endpointleri Jikan v4 API dökümantasyonuna göre kullandım
  // Eğer hata alırsan endpoint'leri ayrı ayrı denemek gerekebilir

  let url = '';

  switch(category) {
    case 'airing':
      url = 'https://api.jikan.moe/v4/top/anime?type=tv&filter=airing&limit=5';
      break;
    case 'upcoming':
      url = 'https://api.jikan.moe/v4/top/anime?type=tv&filter=upcoming&limit=5';
      break;
    case 'bypopularity':
      url = 'https://api.jikan.moe/v4/top/anime?type=tv&filter=bypopularity&limit=5';
      break;
    case 'favorite':
      url = 'https://api.jikan.moe/v4/top/anime?type=tv&filter=favorite&limit=5';
      break;
    default:
      url = 'https://api.jikan.moe/v4/top/anime?type=tv&limit=5';
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Error fetching ${category}:`, error);
    return [];
  }
}

function renderAnimeList(containerId, animeList) {
  const container = document.querySelector(`#${containerId} .list-content`);
  if (!animeList || animeList.length === 0) {
    container.innerHTML = "No anime found.";
    return;
  }
  let html = '<ol style="padding-left: 20px;">';
  animeList.forEach(anime => {
    html += `<li><a href="${anime.url}" target="_blank" rel="noopener noreferrer" style="color:#00bcd4;">${anime.title}</a> (Score: ${anime.score || "N/A"})</li>`;
  });
  html += '</ol>';
  container.innerHTML = html;
}

function updateAnimeInfo(anime) {
  const animeImage = document.getElementById('anime-image');
  const animeTitle = document.getElementById('anime-title');
  const animeDetails = document.getElementById('anime-details');
  const animeRating = document.getElementById('anime-rating');
  const animeStatus = document.getElementById('anime-status');
  const animeRank = document.getElementById('anime-rank');
  const animeTags = document.getElementById('anime-tags');
  const quoteElem = document.getElementById('quote');
  const authorElem = document.getElementById('author');
  const showElem = document.getElementById('show');

  animeImage.src = anime.images.jpg.large_image_url || anime.images.jpg.image_url || "";
  animeImage.alt = anime.title + " poster";
  animeTitle.innerHTML = `<a href="${anime.url}" target="_blank" rel="noopener noreferrer">${anime.title}</a>`;
  animeDetails.textContent = `${anime.type} | Episodes: ${anime.episodes || "Unknown"} | Aired: ${anime.aired?.string || "Unknown"}`;
  animeRating.textContent = `Rating: ${anime.rating || "Unknown"}`;
  animeStatus.textContent = `Status: ${anime.status || "Unknown"}`;
  animeRank.textContent = `Ranking: ${anime.rank || "No ranking"}`;

  const tags = anime.genres?.map(g => g.name) || [];
  if (anime.themes) {
    anime.themes.forEach(t => {
      if (!tags.includes(t.name)) tags.push(t.name);
    });
  }
  animeTags.textContent = `Tags: ${tags.join(', ')}`;

  // Alıntı ve yazar boşalt
  quoteElem.textContent = "";
  authorElem.textContent = "";
  showElem.textContent = "";
}

async function loadAllTopLists() {
  const categories = [
    { id: 'top-airing', filter: 'airing' },
    { id: 'top-upcoming', filter: 'upcoming' },
    { id: 'most-popular', filter: 'bypopularity' },
    { id: 'highest-rated', filter: 'favorite' }
  ];

  let firstAnime = null;

  for (const cat of categories) {
    const animeList = await fetchTopAnime(cat.filter);
    renderAnimeList(cat.id, animeList);

    if (!firstAnime && animeList.length > 0) {
      firstAnime = animeList[0];
    }
  }

  if (firstAnime) {
    updateAnimeInfo(firstAnime);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadAllTopLists();
});
