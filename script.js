// Yeni anime alır ve sayfaya yansıtır
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

  // Fade out animasyonu
  [quoteElem, authorElem, showElem, animeImage, animeTitle, animeDetails, animeRating, animeStatus, animeRank, animeTags]
    .forEach(el => el.classList.add('fade'));

  await new Promise(resolve => setTimeout(resolve, 500));

  let quoteData;
  try {
    const response = await fetch('https://yurippe.vercel.app/api/quotes?random=1');
    const data = await response.json();
    quoteData = data[0];
  } catch {
    quoteData = null;
  }

  if (!quoteData) {
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

  const quoteText = quoteData.quote || "Quote not found.";
  const character = quoteData.character || "Unknown";
  const showName = quoteData.show || "Unknown";

  // Quote ve yazar bilgileri
  quoteElem.innerText = `"${quoteText}"`;
  authorElem.innerText = `- ${character}`;
  showElem.innerText = `From: ${showName}`;

  // Jikan API ile anime bilgilerini çek
  try {
    const jikanResponse = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(showName)}&limit=1`);
    const jikanData = await jikanResponse.json();
    if (jikanData && jikanData.data && jikanData.data.length > 0) {
      const anime = jikanData.data[0];
      animeImage.src = anime.images?.jpg?.large_image_url || '';
      animeImage.alt = anime.title || 'Anime Image';
      animeTitle.textContent = anime.title || '';
      animeDetails.textContent = `Episodes: ${anime.episodes || '?'} | Duration: ${anime.duration || '?'}`;
      animeRating.textContent = `Score: ${anime.score || '?'}`;
      animeStatus.textContent = `Status: ${anime.status || '?'}`;
      animeRank.textContent = `Rank: ${anime.rank || '?'}`;
      animeTags.textContent = `Genres: ${anime.genres?.map(g => g.name).join(', ') || '?'}`;
    } else {
      animeImage.src = '';
      animeImage.alt = '';
      animeTitle.textContent = '';
      animeDetails.textContent = '';
      animeRating.textContent = '';
      animeStatus.textContent = '';
      animeRank.textContent = '';
      animeTags.textContent = '';
    }
  } catch {
    // Hata durumunda anime bilgilerini temizle
    animeImage.src = '';
    animeImage.alt = '';
    animeTitle.textContent = '';
    animeDetails.textContent = '';
    animeRating.textContent = '';
    animeStatus.textContent = '';
    animeRank.textContent = '';
    animeTags.textContent = '';
  }

  fadeIn();
}

function fadeIn() {
  const elems = [document.getElementById('quote'), document.getElementById('author'), document.getElementById('show'),
    document.getElementById('anime-image'), document.getElementById('anime-title'), document.getElementById('anime-details'),
    document.getElementById('anime-rating'), document.getElementById('anime-status'), document.getElementById('anime-rank'),
    document.getElementById('anime-tags')];

  elems.forEach(el => el.classList.remove('fade'));
}

// Top anime listelerini çeken fonksiyon
async function loadTopList(listType, containerId) {
  const container = document.querySelector(`#${containerId} .list-content`);
  container.textContent = 'Loading...';

  // Jikan API endpointleri
  let endpoint = '';
  switch(listType) {
    case 'top-airing':
      endpoint = 'https://api.jikan.moe/v4/top/anime?filter=airing&limit=10';
      break;
    case 'top-upcoming':
      endpoint = 'https://api.jikan.moe/v4/top/anime?filter=upcoming&limit=10';
      break;
    case 'most-popular':
      endpoint = 'https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=10';
      break;
    case 'highest-rated':
      endpoint = 'https://api.jikan.moe/v4/top/anime?filter=rating&limit=10';
      break;
    default:
      container.textContent = 'Invalid list type';
      return;
  }

  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    if (data && data.data && data.data.length > 0) {
      const listHtml = data.data.map((anime, i) =>
        `<li><a href="${anime.url}" target="_blank" rel="noopener noreferrer">${i + 1}. ${anime.title}</a></li>`
      ).join('');
      container.innerHTML = `<ol>${listHtml}</ol>`;
    } else {
      container.textContent = 'No data found.';
    }
  } catch (error) {
    container.textContent = 'Failed to load list.';
  }
}

function loadAllTopLists() {
  loadTopList('top-airing', 'top-airing');
  loadTopList('top-upcoming', 'top-upcoming');
  loadTopList('most-popular', 'most-popular');
  loadTopList('highest-rated', 'highest-rated');
}
