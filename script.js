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

window.addEventListener('DOMContentLoaded', () => {
  getQuote();
});
