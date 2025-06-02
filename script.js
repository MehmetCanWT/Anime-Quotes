// script.js dosyasındaki getQuote fonksiyonunun ilgili kısımları:

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

  // Varsayılan poster yolu (projenizdeki yola göre güncelleyin)
  const placeholderPosterUrl = 'placeholder-poster.png';

  const allElements = [
    quoteElem, authorElem, showElem, animeImage, animeTitle,
    animeDetails, animeRating, animeStatus, animeRank, animeTags
  ];

  applyFadeEffect(allElements, 'add');
  // Poster için de hemen bir placeholder atayabiliriz veya hata durumunda
  if (animeImage) {
      animeImage.src = placeholderPosterUrl; // Yükleme başlarken placeholder
      animeImage.alt = "Loading anime poster...";
  }
  await new Promise(resolve => setTimeout(resolve, 300)); // Fade için bekleme

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
        animeImage.src = placeholderPosterUrl; // Hata durumunda placeholder
        animeImage.alt = "Anime poster not available";
    }
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
      // API'den gelen resim varsa onu kullan, yoksa placeholder'ı kullan
      animeImage.src = animeInfo.images?.jpg?.large_image_url
                    || animeInfo.images?.jpg?.image_url
                    || placeholderPosterUrl; // API'den resim gelmezse placeholder
      animeImage.alt = (animeInfo.title_english || animeInfo.title || showNameFromQuoteApi) + " poster";
    }
    // ... (animeInfo'nun geri kalanını doldurma kodları aynı kalacak) ...
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

  } else { // Jikan API'den bilgi gelmediyse veya hata oluştuysa
    if (animeImage) {
        animeImage.src = placeholderPosterUrl; // Hata durumunda placeholder
        animeImage.alt = "Anime poster not available";
    }
    if (animeTitle) animeTitle.textContent = showNameFromQuoteApi; // Sadece quote API'sinden gelen anime adını göster
    if (animeDetails) animeDetails.textContent = "Detailed anime information could not be loaded.";
    if (animeRating) animeRating.textContent = "";
    if (animeStatus) animeStatus.textContent = "";
    if (animeRank) animeRank.textContent = "";
    if (animeTags) animeTags.textContent = "";
  }

  applyFadeEffect(allElements, 'remove');
}

// ... (script.js dosyanızın geri kalanı) ...
